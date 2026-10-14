import type { LegalContent } from './types'

// Textos legales en castellano. Lo que va entre llaves ({holder}, {nif}…) son los datos del titular, que
// viven en ../entity.ts. Describen lo que la web y el sistema de reservas hacen de verdad: si eso cambia
// (un proveedor nuevo, otro plazo de conservación), hay que cambiar el texto.
export const es: LegalContent = {
  updatedLabel: 'Última actualización',
  pendingLabel: 'pendiente de completar',
  pendingNotice: 'Faltan datos del titular. Hasta que estén, este documento no está completo.',
  noticesTitle: 'Antes de pedir',
  docs: [
    {
      id: 'aviso-legal',
      title: 'Aviso legal',
      blocks: [
        {
          heading: 'Quién es el titular',
          paragraphs: [
            'Esta web es de {holder}, con NIF {nif} y domicilio en {address}. Puedes escribirnos a {email} o llamarnos al {phone}.',
            'Datos registrales: {registry}.'
          ]
        },
        {
          heading: 'Para qué sirve esta web',
          paragraphs: [
            'Presenta el restaurante Casa Güell, su carta y su horario, y permite pedir mesa. La carta y los precios que valen son los del local el día de tu visita: los de la web se mantienen al día, pero pueden cambiar.'
          ]
        },
        {
          heading: 'Reservas',
          paragraphs: [
            'Una reserva pedida en la web es una solicitud: no está confirmada hasta que te llamamos o te escribimos. Para cambiarla o anularla, llámanos al {phone}.'
          ]
        },
        {
          heading: 'Textos, fotos y marca',
          paragraphs: [
            'Los textos, las fotografías, el diseño y la marca Casa Güell son de su titular o se usan con permiso. No pueden reproducirse con fines comerciales sin autorización.'
          ]
        },
        {
          heading: 'Enlaces a otros sitios',
          paragraphs: [
            'La web enlaza a Instagram, TikTok y Google Maps. Lo que ocurra allí se rige por las condiciones de cada uno.'
          ]
        },
        {
          heading: 'Ley aplicable',
          paragraphs: [
            'Esta web se rige por la ley española. Si eres consumidor, cualquier desacuerdo se resolverá en los juzgados de tu domicilio.'
          ]
        }
      ]
    },
    {
      id: 'privacidad',
      title: 'Política de privacidad',
      blocks: [
        {
          heading: 'Quién responde de tus datos',
          paragraphs: [
            'El responsable es {holder}, con NIF {nif} y domicilio en {address}. Para cualquier cosa sobre tus datos, escribe a {email}.'
          ]
        },
        {
          heading: 'Qué datos tratamos y para qué',
          paragraphs: [
            'Cuando pides mesa: tu nombre, tu teléfono, tu correo si lo dejas, el día, la hora, cuántos venís y las notas que escribas. Los usamos para gestionar la reserva, llamarte para confirmarla y, si has dejado correo, enviarte el acuse, la confirmación y un recordatorio el día antes. Lo hacemos porque nos lo pides al solicitar la reserva.',
            'Si en las notas nos indicas una alergia o una intolerancia, es un dato de salud. Lo usamos solo para atenderte en esa visita y lo tratamos con tu consentimiento, que nos das al escribirlo. Si prefieres no dejarlo por escrito, dínoslo por teléfono o en el local.',
            'Para evitar reservas falsas o repetidas guardamos un resumen irreversible de la dirección IP desde la que se pide cada reserva. No permite saber quién eres ni recuperar la dirección, y se borra cuando pasa el día de la reserva. Lo hacemos por nuestro interés legítimo en proteger el sistema de reservas.',
            'Cuando te apuntas al aviso del producto del día: tu correo, para enviártelo. Lo hacemos con tu consentimiento y puedes darte de baja cuando quieras.'
          ]
        },
        {
          heading: 'Cuánto tiempo los guardamos',
          paragraphs: [
            'Los datos de una reserva se conservan {retention}. El correo del aviso diario, hasta que te des de baja.'
          ]
        },
        {
          heading: 'Quién más los ve',
          paragraphs: [
            'No vendemos ni cedemos tus datos. Trabajamos con proveedores que los tratan por encargo nuestro: Supabase (base de datos de reservas, alojada en la Unión Europea), Resend (envío de los correos de la reserva), Formspree (alta en el aviso diario) y Vercel (alojamiento de la web).',
            'El mapa de la sección de ubicación se carga desde CARTO, que recibe tu dirección IP al mostrarlo.',
            'Algunos de estos proveedores tienen sede en Estados Unidos. En ese caso los datos viajan con las garantías que exige el Reglamento General de Protección de Datos.'
          ]
        },
        {
          heading: 'Tus derechos',
          paragraphs: [
            'Puedes pedirnos ver tus datos, corregirlos, borrarlos, limitar su uso, oponerte a él o llevártelos, y retirar un consentimiento que hayas dado. Escríbenos a {email} diciendo qué necesitas.',
            'Si crees que no hemos atendido bien tu petición, puedes reclamar ante la Agencia Española de Protección de Datos.'
          ],
          links: [{ label: 'Agencia Española de Protección de Datos', href: 'https://www.aepd.es' }]
        }
      ]
    },
    {
      id: 'cookies',
      title: 'Cookies y almacenamiento',
      blocks: [
        {
          heading: 'Sin publicidad ni seguimiento',
          paragraphs: [
            'Esta web no usa cookies de publicidad ni de medición, y no hay ninguna herramienta que siga lo que haces en ella. Por eso no te pedimos que aceptes nada al entrar.'
          ]
        },
        {
          heading: 'Lo que sí se guarda en tu navegador',
          paragraphs: [
            'Solo lo que tú eliges. El idioma, si lo cambias: una cookie y un dato local llamados cg-locale, durante un año. Y el tema claro u oscuro, si lo cambias: un dato local llamado cg-theme. Puedes borrarlos desde los ajustes del navegador.',
            'El panel interno del restaurante guarda la sesión de quien entra en él. No afecta a quien visita la web.'
          ]
        },
        {
          heading: 'Lo que viene de otros sitios',
          paragraphs: [
            'El mapa se carga desde CARTO, que recibe tu dirección IP al mostrarlo. Los enlaces a Instagram, TikTok y Google Maps no cargan nada hasta que los pulsas.'
          ]
        }
      ]
    },
    {
      id: 'consumidor',
      title: 'Alérgenos e información al consumidor',
      blocks: [
        {
          heading: 'Alérgenos',
          paragraphs: [
            'El Reglamento (UE) 1169/2011 obliga a informar de catorce alérgenos. La carta señala con un icono los que la cocina ha declarado en cada plato. Los iconos son una ayuda y no sustituyen la consulta: las recetas cambian con el mercado y puede haber alérgenos sin icono. Pregunta siempre al personal antes de pedir.'
          ]
        },
        {
          heading: 'Precios',
          paragraphs: [
            'Los precios de la carta incluyen el IVA. El producto de mercado no tiene precio fijo: pregúntalo antes de pedir y te lo diremos por pieza o por peso.'
          ]
        },
        {
          heading: 'Agua, sobras y reclamaciones',
          paragraphs: [
            'Puedes pedir agua del grifo sin coste.',
            'Lo que no te termines te lo preparamos para llevar.',
            'En el local hay hojas oficiales de queja, reclamación y denuncia a tu disposición.'
          ]
        },
        {
          heading: 'Alcohol',
          paragraphs: ['No servimos bebidas alcohólicas a menores de 18 años.']
        },
        {
          heading: 'Dónde informarte',
          paragraphs: ['Estos organismos explican tus derechos y vigilan que se cumplan.'],
          links: [
            { label: 'Agencia Española de Seguridad Alimentaria y Nutrición (AESAN)', href: 'https://www.aesan.gob.es' },
            { label: 'Agència Catalana del Consum', href: 'https://consum.gencat.cat' },
            { label: 'Agència de Salut Pública de Catalunya', href: 'https://salutpublica.gencat.cat' }
          ]
        }
      ]
    }
  ]
}
