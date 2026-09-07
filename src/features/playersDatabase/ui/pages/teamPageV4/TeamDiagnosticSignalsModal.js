import * as React from 'react'
import { Box, IconButton, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import AnimatedModal from '../../../../../ui/patterns/modals/AnimatedModal.js'
import {
  getTeamLineActions,
  getTeamSquadActions,
  isTeamInterpretationFindingInteresting,
} from '../../../../../shared/scouting/teams/interpretation/teamLinePerformanceInterpretation.js'
import { COLORS, devPlanColors } from '../../../../../ui/core/theme/Colors.js'
import {
  getTeamDiagnosticSignalLabel,
  getTeamDiagnosticSignalTaskLabel,
} from './model/teamDiagnosticSignalTask.presentation.js'
import {
  getTeamLineActionsPresentation,
  getTeamSquadActionsPresentation,
} from './model/teamInterest.presentation.js'

const SIGNAL_GROUPS = Object.freeze({
  minutes: Object.freeze({
    title: 'סוגי איתותים באיזון חלוקת הדקות',
    description: 'האיתותים המקצועיים שנבדקים באזור זה.',
    groups: Object.freeze([
      Object.freeze({
        title: 'התקפה',
        items: Object.freeze([
          Object.freeze({ id: 'ATTACK_CONCENTRATION', label: getTeamDiagnosticSignalLabel('ATTACK_CONCENTRATION'), conditions: 'ביצוע התקפי חיובי ומעלה · מספר שחקני התקפה מתחת ליעד.' }),
          Object.freeze({ id: 'ATTACK_ESTABLISHED', label: getTeamDiagnosticSignalLabel('ATTACK_ESTABLISHED'), conditions: 'ביצוע התקפי חיובי ומעלה · מספר שחקני התקפה בהתאם ליעד.' }),
          Object.freeze({ id: 'ATTACK_HIGH_COMPETITION', label: getTeamDiagnosticSignalLabel('ATTACK_HIGH_COMPETITION'), conditions: 'ביצוע התקפי חיובי ומעלה · מספר שחקני התקפה מעל היעד.' }),
          Object.freeze({ id: 'ATTACK_DEPTH_REVIEW', label: getTeamDiagnosticSignalLabel('ATTACK_DEPTH_REVIEW'), conditions: 'ביצוע התקפי רגיל · מספר שחקני התקפה מתחת ליעד.' }),
          Object.freeze({ id: 'ATTACK_POSSIBLE_GAP', label: getTeamDiagnosticSignalLabel('ATTACK_POSSIBLE_GAP'), conditions: 'ביצוע התקפי נמוך · מספר שחקני התקפה מתחת ליעד.' }),
          Object.freeze({ id: 'ATTACK_QUALITY_REVIEW', label: getTeamDiagnosticSignalLabel('ATTACK_QUALITY_REVIEW'), conditions: 'ביצוע התקפי נמוך · מספר שחקני התקפה בהתאם ליעד.' }),
          Object.freeze({ id: 'ATTACK_CLASSIFICATION_MISSING', label: getTeamDiagnosticSignalLabel('ATTACK_CLASSIFICATION_MISSING'), conditions: 'נתוני מבנה זמינים · 0 שחקני התקפה מסווגים.' }),
        ]),
      }),
      Object.freeze({
        title: 'הגנה',
        items: Object.freeze([
          Object.freeze({ id: 'DEFENSE_CONCENTRATION', label: getTeamDiagnosticSignalLabel('DEFENSE_CONCENTRATION'), conditions: 'ביצוע הגנתי חיובי ומעלה · מספר שחקני הגנה מתחת ליעד.' }),
          Object.freeze({ id: 'DEFENSE_ESTABLISHED', label: getTeamDiagnosticSignalLabel('DEFENSE_ESTABLISHED'), conditions: 'ביצוע הגנתי חיובי ומעלה · מספר שחקני הגנה בהתאם ליעד.' }),
          Object.freeze({ id: 'DEFENSE_DEPTH_REVIEW', label: getTeamDiagnosticSignalLabel('DEFENSE_DEPTH_REVIEW'), conditions: 'ביצוע הגנתי רגיל · מספר שחקני הגנה מתחת ליעד.' }),
          Object.freeze({ id: 'DEFENSE_POSSIBLE_GAP', label: getTeamDiagnosticSignalLabel('DEFENSE_POSSIBLE_GAP'), conditions: 'ביצוע הגנתי נמוך · מספר שחקני הגנה מתחת ליעד.' }),
          Object.freeze({ id: 'DEFENSE_QUALITY_REVIEW', label: getTeamDiagnosticSignalLabel('DEFENSE_QUALITY_REVIEW'), conditions: 'ביצוע הגנתי נמוך · מספר שחקני הגנה בהתאם ליעד.' }),
          Object.freeze({ id: 'DEFENSE_QUALITY_SEARCH', label: getTeamDiagnosticSignalLabel('DEFENSE_QUALITY_SEARCH'), conditions: 'ביצוע הגנתי חיובי ומעלה · מספר שחקני הגנה מעל היעד.' }),
          Object.freeze({ id: 'DEFENSE_LOW_QUALITY_OVERLOAD', label: getTeamDiagnosticSignalLabel('DEFENSE_LOW_QUALITY_OVERLOAD'), conditions: 'ביצוע הגנתי נמוך · מספר שחקני הגנה מעל היעד.' }),
          Object.freeze({ id: 'DEFENSE_CLASSIFICATION_MISSING', label: getTeamDiagnosticSignalLabel('DEFENSE_CLASSIFICATION_MISSING'), conditions: 'נתוני מבנה זמינים · 0 שחקני הגנה מסווגים.' }),
        ]),
      }),
      Object.freeze({
        title: 'כללי',
        items: Object.freeze([
          Object.freeze({ id: 'REVIEW_REQUIRED', label: getTeamDiagnosticSignalLabel('REVIEW_REQUIRED'), conditions: 'בהתקפה: ביצוע רגיל או נמוך ומספר שחקנים מעל היעד · בהגנה: מספר שחקנים מעל היעד.' }),
          Object.freeze({ id: 'NO_CLEAR_FINDING', label: getTeamDiagnosticSignalLabel('NO_CLEAR_FINDING'), conditions: 'ביצוע רגיל · מספר שחקנים בהתאם ליעד.' }),
        ]),
      }),
    ]),
  }),
  structure: {
    title: 'סוגי איתותים באיזון מבנה העמדות',
    description: 'האיתותים המקצועיים שנבדקים באזור זה.',
    groups: null,
  },
  squad: Object.freeze({
    title: 'סוגי איתותים בשימוש בסגל',
    description: 'האירועים המוגדרים לפי ביצוע קבוצתי וכמות השחקנים המסווגים בסגל.',
    groups: Object.freeze([
      Object.freeze({
        title: 'שימוש בסגל',
        items: Object.freeze([
          Object.freeze({
            id: 'LOW_CLASSIFICATION_COVERAGE',
            label: 'מעט באנקרים בסגל.',
            explanation: 'מעט שחקנים עם מעמד סטטיסטי ברור.',
          }),
          Object.freeze({
            id: 'HIGH_CLASSIFICATION_COVERAGE',
            label: 'סגל רחב.',
            explanation: 'הרבה שחקנים עם מעמד סטטיסטי ברור.',
          }),
        ]),
      }),
    ]),
  }),
})

SIGNAL_GROUPS.structure.groups = SIGNAL_GROUPS.minutes.groups

const SIGNAL_MATRIX = Object.freeze({
  attack: Object.freeze([
    Object.freeze({ performance: 'חיובי ומעלה', performanceBand: 'positive_or_above', cells: Object.freeze(['ATTACK_CONCENTRATION', 'ATTACK_ESTABLISHED', 'ATTACK_HIGH_COMPETITION']) }),
    Object.freeze({ performance: 'רגיל', performanceBand: 'regular', cells: Object.freeze(['ATTACK_DEPTH_REVIEW', 'NO_CLEAR_FINDING', 'REVIEW_REQUIRED']) }),
    Object.freeze({ performance: 'נמוך', performanceBand: 'low', cells: Object.freeze(['ATTACK_POSSIBLE_GAP', 'ATTACK_QUALITY_REVIEW', 'REVIEW_REQUIRED']) }),
  ]),
  defense: Object.freeze([
    Object.freeze({ performance: 'חיובי ומעלה', performanceBand: 'positive_or_above', cells: Object.freeze(['DEFENSE_CONCENTRATION', 'DEFENSE_ESTABLISHED', 'DEFENSE_QUALITY_SEARCH']) }),
    Object.freeze({ performance: 'רגיל', performanceBand: 'regular', cells: Object.freeze(['DEFENSE_DEPTH_REVIEW', 'NO_CLEAR_FINDING', 'REVIEW_REQUIRED']) }),
    Object.freeze({ performance: 'נמוך', performanceBand: 'low', cells: Object.freeze(['DEFENSE_POSSIBLE_GAP', 'DEFENSE_QUALITY_REVIEW', 'DEFENSE_LOW_QUALITY_OVERLOAD']) }),
  ]),
  squad: Object.freeze([
    Object.freeze({ performance: '2 חיוביים', performanceBand: 'two_positive', cells: Object.freeze([
      Object.freeze({ id: 'LOW_CLASSIFICATION_COVERAGE', label: 'בסיס סגל פגיע.', explanation: 'הקבוצה מצליחה משני הצדדים, אך תלויה במספר מצומצם של שחקנים מובילים.' }),
      Object.freeze({ id: 'HIGH_CLASSIFICATION_COVERAGE', label: 'תחרות גבוהה לצד הצלחה קבוצתית.', explanation: 'יש תחרות גבוהה על תפקידי הובלה, ושחקנים עשויים לחפש תפקיד מוביל במקום אחר.' }),
    ]) }),
    Object.freeze({ performance: '1 חיובי · 1 שלילי', performanceBand: 'positive_and_low', cells: Object.freeze([
      Object.freeze({ id: 'LOW_CLASSIFICATION_COVERAGE', label: 'בסיס סגל מעורער.', explanation: 'מעט שחקנים מובילים לצד תמונת ביצועים מעורבת.' }),
      Object.freeze({ id: 'HIGH_CLASSIFICATION_COVERAGE', label: 'קבוצה לא מאוזנת עם הצלחה מוגבלת.', explanation: 'יש הרבה שחקנים משמעותיים, אך הביצועים אינם מאוזנים בין חלקי המשחק.' }),
    ]) }),
    Object.freeze({ performance: '2 שליליים', performanceBand: 'two_low', cells: Object.freeze([
      Object.freeze({ id: 'LOW_CLASSIFICATION_COVERAGE', label: 'בסיס סגל רעוע.', explanation: 'מעט שחקנים מובילים לצד שני ביצועים נמוכים.' }),
      Object.freeze({ id: 'HIGH_CLASSIFICATION_COVERAGE', label: 'קבוצה חסרת זהות ולא מצליחה.', explanation: 'יש הרבה שחקנים משמעותיים, אך אין איכות מובילה בשני חלקי המשחק.' }),
    ]) }),
  ]),
})

const BENCHMARK_STATE_BY_COLUMN = Object.freeze(['below_reference', 'at_reference', 'above_reference'])

const sx = {
  trigger: {
    width: 24,
    minWidth: 24,
    height: 24,
    minHeight: 24,
    p: 0.35,
    color: devPlanColors.secondary,
    bgcolor: devPlanColors.secondaryLight,
    '&:hover': {
      color: devPlanColors.primary,
      bgcolor: devPlanColors.primaryLight,
    },
  },
  content: {
    display: 'grid',
    gap: 1.25,
  },
  group: {
    display: 'grid',
    gap: 0.5,
    p: 1,
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 9,
    bgcolor: devPlanColors.surface,
  },
  groupTitle: {
    color: devPlanColors.primaryDark,
    fontSize: 13,
    fontWeight: 800,
  },
  item: {
    display: 'grid',
    gap: 0.25,
    py: 0.2,
  },
  itemMain: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.55,
    color: devPlanColors.secondary,
    fontSize: 12,
    lineHeight: 1.35,
  },
  conditions: {
    pr: 2.1,
    color: devPlanColors.secondary,
    fontSize: 10.5,
    lineHeight: 1.35,
  },
  signalId: {
    color: devPlanColors.primaryDark,
    fontFamily: 'monospace',
    fontSize: 10.5,
    fontWeight: 800,
    direction: 'ltr',
  },
  itemIcon: {
    display: 'inline-flex',
    color: devPlanColors.secondary,
    '& svg': { fontSize: 12 },
  },
  itemIconReview: {
    color: `${COLORS.status.success.solid} !important`,
    '& svg, & svg *': {
      color: `${COLORS.status.success.solid} !important`,
      fill: `${COLORS.status.success.solid} !important`,
    },
  },
  itemSelected: {
    mx: -0.45,
    px: 0.45,
    borderRadius: 6,
    bgcolor: devPlanColors.primaryLight,
  },
  matrix: {
    display: 'grid',
    gridTemplateColumns: 'minmax(72px, 0.8fr) repeat(3, minmax(0, 1fr))',
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 8,
    overflow: 'hidden',
  },
  squadMatrix: {
    gridTemplateColumns: 'minmax(100px, 0.85fr) repeat(2, minmax(0, 1fr))',
  },
  matrixHeader: {
    p: 0.65,
    bgcolor: devPlanColors.secondaryLight,
    color: devPlanColors.primaryDark,
    fontSize: 10,
    fontWeight: 800,
    textAlign: 'center',
    borderLeft: `1px solid ${devPlanColors.border}`,
    borderBottom: `1px solid ${devPlanColors.border}`,
  },
  headerBelow: { color: COLORS.status.danger.solid, fontWeight: 900 },
  headerAt: { color: COLORS.status.success.solid, fontWeight: 900 },
  headerAbove: { color: COLORS.status.warning.solid, fontWeight: 900 },
  matrixPerformance: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: 0.7,
    bgcolor: devPlanColors.secondaryLight,
    color: devPlanColors.primaryDark,
    fontSize: 11,
    fontWeight: 800,
    textAlign: 'center',
    borderLeft: `1px solid ${devPlanColors.border}`,
    borderBottom: `1px solid ${devPlanColors.border}`,
  },
  matrixCell: {
    minWidth: 0,
    minHeight: 92,
    px: 1.45,
    py: 0.85,
    textAlign: 'center',
    borderLeft: `1px solid ${devPlanColors.border}`,
    borderBottom: `1px solid ${devPlanColors.border}`,
  },
  matrixCellEmpty: {
    bgcolor: devPlanColors.surface,
  },
  matrixCellSelected: {
    bgcolor: COLORS.status.success.softBg,
  },
  matrixItem: {
    display: 'grid',
    minWidth: 0,
    gap: 0.45,
    color: devPlanColors.secondary,
    fontSize: 10,
    lineHeight: 1.3,
    textAlign: 'center',
  },
  matrixItemTitle: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 0.35,
    color: devPlanColors.primaryDark,
    fontSize: 11.5,
    fontWeight: 700,
    lineHeight: 1.4,
  },
  matrixTask: {
    color: devPlanColors.tertiaryDark,
    fontSize: 9.5,
    fontWeight: 700,
    lineHeight: 1.35,
    textAlign: 'center',
  },
  matrixExplanation: {
    color: devPlanColors.secondary,
    fontSize: 9.5,
    lineHeight: 1.35,
    textAlign: 'center',
  },
  matrixAction: {
    minWidth: 0,
    color: devPlanColors.tertiaryDark,
    fontSize: 9.5,
    fontWeight: 700,
    lineHeight: 1.35,
    textAlign: 'center',
    overflowWrap: 'anywhere',
  },
  matrixActionLabel: {
    color: devPlanColors.primaryDark,
    fontWeight: 900,
  },
  matrixTaskUrgent: {
    color: COLORS.status.danger.solid,
    fontWeight: 900,
  },
  matrixSignalId: {
    display: 'block',
    justifySelf: 'center',
    mb: 0.7,
    color: devPlanColors.secondary,
    fontFamily: 'monospace',
    fontSize: 9.5,
    fontWeight: 500,
    direction: 'ltr',
  },
  matrixItemSelected: {
    mx: -0.25,
    px: 0.25,
    borderRadius: 5,
    bgcolor: COLORS.status.success.softBg,
  },
  classificationNote: {
    p: 0.85,
    borderRadius: 8,
    bgcolor: devPlanColors.secondaryLight,
    color: devPlanColors.secondary,
    fontSize: 11,
    lineHeight: 1.4,
  },
  classificationNoteSelected: {
    bgcolor: COLORS.status.success.softBg,
  },
}

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
