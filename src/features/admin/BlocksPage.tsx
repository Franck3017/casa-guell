import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { splitBlocks, type Block } from './blocks'
import { longDate, today } from './dates'
import { FIELD, LABEL, PRIMARY, QUIET } from './styles'
import { EmptyState, ErrorNotice, SkeletonRows } from './ui'
import { useDocumentTitle } from './useDocumentTitle'

/**
 * Cierres: los días en que el restaurante no admite reservas. Arriba se añade uno; debajo, los que quedan
 * por llegar y, plegados, los que ya han pasado.
 * Eliminar un cierre vuelve a abrir ese día a las reservas, así que pide confirmación en la propia fila.
 */
export function BlocksPage () {
  useDocumentTitle('Cierres')
  const dateId = useId()
  const reasonId = useId()

  // undefined mientras carga; null si la carga ha fallado
  const [blocks, setBlocks] = useState<Block[] | null | undefined>(undefined)
  const [reloads, setReloads] = useState(0)
  const [newDate, setNewDate] = useState('')
  const [newReason, setNewReason] = useState('')
  const [adding, setAdding] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    let current = true
    void supabase
      .from('blocks')
      .select('*')
      .order('block_date', { ascending: true })
      .then(({ data, error }) => {
        if (current) setBlocks(error != null || data == null ? null : data as Block[])
      })
    return () => { current = false }
  }, [reloads])

  const reload = (): void => setReloads((n) => n + 1)

  const addBlock = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    if (newDate === '') return
    setAdding(true)
    setProblem(null)

    const { error } = await supabase.from('blocks').insert({ block_date: newDate, reason: newReason.trim() || null })

    setAdding(false)
    if (error != null) {
      setProblem('No se ha podido añadir el cierre. Si ese día ya estaba cerrado, aparece en la lista de abajo.')
      return
    }
    setAnnouncement(`Cierre añadido: ${longDate(newDate, { year: true })}`)
    setNewDate('')
    setNewReason('')
    reload()
  }

  const deleteBlock = async (block: Block): Promise<void> => {
    setDeletingId(block.id)
    setProblem(null)

    const { error } = await supabase.from('blocks').delete().eq('id', block.id)

    setDeletingId(null)
    setConfirmingId(null)
    if (error != null) {
      setProblem('No se ha podido eliminar el cierre. Comprueba la conexión y vuelve a intentarlo.')
      return
    }
    setBlocks((list) => list?.filter((b) => b.id !== block.id))
    setAnnouncement(`Cierre eliminado: ${longDate(block.block_date, { year: true })}`)
  }

  const { upcoming, past } = splitBlocks(blocks ?? [], today())
  const row = (block: Block) => (
    <BlockRow
      key={block.id}
      block={block}
      confirming={confirmingId === block.id}
      deleting={deletingId === block.id}
      onAsk={() => setConfirmingId(block.id)}
      onKeep={() => setConfirmingId(null)}
      onDelete={() => { void deleteBlock(block) }}
    />
  )

  return (
    <div>
      <h1 className='font-display text-3xl text-ink sm:text-4xl'>Cierres</h1>
      <p className='mt-2 max-w-prose text-base text-ink/80'>
        Días en que el restaurante no admite reservas: festivos, vacaciones o eventos privados.
      </p>

      <form onSubmit={(e) => { void addBlock(e) }} className='mt-8 grid gap-4 border-y border-ink/15 py-6 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-end'>
        <div className='space-y-1.5'>
          <label htmlFor={dateId} className={LABEL}>Día</label>
          <input
            id={dateId}
            type='date'
            name='dia'
            value={newDate}
            min={today()}
            onChange={(e) => setNewDate(e.target.value)}
            required
            className={`${FIELD} w-full`}
          />
        </div>
        <div className='space-y-1.5'>
          <label htmlFor={reasonId} className={LABEL}>Motivo (opcional)</label>
          <input
            id={reasonId}
            type='text'
            name='motivo'
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
            maxLength={120}
            autoComplete='off'
            placeholder='Evento privado…'
            className={`${FIELD} w-full placeholder:text-ink/60`}
          />
        </div>
        <button type='submit' disabled={adding} className={PRIMARY}>
          <Plus aria-hidden='true' size={16} strokeWidth={2} />
          {adding ? 'Añadiendo…' : 'Añadir cierre'}
        </button>
      </form>

      <p role='status' className='sr-only'>{announcement}</p>
      {problem != null && <div className='mt-6'><ErrorNotice>{problem}</ErrorNotice></div>}

      <div className='mt-8'>
        {blocks === undefined && <SkeletonRows rows={3} label='Cargando los cierres…' />}

        {blocks === null && (
          <ErrorNotice action={<button type='button' onClick={reload} className={QUIET}>Reintentar</button>}>
            No se han podido cargar los cierres. Comprueba la conexión y vuelve a intentarlo.
          </ErrorNotice>
        )}

        {blocks != null && upcoming.length === 0 && (
          <EmptyState
            title='No hay cierres programados.'
            hint='Añade arriba los días en que no se puede reservar. Los lunes y martes ya figuran como cerrados.'
          />
        )}

        {upcoming.length > 0 && (
          <section>
            <h2 className='border-b border-ink/60 pb-2 font-body text-base font-semibold tracking-normal text-ink'>Próximos</h2>
            <ul className='divide-y divide-ink/10'>{upcoming.map(row)}</ul>
          </section>
        )}

        {past.length > 0 && (
          <details className='mt-10'>
            <summary className='group inline-flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-medium text-ink/70 hover:text-ink [&::-webkit-details-marker]:hidden'>
              <ChevronDown aria-hidden='true' size={16} strokeWidth={1.8} className='transition-transform duration-200 motion-reduce:transition-none [details[open]_&]:rotate-180' />
              Cierres pasados ({past.length})
            </summary>
            <ul className='divide-y divide-ink/10 border-t border-ink/15'>{past.map(row)}</ul>
          </details>
        )}
      </div>
    </div>
  )
}

interface BlockRowProps {
  block: Block
  confirming: boolean
  deleting: boolean
  onAsk: () => void
  onKeep: () => void
  onDelete: () => void
}

function BlockRow ({ block, confirming, deleting, onAsk, onKeep, onDelete }: BlockRowProps) {
  const date = longDate(block.block_date, { year: true })
  const askRef = useRef<HTMLButtonElement>(null)
  const keepRef = useRef<HTMLButtonElement>(null)
  const wasConfirming = useRef(false)

  // Al pedir confirmación el foco pasa a la opción que no borra nada (confirmar exige un gesto más); al
  // desistir vuelve al botón de eliminar, que es de donde venía. Sin esto se perdería al cambiar los botones.
  useEffect(() => {
    if (confirming) keepRef.current?.focus()
    else if (wasConfirming.current) askRef.current?.focus()
    wasConfirming.current = confirming
  }, [confirming])

  return (
    <li className='flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4'>
      <div className='min-w-0'>
        <p className='text-base font-semibold text-ink first-letter:uppercase'>{date}</p>
        {(block.reason != null || block.slot != null) && (
          <p className='mt-0.5 break-words text-sm text-ink/70'>
            {[block.slot, block.reason].filter(Boolean).join(', ')}
          </p>
        )}
      </div>

      {confirming
        ? (
          <div className='flex flex-wrap items-center gap-2' onKeyDown={(e) => { if (e.key === 'Escape') onKeep() }}>
            <p className='mr-1 text-sm text-ink'>¿Volver a abrir este día?</p>
            <button type='button' ref={keepRef} onClick={onKeep} disabled={deleting} className={QUIET}>Conservar</button>
            <button type='button' onClick={onDelete} disabled={deleting} className={PRIMARY}>
              {deleting ? 'Eliminando…' : 'Eliminar cierre'}
            </button>
          </div>
          )
        : (
          <button type='button' ref={askRef} onClick={onAsk} aria-label={`Eliminar el cierre del ${date}`} className={QUIET}>Eliminar</button>
          )}
    </li>
  )
}
