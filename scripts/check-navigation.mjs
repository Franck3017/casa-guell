// Navegación, con un navegador de verdad: que los cambios de página y de idioma arrancan su transición
// (View Transitions) y dejan el scroll donde toca, también al volver atrás. Nada de esto se ve en las
// pruebas de lógica ni en el HTML generado. Lo usa check-runtime.mjs, que pone el navegador y la web.

// Dónde queda una sección a la que se llega por su ancla: el scroll-padding-top de la web (6,5rem)
const ANCHOR_TOP = 104
const near = (value, target, margin = 3) => value != null && Math.abs(value - target) <= margin

/**
 * Recorre portada → información legal → portada → atrás → otro idioma y devuelve lo que no ha salido
 * como debía, una frase por fallo. Sin fallos, una lista vacía.
 */
export async function checkNavigation (browser, origin) {
  const failures = []
  const check = (ok, what) => { if (!ok) failures.push(what) }

  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } })
  const page = await context.newPage()
  // Cuenta las transiciones que arranca la web. Se instala en cada documento nuevo: si la página se
  // recargase, la cuenta volvería a cero y la marca de «mismo documento» desaparecería.
  await page.addInitScript(() => {
    window.__transitions = 0
    const start = document.startViewTransition?.bind(document)
    if (start != null) document.startViewTransition = (update) => { window.__transitions++; return start(update) }
  })

  const look = () => page.evaluate(() => {
    const top = (id) => { const el = document.getElementById(id); return el == null ? null : Math.round(el.getBoundingClientRect().top) }
    return {
      sameDocument: window.__sameDocument === true,
      transitions: window.__transitions,
      scrollY: Math.round(window.scrollY),
      lang: document.documentElement.lang,
      // La sección que ocupa el centro de la pantalla
      section: document.elementFromPoint(640, 400)?.closest('section[id]')?.id ?? null,
      top: { privacidad: top('privacidad'), cookies: top('cookies'), carta: top('carta') }
    }
  })
  // Espera a que acaben la transición y el desplazamiento: diez fotogramas seguidos sin que nada se mueva
  const settle = () => page.evaluate(() => new Promise((resolve) => {
    let last = -1
    let still = 0
    let frames = 0
    const tick = () => {
      const moving = document.documentElement.matches(':active-view-transition') || window.scrollY !== last
      last = window.scrollY
      still = moving ? 0 : still + 1
      if (still >= 10 || ++frames > 600) resolve()
      else requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }))
  const jumpTo = (id) => page.evaluate((target) => document.getElementById(target)?.scrollIntoView({ behavior: 'instant' }), id)
  // Hace algo que cambia la dirección, espera a llegar a `url` y a que todo se quede quieto, y dice cómo queda
  const arrive = async (url, action) => {
    await action()
    await page.waitForURL(url)
    await settle()
    return await look()
  }

  try {
    await page.goto(`${origin}/es`, { waitUntil: 'networkidle' })
    await page.evaluate(() => { window.__sameDocument = true })

    // 1. Del pie de la portada a un documento legal. El código de esa página se descarga cuando sus
    //    enlaces asoman; con él ya en casa, el cambio lleva transición.
    const legalCode = page.waitForResponse((res) => /\/assets\/legal-[^/]+\.js$/.test(new URL(res.url()).pathname), { timeout: 10_000 }).catch(() => null)
    const toPrivacy = page.locator('footer a[href="/es/legal#privacidad"]')
    await toPrivacy.scrollIntoViewIfNeeded()
    await legalCode
    await page.waitForTimeout(250)
    const leftHomeAt = (await look()).scrollY
    let now = await arrive('**/es/legal#privacidad', () => toPrivacy.click())
    check(now.sameDocument, 'portada → legal: la página se ha recargado')
    check(now.transitions === 1, `portada → legal: se esperaba 1 transición y van ${now.transitions}`)
    check(near(now.top.privacidad, ANCHOR_TOP), `portada → legal: «Privacidad» queda a ${now.top.privacidad} px del borde, no a ${ANCHOR_TOP}`)

    // 2. De un documento a otro dentro de la página legal: se va desplazando, sin transición
    now = await arrive('**/es/legal#cookies', () => page.locator('footer a[href="/es/legal#cookies"]').click())
    check(now.transitions === 1, `legal → otro documento: no debe haber transición y van ${now.transitions}`)
    check(near(now.top.cookies, ANCHOR_TOP), `legal → otro documento: «Cookies» queda a ${now.top.cookies} px del borde, no a ${ANCHOR_TOP}`)

    // 3. Del menú de la página legal a una sección de la portada: sin recargar y ya colocado. Se sale
    //    desde un punto que no es ningún ancla, para comprobar después que «atrás» vuelve justo ahí.
    const leftLegalAt = 700
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), leftLegalAt)
    await settle()
    now = await arrive('**/es#carta', () => page.locator('header nav a[href="/es#carta"]').first().click())
    check(now.sameDocument, 'legal → portada: la página se ha recargado')
    check(now.transitions === 2, `legal → portada: se esperaban 2 transiciones y van ${now.transitions}`)
    check(near(now.top.carta, ANCHOR_TOP), `legal → portada: la carta queda a ${now.top.carta} px del borde, no a ${ANCHOR_TOP}`)

    // 4. Atrás, dos veces: se vuelve a cada página donde se dejó
    now = await arrive('**/es/legal#cookies', () => page.goBack())
    check(near(now.scrollY, leftLegalAt), `atrás a legal: el scroll queda en ${now.scrollY}; se dejó en ${leftLegalAt}`)
    now = await arrive(/\/es$/, async () => { await page.goBack(); await page.goBack() })
    check(near(now.scrollY, leftHomeAt), `atrás a la portada: el scroll queda en ${now.scrollY}; se dejó en ${leftHomeAt}`)

    // 5. Cambio de idioma: con transición y sin moverse del sitio. Se mira desde una sección que no es
    //    la del ancla de la dirección, para distinguir «quedarse» de «volver al ancla».
    await arrive('**/es/legal#privacidad', () => page.goForward())
    await jumpTo('consumidor')
    await settle()
    const before = await look()
    now = await arrive('**/ca/legal#privacidad', async () => {
      await page.getByRole('button', { name: /^Idioma/ }).click()
      await page.getByRole('radio', { name: /Català/ }).click()
    })
    check(now.sameDocument, 'cambio de idioma: la página se ha recargado')
    check(now.lang === 'ca', `cambio de idioma: la página queda en «${now.lang}», no en «ca»`)
    check(now.transitions === before.transitions + 1, `cambio de idioma: se esperaba una transición más (${before.transitions + 1}) y van ${now.transitions}`)
    check(before.section === 'consumidor' && now.section === 'consumidor', `cambio de idioma: se estaba en «${before.section}» y se acaba en «${now.section}»`)
  } catch (error) {
    failures.push(`el recorrido se ha interrumpido: ${error.message.split('\n')[0]}`)
  } finally {
    await context.close()
  }
  return failures
}
