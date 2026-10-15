// src/features/playersDatabase/ui/pages/teamPage/information/components/TeamAnalysisCard.js

import { Card } from '@mui/joy'

import { teamAnalysisCardSx as sx } from '../sx/teamAnalysisCard.sx.js'

export default function TeamAnalysisCard({
  children,
  tone = 'default',
  selected = false,
  onSelect,
  ariaLabel,
  cardSx,
}) {
  const interactive = typeof onSelect === 'function'
  const customStyles = Array.isArray(cardSx) ? cardSx : [cardSx]
  const handleClick = event => {
    if (!interactive) return
    if (event.target !== event.currentTarget &&
      event.target.closest('button, a, [role="button"]')) return
    onSelect(event)
  }
  const handleKeyDown = event => {
    if (!interactive || event.target !== event.currentTarget ||
      !['Enter', ' '].includes(event.key)) return
    event.preventDefault()
    onSelect(event)
  }

  return (
    <Card
      component='div'
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-pressed={interactive ? selected : undefined}
      aria-label={interactive ? ariaLabel : undefined}
      onClick={interactive ? handleClick : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
      sx={[
        sx.root,
        tone === 'review' && sx.review,
        tone === 'muted' && sx.muted,
        interactive && sx.interactive,
        selected && (tone === 'review' ? sx.selectedReview : sx.selected),
        ...customStyles,
      ]}
    >
      {children}
    </Card>
  )
}
