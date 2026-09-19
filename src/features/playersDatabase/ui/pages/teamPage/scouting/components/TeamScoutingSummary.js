import { Box, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { TEAM_STRUCTURE_FILTER } from '../../structure/model/teamStructureFilter.model.js'
import { teamScoutingSummarySx as sx } from '../sx/teamScoutingSummary.sx.js'
import TeamDiagnosticSignalsModal from './TeamDiagnosticSignalsModal.js'
import {
  getTeamDiagnosticSignalLabel,
  getTeamDiagnosticSignalTaskLabel,
} from '../model/teamDiagnosticSignalTask.presentation.js'
import { getTeamSquadUsageLabel } from '../../structure/model/teamSquadUsage.presentation.js'
import {
  getTeamLineActionsPresentation,
} from '../model/teamInterest.presentation.js'

const SUMMARY_ITEMS = Object.freeze([
  {
    key: 'defense',
    label: 'הגנה',
    iconId: 'defense',
    filterKey: TEAM_STRUCTURE_FILTER.DEFENSE,
  },
  {
    key: 'offense',
    label: 'התקפה',
    iconId: 'attack',
    filterKey: TEAM_STRUCTURE_FILTER.ATTACK,
  },
  {
    key: 'squad',
    label: 'שימוש בסגל',
    iconId: 'group',
    filterKey: TEAM_STRUCTURE_FILTER.ALL_SQUAD,
  },
])

const resolveSquadUsageState = structure => {
  return {
    tone: 'clear',
    status: '',
    signalId: '',
    matrixSelection: null,
    isExcludedSquadCase: false,
    actions: null,
    emphasizeValue: true,
    title: getTeamSquadUsageLabel(structure?.classificationCoverageBenchmark?.state),
  }
}

const resolveItemState = ({ structure, item }) => {
  if (item.key === 'squad') return resolveSquadUsageState(structure)

  const interest = item.key === 'squad'
    ? structure?.teamInterest?.squad
    : structure?.teamInterest?.lines?.[item.key]
  const presentation = structure?.interestPresentation?.[item.key]
  const isInteresting = Boolean(interest?.isInteresting)
  const matrixSelection = structure?.lineInterpretation?.[item.key] || null
  const signalId = interest?.finding || interest?.reason || ''
  const hasNoClassifiedLinePlayers = [
    'ATTACK_CLASSIFICATION_MISSING',
    'DEFENSE_CLASSIFICATION_MISSING',
  ].includes(signalId)
  const signalLabel = getTeamDiagnosticSignalLabel(signalId)
  const taskLabel = getTeamDiagnosticSignalTaskLabel(signalId)
  const actions = getTeamLineActionsPresentation(structure?.lineInterpretation?.[item.key]?.actions)
  const isExcludedSquadCase = false

  if (hasNoClassifiedLinePlayers) {
    return {
      tone: 'review',
      status: 'לבדיקה',
      signalId,
      matrixSelection,
      isExcludedSquadCase,
      actions,
      title: item.key === 'offense' ? 'אין שחקני התקפה בסגל' : `אין שחקנים מסווגים ל${item.label}`,
      explanation: taskLabel,
    }
  }

  if (isInteresting) {
    return {
      tone: 'review',
      status: 'לבדיקה',
      signalId,
      matrixSelection,
      isExcludedSquadCase,
      actions,
      title: signalLabel || presentation?.label || item.label,
      explanation: taskLabel,
    }
  }

  return {
    tone: 'clear',
    status: 'אין צורך בבדיקה',
    signalId,
    matrixSelection,
    isExcludedSquadCase,
    actions,
    title: signalId === 'REVIEW_REQUIRED'
      ? 'אירוע למעקב ולבחינה עתידית.'
      : signalLabel || item.label,
    explanation: taskLabel,
  }
}

export default function TeamScoutingSummary({
  structure = null,
  title = 'תמונת סקאוטינג',
  titleMeta = null,
  selectedFilter = null,
  onFilterChange,
}) {
  const unavailableMessage = !structure
    ? 'לא נטענו עדיין שחקנים לעונה זאת.'
    : structure.availabilityReason === 'season_sample_insufficient'
      ? 'אין עדיין מספיק נתונים — ניתוח חלוקת הדקות יהיה זמין לאחר 8 משחקי ליגה.'
      : 'לא נטענו עדיין נתוני סטטיסטיקה לעונה זאת.'

  if (!structure || structure.availability === 'unavailable') {
    return (
      <Box sx={sx.section}>
        <Box sx={sx.header}>
          <Box sx={sx.titleRow}>
            <Box sx={sx.titleIcon}>{iconUi({ id: 'scouting', size: 'sm' })}</Box>
            <Typography sx={sx.title}>{title}</Typography>
            {titleMeta}
          </Box>
        </Box>
        <Typography sx={sx.meta}>{unavailableMessage}</Typography>
      </Box>
    )
  }

  return (
    <Box sx={sx.section}>
      <Box sx={sx.header}>
        <Box sx={sx.titleRow}>
          <Box sx={sx.titleIcon}>{iconUi({ id: 'scouting', size: 'sm' })}</Box>
          <Typography sx={sx.title}>{title}</Typography>
          {titleMeta}
        </Box>
      </Box>

      <Box sx={sx.grid}>
        {SUMMARY_ITEMS.map(item => {
          const state = resolveItemState({ structure, item })
          const clickable = Boolean(item.filterKey && onFilterChange)
          const selected = item.filterKey === selectedFilter
          const handleCardKeyDown = event => {
            if (!clickable || !['Enter', ' '].includes(event.key)) return
            event.preventDefault()
            onFilterChange(item.filterKey)
          }

          return (
            <Box
              key={item.key}
              component='div'
              onClick={clickable ? () => onFilterChange(item.filterKey) : undefined}
              onKeyDown={handleCardKeyDown}
              sx={[
                sx.card,
                state.tone === 'review' ? sx.cardReview : sx.cardClear,
                clickable && sx.cardClickable,
                selected && (state.tone === 'review' ? sx.cardReviewSelected : sx.cardSelected),
              ]}
              role={clickable ? 'button' : undefined}
              tabIndex={clickable ? 0 : undefined}
              aria-pressed={clickable ? selected : undefined}
            >
              <Box sx={sx.cardBody}>
                <Box sx={sx.cardTop}>
                  <Box sx={sx.cardHeading}>
                    <Box sx={sx.icon}>{iconUi({ id: item.iconId, size: 'sm' })}</Box>
                    <Typography sx={sx.cardLabel}>{item.label}</Typography>
                  </Box>
                  {item.key !== 'squad' ? (
                    <TeamDiagnosticSignalsModal
                      area='minutes'
                      scope={item.key === 'offense' ? 'attack' : 'defense'}
                      selectedSignalId={state.signalId}
                      selectedMatrixCell={state.matrixSelection}
                      trigger={(
                        <Box
                          component='button'
                          type='button'
                          aria-label={`הצגת איתותים עבור ${item.label}`}
                          sx={[
                            sx.status,
                            state.tone === 'review' ? sx.statusReview : sx.statusClear,
                          ]}
                        >
                          {state.tone === 'review'
                            ? iconUi({ id: 'scouting', size: 'sm' })
                            : iconUi({ id: 'verified', size: 'sm' })}
                          <Typography component='span' sx={sx.statusText}>{state.status}</Typography>
                        </Box>
                      )}
                    />
                  ) : null}
                </Box>

                <Typography sx={[sx.cardTitle, state.emphasizeValue && sx.cardTitleProminent]}>
                  {state.title}
                </Typography>
                {item.key !== 'squad' ? (
                  <Box sx={sx.cardActions}>
                    <Typography sx={sx.cardAction}>
                      <Box component='span' sx={sx.cardActionLabel}>לקבוצה: </Box>
                      <Box component='span' sx={!state.actions?.teamNeed ? sx.cardActionEmpty : undefined}>
                        {state.actions?.teamNeed?.label || 'אין צורך מזוהה'}
                      </Box>
                    </Typography>
                    <Typography sx={sx.cardAction}>
                      <Box component='span' sx={sx.cardActionLabel}>לשוק: </Box>
                      <Box component='span' sx={!state.actions?.marketOpportunity ? sx.cardActionEmpty : undefined}>
                        {state.actions?.marketOpportunity?.label || 'אין הזדמנות מזוהה'}
                      </Box>
                    </Typography>
                  </Box>
                ) : null}

              </Box>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
