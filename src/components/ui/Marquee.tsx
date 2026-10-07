// src/components/ui/Marquee.tsx
// Cinta cinética: dos copias de la misma lista para que el bucle no tenga costura. Es decorativa
// (repite ideas que ya están en el texto), así que se oculta a los lectores de pantalla.
export function Marquee ({ items, reverse = false }: { items: readonly string[], reverse?: boolean }) {
  return (
    <div aria-hidden='true' className='overflow-clip py-10 md:py-16'>
      <div data-marquee={reverse ? 'reverse' : 'forward'} className='flex w-max'>
        {[0, 1].map((copy) => (
          <ul key={copy} className='flex shrink-0 items-center'>
            {items.map((item, i) => (
              <li key={item} className='flex items-center'>
                <span className={`whitespace-nowrap font-display text-[clamp(3rem,9vw,7.5rem)] leading-none tracking-[-0.04em] ${i % 2 === 0 ? 'text-ink' : 'marquee-outline italic'}`}>
                  {item}
                </span>
                <span className='mx-[4vw] inline-block size-[clamp(0.6rem,1.4vw,1.1rem)] rounded-full bg-brand md:mx-12' />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}
