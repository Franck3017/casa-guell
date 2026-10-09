// src/components/ui/Logo.tsx

/**
 * Cada palabra del logotipo es una silueta (canal alfa) que se rellena con un color del tema. El archivo de
 * cada silueta lo decide el CSS (--logo-casa y --logo-guell en globals.css), que en pantallas estrechas
 * sirve una versión más ligera.
 */
const PARTS = [
  { word: 'Casa', mask: 'var(--logo-casa)', ratio: '557 / 205', brand: true },
  { word: 'Güell', mask: 'var(--logo-guell)', ratio: '548 / 205', brand: false }
] as const

interface LogoProps {
  /**
   * `brand`: «Casa» en azul y «Güell» en tinta, como el original. `mono`: las dos palabras heredan el
   * color del texto (para usarlo como marca de agua).
   */
  tone?: 'brand' | 'mono'
  /** Pone `data-word` en cada palabra para que la coreografía de scroll las anime por separado. */
  animated?: boolean
  /** El alto del logotipo es 1em: su tamaño se fija con el tamaño de letra. */
  className?: string
}

/**
 * Logotipo de Casa Güell. El archivo original es una imagen con «Güell» en negro, que desaparecería en
 * el tema oscuro; por eso se usa como máscara y el color sale de los tokens, igual que el resto de la web.
 */
export function Logo ({ tone = 'brand', animated = false, className = '' }: LogoProps) {
  return (
    <span role='img' aria-label='Casa Güell' className={`inline-flex items-end leading-none ${className}`}>
      {PARTS.map(({ word, mask, ratio, brand }) => (
        <span
          key={word}
          aria-hidden='true'
          data-word={animated ? '' : undefined}
          className={`block h-[1em] ${tone === 'mono' ? 'bg-current' : brand ? 'bg-brand' : 'bg-ink'}`}
          style={{
            aspectRatio: ratio,
            maskImage: mask,
            WebkitMaskImage: mask,
            maskSize: '100% 100%',
            WebkitMaskSize: '100% 100%',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat'
          }}
        />
      ))}
    </span>
  )
}
