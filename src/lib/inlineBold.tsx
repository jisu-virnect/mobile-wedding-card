import type { ReactNode } from 'react'

/**
 * Tiny inline-bold renderer: splits a string at `**...**` runs and
 * returns React nodes with `<strong>` for the emphasized portions.
 * Newlines (`\n`) are converted to `<br/>` so prose stays readable
 * inside a single `<p>` element without depending on
 * `whitespace-pre-line` (which won't apply inside spans).
 *
 * Use when prose needs a hair of emphasis (invitation body,
 * regional notice) without pulling in a full markdown library.
 */
export function renderInlineBold(text: string): ReactNode[] {
  // First split at bold markers, then again at newlines so we can map
  // each piece to either <strong>, <br/>, or a plain string fragment.
  const out: ReactNode[] = []
  const boldParts = text.split(/(\*\*[^*]+\*\*)/g)
  let key = 0
  for (const part of boldParts) {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2)
      const lines = inner.split('\n')
      lines.forEach((line, idx) => {
        if (line) {
          out.push(
            <strong key={key++} className="font-medium text-ink">
              {line}
            </strong>,
          )
        }
        if (idx < lines.length - 1) out.push(<br key={key++} />)
      })
    } else {
      const lines = part.split('\n')
      lines.forEach((line, idx) => {
        if (line) out.push(<span key={key++}>{line}</span>)
        if (idx < lines.length - 1) out.push(<br key={key++} />)
      })
    }
  }
  return out
}
