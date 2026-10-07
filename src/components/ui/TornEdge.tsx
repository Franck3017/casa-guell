// src/components/ui/TornEdge.tsx
// Canto de papel rasgado para el borde de una franja tintada. El padre debe ser `relative`.
export function TornEdge ({ side = 'top' }: { side?: 'top' | 'bottom' }) {
  return <div aria-hidden='true' className={side === 'top' ? 'torn-edge' : 'torn-edge torn-edge--bottom'} />
}
