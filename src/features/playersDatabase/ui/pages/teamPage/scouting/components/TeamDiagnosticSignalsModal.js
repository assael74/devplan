import * as React from 'react'
import { Box, IconButton, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import AnimatedModal from '../../../../../../../ui/patterns/modals/AnimatedModal.js'
import {
  getTeamLineActions,
  getTeamSquadActions,
  isTeamInterpretationFindingInteresting,
} from '../../../../../../../shared/scouting/teams/interpretation/teamLinePerformanceInterpretation.js'
import {
  getTeamDiagnosticSignalTaskLabel,
} from '../model/teamDiagnosticSignalTask.presentation.js'
import {
  getTeamLineActionsPresentation,
  getTeamSquadActionsPresentation,
} from '../model/teamInterest.presentation.js'
import {
  BENCHMARK_STATE_BY_COLUMN,
  SIGNAL_GROUPS,
  SIGNAL_MATRIX,
} from '../model/teamDiagnosticSignalsModal.model.js'
import { teamDiagnosticSignalsModalSx as sx } from '../sx/teamDiagnosticSignalsModal.sx.js'

export default function TeamDiagnosticSignalsModal({
  area = 'minutes',
  scope = 'all',
  selectedSignalId = '',
  selectedMatrixCell = null,
  isExcludedCase = false,
  trigger = null,
}) {
  const [open, setOpen] = React.useState(false)
  const definition = scope === 'squad'
    ? SIGNAL_GROUPS.squad
    : SIGNAL_GROUPS[area] || SIGNAL_GROUPS.minutes
  const groups = scope === 'attack'
    ? definition.groups.filter(group => group.title === 'התקפה')
    : scope === 'defense'
      ? definition.groups.filter(group => group.title === 'הגנה')
      : definition.groups
  const scopeTitle = scope === 'attack'
    ? 'התקפה'
    : scope === 'defense'
      ? 'הגנה'
      : ''
  const matrixRows = SIGNAL_MATRIX[scope] || null
  const matrixItems = definition.groups.flatMap(group => group.items)
  const itemById = Object.fromEntries(matrixItems.map(item => [item.id, item]))
  const classificationItem = scope === 'attack'
    ? itemById.ATTACK_CLASSIFICATION_MISSING
    : scope === 'defense'
      ? itemById.DEFENSE_CLASSIFICATION_MISSING
      : null
  const performanceHeader = scope === 'attack'
    ? 'ביצוע התקפי קבוצתי'
    : scope === 'defense'
      ? 'ביצוע הגנתי קבוצתי'
      : 'ביצוע קבוצתי'
  const playersHeader = scope === 'attack'
    ? 'כמות שחקני התקפה'
    : scope === 'defense'
      ? 'כמות שחקני הגנה'
      : 'כמות שחקנים מסווגים בסגל'
  const renderPlayersHeader = (label, labelSx) => (
    <>
      {playersHeader} <Box component='span' sx={labelSx}>{label}</Box> ליעד
    </>
  )
  const benchmarkColumns = scope === 'squad'
    ? [
      { label: 'מתחת', sx: sx.headerBelow },
      { label: 'מעל', sx: sx.headerAbove },
    ]
    : [
      { label: 'מתחת', sx: sx.headerBelow },
      { label: 'בהתאם', sx: sx.headerAt },
      { label: 'מעל', sx: sx.headerAbove },
    ]
  const benchmarkStates = scope === 'squad'
    ? ['below_reference', 'above_reference']
    : BENCHMARK_STATE_BY_COLUMN
  const getSquadCellActions = ({ reason, performanceState }) => {
    const performance = performanceState === 'two_positive'
      ? { offenseBand: 'positive_or_above', defenseBand: 'positive_or_above' }
      : performanceState === 'two_low'
        ? { offenseBand: 'low', defenseBand: 'low' }
        : { offenseBand: 'positive_or_above', defenseBand: 'low' }

    return getTeamSquadActionsPresentation(getTeamSquadActions({
      reason,
      performanceState,
      ...performance,
    }))
  }
  const getLineCellActions = finding => getTeamLineActionsPresentation(
    getTeamLineActions(finding)
  )
  const renderSquadAction = (label, action) => action ? (
    <Box component='span' sx={sx.matrixAction}>
      <Box component='span' sx={sx.matrixActionLabel}>{label}: </Box>
      {action.label}
    </Box>
  ) : null
  const renderTaskLabel = taskLabel => {
    const urgentPrefix = 'קבוצה חייבת '
    if (!taskLabel.startsWith(urgentPrefix)) return taskLabel

    return <>
      קבוצה <Box component='span' sx={sx.matrixTaskUrgent}>חייבת</Box>{' '}{taskLabel.slice(urgentPrefix.length)}
    </>
  }
  const handleOpen = event => {
    event?.stopPropagation()
    setOpen(true)
  }
  const handleTriggerKeyDown = event => event.stopPropagation()

  return (
    <>
      {trigger ? React.cloneElement(trigger, {
        onClick: handleOpen,
        onKeyDown: handleTriggerKeyDown,
      }) : <IconButton
        size='sm'
        variant='soft'
        color='neutral'
        aria-label={`הצגת סוגי האיתותים: ${definition.title}`}
        onClick={handleOpen}
        sx={sx.trigger}
      >
        {iconUi({ id: 'info', size: 'sm' })}
      </IconButton>}

      <AnimatedModal
        open={open}
        onClose={() => setOpen(false)}
        title={scopeTitle ? `${definition.title} — ${scopeTitle}` : definition.title}
        description={definition.description}
        iconId='info'
        size={matrixRows ? 'lg' : 'sm'}
        hideFooter
      >
        <Box sx={sx.content}>
          {matrixRows ? (
            <>
              <Box sx={[sx.matrix, scope === 'squad' && sx.squadMatrix]}>
                <Typography sx={sx.matrixHeader}>{performanceHeader}</Typography>
                {benchmarkColumns.map(column => (
                  <Typography key={column.label} sx={sx.matrixHeader}>
                    {renderPlayersHeader(column.label, column.sx)}
                  </Typography>
                ))}
                {matrixRows.flatMap(row => [
                  <Typography key={`${row.performance}-performance`} sx={sx.matrixPerformance}>{row.performance}</Typography>,
                  ...row.cells.map((cell, columnIndex) => {
                    const item = typeof cell === 'string'
                      ? itemById[cell]
                      : cell
                    if (!item) {
                      return <Box key={`${row.performance}-empty-${columnIndex}`} sx={[sx.matrixCell, sx.matrixCellEmpty]} />
                    }
                    const requiresReview = scope === 'squad' || isTeamInterpretationFindingInteresting(item.id)
                    const taskLabel = scope === 'squad'
                      ? item.task || ''
                      : item.task || getTeamDiagnosticSignalTaskLabel(item.id)
                    const squadActions = scope === 'squad'
                      ? getSquadCellActions({
                        reason: item.id,
                        performanceState: row.performanceBand,
                      })
                      : null
                    const lineActions = scope === 'attack' || scope === 'defense'
                      ? getLineCellActions(item.id)
                      : null
                    const isClassificationMissing = selectedSignalId === classificationItem?.id
                    const isCurrentMatrixCoordinate = row.performanceBand === selectedMatrixCell?.performanceBand &&
                      benchmarkStates[columnIndex] === selectedMatrixCell?.benchmarkState
                    const isSelected = (item.id === selectedSignalId || isClassificationMissing) &&
                      isCurrentMatrixCoordinate

                    return (
                      <Box
                        key={`${row.performance}-${item.id}`}
                        sx={[sx.matrixCell, isSelected && sx.matrixCellSelected]}
                      >
                        <Box sx={[sx.matrixItem, isSelected && sx.matrixItemSelected]}>
                          <Box component='span' sx={sx.matrixSignalId}>{item.id}</Box>
                          <Box sx={sx.matrixItemTitle}>
                            <Box component='span' sx={[sx.itemIcon, requiresReview && sx.itemIconReview]}>
                              {iconUi({ id: 'verified', size: 'sm' })}
                            </Box>
                            <Box component='span'>{item.label}</Box>
                          </Box>
                          {scope !== 'squad' && item.explanation ? <Box component='span' sx={sx.matrixExplanation}>{item.explanation}</Box> : null}
                          {scope === 'squad' ? <>
                            {renderSquadAction('לקבוצה', squadActions?.teamNeed)}
                            {renderSquadAction('לשוק', squadActions?.marketOpportunity)}
                          </> : scope === 'attack' || scope === 'defense' ? <>
                            {renderSquadAction('לקבוצה', lineActions?.teamNeed)}
                            {renderSquadAction('לשוק', lineActions?.marketOpportunity)}
                          </> : taskLabel ? <Box component='span' sx={sx.matrixTask}>{renderTaskLabel(taskLabel)}</Box> : null}
                        </Box>
                      </Box>
                    )
                  }),
                ])}
              </Box>
              {scope === 'squad' ? (
                <Box sx={[sx.classificationNote, isExcludedCase && sx.classificationNoteSelected]}>
                  כאשר לפחות אחד מביצועי הקבוצה נמצא בטווח הרגיל, לא נוצר אירוע שימוש בסגל.
                </Box>
              ) : classificationItem ? (
                <Box sx={[sx.classificationNote, classificationItem.id === selectedSignalId && sx.classificationNoteSelected]}>
                  <Box component='span' sx={[sx.itemIcon, sx.itemIconReview]}>
                    {iconUi({ id: 'verified', size: 'sm' })}
                  </Box>
                  {' '}0 שחקנים מסווגים הוא מצב של מתחת ליעד; במודל הוא מחזיר את האיתות המיוחד {classificationItem.id} כדי לציין שחסר סיווג.
                  <Box component='span' sx={sx.matrixTask}>{renderTaskLabel(getTeamDiagnosticSignalTaskLabel(classificationItem.id))}</Box>
                </Box>
              ) : null}
            </>
          ) : groups.map(group => (
            <Box key={group.title} sx={sx.group}>
              <Typography sx={sx.groupTitle}>{group.title}</Typography>
              {group.items.map(item => {
                const requiresReview = isTeamInterpretationFindingInteresting(item.id)

                return (
                  <Typography key={item.id} sx={[sx.item, item.id === selectedSignalId && sx.itemSelected]}>
                    <Box component='span' sx={sx.itemMain}>
                      <Box component='span' sx={[sx.itemIcon, requiresReview && sx.itemIconReview]}>
                        {iconUi({ id: 'verified', size: 'sm' })}
                      </Box>
                      <Box component='span' sx={sx.signalId}>{item.id}</Box>
                      <Box component='span'>— {item.label}</Box>
                    </Box>
                    <Box component='span' sx={sx.conditions}>תנאים: {item.conditions}</Box>
                  </Typography>
                )
              })}
            </Box>
          ))}
        </Box>
      </AnimatedModal>
    </>
  )
}
