// src/features/playersDatabase/ui/pages/teamPage/scouting/components/TeamScoutingSummary.js

import { Box, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import TeamAnalysisCard from '../../information/components/TeamAnalysisCard.js'
import { teamScoutingSummarySx as sx } from '../sx/teamScoutingSummary.sx.js'
import TeamDiagnosticSignalsModal from './TeamDiagnosticSignalsModal.js'
import {
  getTeamDiagnosticSignalTaskLabel,
} from '../model/teamDiagnosticSignalTask.presentation.js'
import {
  getTeamLineActionsPresentation,
} from '../model/teamInterest.presentation.js'
import {
  TEAM_SCOUTING_SUMMARY_ITEMS,
  getTeamScoutingSummaryTitle,
} from '../model/teamScoutingSummary.presentation.js'

const resolveSquadUsageState = (structure, item) => {
  return {
    tone: 'clear',
    status: '',
    signalId: '',
    matrixSelection: null,
    isExcludedSquadCase: false,
    actions: null,
    emphasizeValue: true,
    title: getTeamScoutingSummaryTitle({ structure, item }),
  }
}

const resolveItemState = ({ structure, item }) => {
  if (item.key === 'squad') return resolveSquadUsageState(structure, item)

  const interest = item.key === 'squad'
    ? structure?.teamInterest?.squad
    : structure?.teamInterest?.lines?.[item.key]
  const isInteresting = Boolean(interest?.isInteresting)
  const matrixSelection = structure?.lineInterpretation?.[item.key] || null
  const signalId = interest?.finding || interest?.reason || ''
  const hasNoClassifiedLinePlayers = [
    'ATTACK_CLASSIFICATION_MISSING',
    'DEFENSE_CLASSIFICATION_MISSING',
  ].includes(signalId)
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
      actions: null,
      title: getTeamScoutingSummaryTitle({ structure, item }),
      explanation: taskLabel,
      actionPlaceholder: 'טרם ניתן לקבוע',
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
      title: getTeamScoutingSummaryTitle({ structure, item }),
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
    title: getTeamScoutingSummaryTitle({ structure, item }),
    explanation: taskLabel,
  }
}

export default function TeamScoutingSummary({
  structure = null,
  hasRosterPlayers = false,
  title = 'תמונת סקאוטינג',
  titleMeta = null,
  selectedFilter = null,
  onFilterChange,
}) {
  const unavailableMessage = !structure
    ? hasRosterPlayers
      ? 'הסגל נטען. ניתוח חלוקת הדקות יהיה זמין לאחר טעינת סטטיסטיקה.'
      : 'לא נטענו עדיין שחקנים לעונה זאת.'
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
        {TEAM_SCOUTING_SUMMARY_ITEMS.map(item => {
          const state = resolveItemState({ structure, item })
          const clickable = Boolean(item.filterKey && onFilterChange)
          const selected = item.filterKey === selectedFilter
          return (
            <TeamAnalysisCard
              key={item.key}
              tone={state.tone === 'review' ? 'review' : 'muted'}
              selected={selected}
              onSelect={clickable ? () => onFilterChange(item.filterKey) : undefined}
              ariaLabel={`הצגת שחקני ${item.label}`}
              cardSx={sx.card}
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
                        {state.actions?.teamNeed?.label || state.actionPlaceholder || 'אין צורך מזוהה'}
                      </Box>
                    </Typography>
                    <Typography sx={sx.cardAction}>
                      <Box component='span' sx={sx.cardActionLabel}>לשוק: </Box>
                      <Box component='span' sx={!state.actions?.marketOpportunity ? sx.cardActionEmpty : undefined}>
                        {state.actions?.marketOpportunity?.label || state.actionPlaceholder || 'אין הזדמנות מזוהה'}
                      </Box>
                    </Typography>
                  </Box>
                ) : null}

              </Box>
            </TeamAnalysisCard>
          )
        })}
      </Box>
    </Box>
  )
}
