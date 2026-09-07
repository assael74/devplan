import { Box, Typography } from '@mui/joy'

import { TEAM_LINE_CLASSIFICATION_REASON } from '../../../../../shared/scouting/teams/lines/teamLineClassification.js'
import { TEAM_LINE_STRUCTURE_THRESHOLDS } from '../../../../../shared/scouting/config/lineStructureThresholds.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { playerLineClassificationTooltipSx as sx } from './sx/playerLineClassificationTooltip.sx.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const LINE_LABELS = {
  DEFENSE: 'הגנה',
  MIDFIELD: 'קישור',
  ATTACK: 'התקפה',
}

const buildConditions = ({ classification, evaluation, stats }) => {
  if (clean(classification?.source) === 'known') {
    return [{ id: 'known_position', label: 'עמדה ידועה', iconId: 'completed' }]
  }

  if (evaluation?.reasonCode !== TEAM_LINE_CLASSIFICATION_REASON.CLASSIFIED) return []

  const games = Number(stats?.games)
  const goals = Number(stats?.goals)
  const conditions = []

  if (Number.isFinite(games)) {
    conditions.push({
      id: 'minimum_games',
      label: `לפחות ${TEAM_LINE_STRUCTURE_THRESHOLDS.MINIMUM_GAMES} הופעות`,
      iconId: 'games',
    })
  }

  if (goals >= 10) {
    conditions.push({ id: 'elite_goals', label: '10 שערים ומעלה', iconId: 'goals' })
    return conditions
  }

  if (goals >= 5) {
    conditions.push({ id: 'goals', label: '5 שערים ומעלה', iconId: 'goals' })
    return conditions
  }

  if (Number.isFinite(Number(evaluation?.minutesRate))) {
    conditions.push({
      id: 'minutes_rate',
      label: 'זמן זמין מתאים במשחקים שבהם שותף',
      iconId: 'timePlayed',
    })
  }

  if (clean(classification?.position) === 'FULLBACK' && Number.isFinite(Number(evaluation?.substitutionRate))) {
    conditions.push({
      id: 'substitution_rate',
      label: 'שיעור חילופים מתאים',
      iconId: 'swapVert',
    })
  }

  return conditions
}

export default function PlayerLineClassificationTooltip({
  classification = null,
  evaluation = null,
  stats = null,
  compact = false,
}) {
  const lineLabel = LINE_LABELS[clean(classification?.line)] || 'עמדה'
  const conditions = buildConditions({ classification, evaluation, stats })

  return (
    <Box sx={sx.root({ compact })}>
      <Box sx={sx.header({ compact })}>
        <Box aria-hidden='true' sx={sx.lineIcon({ compact })}>{iconUi({ id: classification?.line === 'ATTACK' ? 'attack' : classification?.line === 'MIDFIELD' ? 'midfield' : 'defense', size: 'sm' })}</Box>
        <Typography sx={sx.title({ compact })}>{lineLabel}</Typography>
      </Box>
      <Typography sx={sx.subtitle({ compact })}>התנאים שהתקיימו</Typography>
      {conditions.length ? (
        <Box sx={sx.conditions}>
          {conditions.map(condition => (
            <Box key={condition.id} sx={sx.condition}>
              <Box sx={sx.conditionTitle({ compact })}>
                <Box aria-hidden='true' sx={sx.conditionIcon({ compact })}>{iconUi({ id: condition.iconId, size: 'sm' })}</Box>
                <Typography sx={sx.conditionLabel({ compact })}>{condition.label}</Typography>
              </Box>
              <Typography sx={sx.conditionStatus({ compact })}>התקיים</Typography>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography sx={sx.empty({ compact })}>אין פירוט תנאים זמין לסיווג זה.</Typography>
      )}
    </Box>
  )
}
