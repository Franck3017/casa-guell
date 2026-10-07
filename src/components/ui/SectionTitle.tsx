// src/components/ui/SectionTitle.tsx
import { Words } from './Words'

export function SectionTitle ({
  title,
  as: Tag = 'h2'
}: { title: string, as?: 'h1' | 'h2' }) {
  return (
    <div>
      <Tag data-split className='max-w-[19ch] font-display text-[clamp(2.5rem,5vw,4.25rem)] leading-[0.99] tracking-[-0.035em] text-balance'>
        <Words text={title} mask />
      </Tag>
    </div>
  )
}
