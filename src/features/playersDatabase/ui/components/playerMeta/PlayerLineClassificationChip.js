// src/features/playersDatabase/ui/components/playerMeta/PlayerLineClassificationChip.js

import { Chip, Tooltip } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { playerPositionChipSx as sx } from './sx/playerPositionChip.sx.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const LINE_DISPLAY = {
  DEFENSE: { label: 'הגנה', iconId: 'defense' },
  MIDFIELD: { label: 'קישור', iconId: 'midfield' },
  ATTACK: { label: 'התקפה', iconId: 'attack' },
}

const POSITION_LABELS = {
  FULLBACK: 'מגן',
  ATTACKING_MIDFIELDER: 'קשר התקפי',
}

const CLASSIFICATION_POSITION_ICON_IDS = {
  FULLBACK: 'defense',
  ATTACKING_MIDFIELDER: 'AC',
}

const getSourceLabel = source => (
  clean(source) === 'known' ? 'עמדה ידועה' : 'זיהוי לפי נתוני שימוש'
)

export default function PlayerLineClassificationChip({
  classification = null,
  primaryPosition = '',
  positionLayer = '',
  tooltipDetail = '',
  clickable = false,
  buttonLike = false,
}) {
  const line = clean(classification?.line)
  const position = clean(classification?.position)
  const positionCode = clean(primaryPosition).toUpperCase()
  const isGoalkeeper = positionCode === 'GK' || clean(positionLayer).toLowerCase() === 'goalkeeper'
  const lineDisplay = LINE_DISPLAY[line]
  const positionLabel = POSITION_LABELS[position] || position
  const positionIcon = positionCode
    ? iconUi({ id: positionCode, size: 'sm' })
    : null
  const classificationPositionIcon = position
    ? iconUi({ id: CLASSIFICATION_POSITION_ICON_IDS[position], size: 'sm' })
    : null
  const resolvedPositionIcon = positionIcon || classificationPositionIcon
  const tooltip = [
    [lineDisplay?.label, positionLabel].filter(Boolean).join(' · '),
    getSourceLabel(classification?.source),
    clean(tooltipDetail),
  ].filter(Boolean).join(' · ')

  if (isGoalkeeper) {
    return (
      <Tooltip title={['שוער', 'עמדה ידועה', clean(tooltipDetail)].filter(Boolean).join(' · ')}>
        <Chip
          size='sm'
          variant='soft'
          startDecorator={iconUi({ id: 'goalkeeper', size: 'sm' })}
          sx={sx.root({ selected: true, clickable, buttonLike })}
        >
          שוער
        </Chip>
      </Tooltip>
    )
  }

  if (!lineDisplay) {
    return tooltipDetail ? (
      <Tooltip title={clean(tooltipDetail)}>
        <span>—</span>
      </Tooltip>
    ) : '-'
  }

  return (
    <Tooltip title={tooltip}>
      <Chip
        size='sm'
        variant='soft'
        startDecorator={iconUi({
          id: lineDisplay.iconId,
          size: 'sm',
        })}
        endDecorator={resolvedPositionIcon}
        sx={sx.root({ selected: true, clickable, buttonLike })}
      >
        {lineDisplay.label}{resolvedPositionIcon ? ' · ' : ''}
      </Chip>
    </Tooltip>
  )
}
