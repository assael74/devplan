// src/features/playersDatabase/ui/components/playerMeta/PlayerLineClassificationChip.js

import { Tooltip } from '@mui/joy'

import PlayerMetaChip from './PlayerMetaChip.js'

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
  compact = false,
}) {
  const line = clean(classification?.line)
  const position = clean(classification?.position)
  const positionCode = clean(primaryPosition).toUpperCase()
  const isGoalkeeper = positionCode === 'GK' || clean(positionLayer).toLowerCase() === 'goalkeeper'
  const lineDisplay = LINE_DISPLAY[line]
  const positionLabel = POSITION_LABELS[position] || position
  const endIconId = positionCode || CLASSIFICATION_POSITION_ICON_IDS[position] || ''
  const tooltip = [
    [lineDisplay?.label, positionLabel].filter(Boolean).join(' · '),
    getSourceLabel(classification?.source),
    clean(tooltipDetail),
  ].filter(Boolean).join(' · ')

  if (isGoalkeeper) {
    return (
      <PlayerMetaChip
        label='שוער'
        startIconId='goalkeeper'
        tooltip={['שוער', 'עמדה ידועה', clean(tooltipDetail)].filter(Boolean).join(' · ')}
        selected
        clickable={clickable}
        buttonLike={buttonLike}
        compact={compact}
      />
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
    <PlayerMetaChip
      label={`${lineDisplay.label}${endIconId ? ' · ' : ''}`}
      startIconId={lineDisplay.iconId}
      endIconId={endIconId}
      tooltip={tooltip}
      selected
      clickable={clickable}
      buttonLike={buttonLike}
      compact={compact}
    />
  )
}
