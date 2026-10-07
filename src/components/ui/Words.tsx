// src/components/ui/Words.tsx
// Parte un texto en palabras animables. Con `mask`, cada palabra vive dentro de una ventana que la
// recorta en vertical (para subir desde abajo); el margen negativo devuelve el espacio de los descendentes.
export function Words ({ text, mask = false }: { text: string, mask?: boolean }) {
  return (
    <>
      {text.split(' ').map((word, i) => (
        <span key={`${word}-${i}`}>
          {i > 0 && ' '}
          {mask
            ? (
              <span className='-mb-[0.18em] inline-block overflow-y-clip pb-[0.18em] align-bottom'>
                <span data-word className='inline-block'>{word}</span>
              </span>
              )
            : <span data-word>{word}</span>}
        </span>
      ))}
    </>
  )
}
