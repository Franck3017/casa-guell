import { Minus, Plus } from 'lucide-react'
import { ICON_BUTTON } from '@/components/ui/controls'

interface PartyStepperProps {
  value: number
  min: number
  max: number
  /** id del texto que nombra el grupo. */
  labelledBy: string
  /** «persona» o «personas», ya concordado con el número. */
  noun: string
  fewerLabel: string
  moreLabel: string
  onChange: (people: number) => void
}

/**
 * Cuántos vienen: un número grande entre un menos y un más. Para elegir entre una y doce personas son dos
 * toques como mucho en lo habitual (dos, tres, cuatro), sin abrir ninguna lista.
 */
export function PartyStepper ({ value, min, max, labelledBy, noun, fewerLabel, moreLabel, onChange }: PartyStepperProps) {
  return (
    <div role='group' aria-labelledby={labelledBy} className='flex items-center gap-4'>
      <button type='button' aria-label={fewerLabel} disabled={value <= min} onClick={() => onChange(value - 1)} className={ICON_BUTTON}>
        <Minus aria-hidden='true' size={16} strokeWidth={2} />
      </button>
      {/* Se anuncia al cambiar: quien no ve el número oye «3 personas» */}
      <output aria-live='polite' className='flex min-w-28 items-baseline justify-center gap-2'>
        <span className='font-display text-4xl leading-none text-ink'>{value}</span>
        <span className='text-sm text-ink/70'>{noun}</span>
      </output>
      <button type='button' aria-label={moreLabel} disabled={value >= max} onClick={() => onChange(value + 1)} className={ICON_BUTTON}>
        <Plus aria-hidden='true' size={16} strokeWidth={2} />
      </button>
    </div>
  )
}
