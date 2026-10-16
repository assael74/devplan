// src/features/playersDatabase/ui/pages/teamPage/information/components/TeamAnalysisCard.js

import { Card, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { teamAnalysisCardSx as sx } from '../sx/teamAnalysisCard.sx.js'

export const TeamAnalysisComparison = ({ comparison }) => comparison ? (
  <Typography
    sx={sx.comparison(comparison.iconId)}
    endDecorator={iconUi({ id: comparison.iconId, size: 'sm' })}
  >
    {comparison.text}
  </Typography>
) : null

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
    const action = event.target.closest('button, a, [role="button"]')
    if (action && action !== event.currentTarget) return
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
