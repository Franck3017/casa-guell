// Cierres: días en los que el restaurante no admite reservas (festivos, eventos privados).

export interface Block {
  id: string
  block_date: string
  slot: string | null
  reason: string | null
  created_at: string
}

/** Los cierres de hoy en adelante, por orden de llegada, y los que ya han pasado, del más reciente al más antiguo. */
export function splitBlocks (blocks: Block[], today: string): { upcoming: Block[], past: Block[] } {
  const byDate = [...blocks].sort((a, b) => a.block_date.localeCompare(b.block_date))
  return {
    upcoming: byDate.filter((block) => block.block_date >= today),
    past: byDate.filter((block) => block.block_date < today).reverse()
  }
}
