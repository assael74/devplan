import { Box, Button, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { TEAM_STRUCTURE_FILTER } from './model/teamStructureFilter.model.js'
import { teamStructureSx as sx } from './sx/teamStructure.sx.js'

const BENCHMARK_ICONS = Object.freeze({
  below_reference: 'sortDown',
  at_reference: 'equal',
  above_reference: 'sortUp',
})

const LINE_DEFINITIONS = Object.freeze([
  {
    key: 'goalkeeper',
    label: 'שוער',
    iconId: 'goalkeeper',
    filterKey: TEAM_STRUCTURE_FILTER.GOALKEEPER,
    interestKey: null,
  },
  {
    key: 'defense',
    label: 'הגנה',
    iconId: 'defense',
    filterKey: TEAM_STRUCTURE_FILTER.DEFENSE,
    interestKey: 'defense',
  },
  {
    key: 'midfield',
    label: 'קישור',
    iconId: 'midfield',
    filterKey: TEAM_STRUCTURE_FILTER.MIDFIELD,
    interestKey: null,
  },
  {
    key: 'attack',
    label: 'התקפה',
    iconId: 'attack',
    filterKey: TEAM_STRUCTURE_FILTER.ATTACK,
    interestKey: 'offense',
  },
])

const resolveLineState = ({ definition, structure }) => {
  const metric = structure?.benchmark?.metrics?.[definition.key] || {}
  const interest = definition.interestKey
    ? structure?.teamInterest?.lines?.[definition.interestKey]
    : null
  const presentation = definition.interestKey
    ? structure?.interestPresentation?.[definition.interestKey]
    : null
  const isInteresting = Boolean(interest?.isInteresting)

  return {
    count: structure?.lines?.[definition.key],
    reference: metric?.reference ?? null,
    benchmarkState: metric?.state || '',
    isInteresting,
    status: isInteresting ? 'לבדיקה' : 'אין ממצא לבדיקה',
    conclusion: isInteresting
      ? (presentation?.explanation || 'נמצא שילוב נתונים שמצדיק בחינה ממוקדת.')
      : definition.interestKey
        ? 'לא נמצא כרגע שילוב של מבנה הסגל והביצועים שמצדיק העמקה.'
        : 'אין כרגע סימן שמצדיק העמקה.',
  }
}

const LineCard = ({ definition, structure, selectedFilter, onFilterChange }) => {
  const state = resolveLineState({ definition, structure })
  const selected = definition.filterKey === selectedFilter
  const clickable = Boolean(onFilterChange)

  return (
    <Box
      component={clickable ? 'button' : 'div'}
      type={clickable ? 'button' : undefined}
      onClick={clickable ? () => onFilterChange(definition.filterKey) : undefined}
      sx={[
        sx.lineCard,
        state.isInteresting ? sx.lineCardReview : sx.lineCardClear,
        clickable && sx.lineCardClickable,
        selected && (state.isInteresting ? sx.lineCardReviewSelected : sx.lineCardSelected),
      ]}
      aria-pressed={clickable ? selected : undefined}
      aria-label={clickable ? `הצגת שחקני ${definition.label}` : undefined}
    >
      <Box sx={sx.lineBody}>
        <Box sx={sx.lineHeader}>
          <Box sx={sx.lineHeading}>
            <Box sx={sx.lineIcon}>{iconUi({ id: definition.iconId, size: 'sm' })}</Box>
            <Typography sx={sx.lineLabel}>{definition.label}</Typography>
          </Box>
          <Box sx={[
            sx.lineStatus,
            state.isInteresting ? sx.lineStatusReview : sx.lineStatusClear,
          ]}>
            {state.isInteresting
              ? iconUi({ id: 'scouting', size: 'sm' })
              : iconUi({ id: 'verified', size: 'sm' })}
            <Typography component='span' sx={sx.lineStatusText}>{state.status}</Typography>
          </Box>
        </Box>

        <Box sx={sx.lineMetricRow}>
          <Typography sx={sx.lineValue}>{state.count ?? '—'}</Typography>
          {state.reference !== null ? (
            <Box sx={sx.referenceChip}>
              <Box sx={sx.referenceChipIcon}>
                {iconUi({ id: BENCHMARK_ICONS[state.benchmarkState] || 'equal', size: 'sm' })}
              </Box>
              <Typography component='span' sx={sx.referenceChipText}>
                יעד {state.reference}
              </Typography>
            </Box>
          ) : null}
        </Box>

        <Typography sx={sx.lineConclusion}>{state.conclusion}</Typography>
      </Box>
    </Box>
  )
}

const CoverageStrip = ({ structure, selectedFilter, onFilterChange }) => {
  const classified = structure?.lines?.classified
  const relevant = [
    structure?.lines?.classified,
    structure?.lines?.unclassifiedSufficientSample,
    structure?.lines?.insufficientSample,
  ].reduce((sum, value) => sum + (Number(value) || 0), 0)
  const coverageRate = relevant > 0 && Number.isFinite(Number(classified))
    ? Math.round((Number(classified) / relevant) * 100)
    : structure?.rates?.classified
  const missing = (Number(structure?.lines?.unclassifiedSufficientSample) || 0) +
    (Number(structure?.lines?.insufficientSample) || 0)

  const selected = selectedFilter === TEAM_STRUCTURE_FILTER.ALL_SQUAD
  const needsReview = missing > 0
  const clickable = Boolean(onFilterChange)

  return (
    <Box
      component={clickable ? 'button' : 'div'}
      type={clickable ? 'button' : undefined}
      onClick={clickable ? () => onFilterChange(TEAM_STRUCTURE_FILTER.ALL_SQUAD) : undefined}
      sx={[
        sx.lineCard,
        needsReview ? sx.lineCardReview : sx.lineCardClear,
        clickable && sx.lineCardClickable,
        selected && (needsReview ? sx.lineCardReviewSelected : sx.lineCardSelected),
      ]}
      aria-pressed={clickable ? selected : undefined}
      aria-label={clickable ? 'הצגת כל שחקני הסגל' : undefined}
    >
      <Box sx={sx.lineBody}>
        <Box sx={sx.lineHeader}>
          <Box sx={sx.lineHeading}>
            <Box sx={sx.lineIcon}>{iconUi({ id: 'verified', size: 'sm' })}</Box>
            <Typography sx={sx.lineLabel}>פיזור דקות מסווגות</Typography>
          </Box>
          <Box sx={[sx.lineStatus, needsReview ? sx.lineStatusReview : sx.lineStatusClear]}>
            {needsReview ? iconUi({ id: 'scouting', size: 'sm' }) : iconUi({ id: 'verified', size: 'sm' })}
            <Typography component='span' sx={sx.lineStatusText}>
              {needsReview ? 'לבדיקה' : 'אין ממצא לבדיקה'}
            </Typography>
          </Box>
        </Box>

        <Box sx={sx.lineMetricRow}>
          <Typography sx={sx.lineValue}>
            {coverageRate !== null && coverageRate !== undefined ? `${coverageRate}%` : '—'}
          </Typography>
        </Box>

        <Typography sx={sx.lineConclusion}>
          {classified ?? '—'} שחקנים מסווגים{missing > 0 ? ` · ${missing} שחקנים דורשים השלמה` : ' · אין שחקנים שממתינים להשלמה'}
        </Typography>
      </Box>
    </Box>
  )
}

export default function TeamStructureSection({
  structure = null,
  title = 'מבנה הסגל',
  seasonKey = '',
  selectedFilter = TEAM_STRUCTURE_FILTER.CLASSIFIED,
  onFilterChange,
  onExport,
  exportDisabled = false,
  children,
}) {
  if (!structure) return null

  if (structure.availability === 'unavailable') {
    const message = structure.availabilityReason === 'season_sample_insufficient'
      ? 'אין עדיין מספיק נתונים — ניתוח הסגל יהיה זמין לאחר 8 משחקי ליגה.'
      : 'אין עדיין נתוני סטטיסטיקה — ניתוח הסגל יהיה זמין לאחר טעינת סטטיסטיקה.'

    return (
      <Box sx={sx.section}>
        <Box sx={sx.header}>
          <Box sx={sx.titleRow}>
            <Box sx={sx.titleIcon}>{iconUi({ id: 'players', size: 'sm' })}</Box>
            <Typography sx={sx.title}>{title}</Typography>
          </Box>
        </Box>
        <Typography sx={sx.coverageText}>{message}</Typography>
      </Box>
    )
  }

  return (
    <Box sx={sx.section}>
      <Box sx={sx.header}>
        <Box sx={sx.titleRow}>
          <Box sx={sx.titleIcon}>{iconUi({ id: 'players', size: 'sm' })}</Box>
          <Typography sx={sx.title}>{title}</Typography>
        </Box>
        <Box sx={sx.headerActions}>
          {structure.conclusionDetail ? (
            <Tooltip title={structure.conclusionDetail} placement='bottom' variant='soft'>
              <Box sx={sx.info} aria-label='הסבר על מבנה הסגל'>
                {iconUi({ id: 'info', size: 'sm' })}
              </Box>
            </Tooltip>
          ) : null}
        </Box>
      </Box>

      <Box sx={sx.linesGrid}>
        {LINE_DEFINITIONS.map(definition => (
          <LineCard
            key={definition.key}
            definition={definition}
            structure={structure}
            selectedFilter={selectedFilter}
            onFilterChange={onFilterChange}
          />
        ))}
        <CoverageStrip
          structure={structure}
          selectedFilter={selectedFilter}
          onFilterChange={onFilterChange}
        />
      </Box>

      {children ? (
        <Box sx={sx.tableContent}>
          <Box sx={sx.tableIntro}>
            <Box sx={sx.tableTitleRow}>
              <Box sx={sx.tableTitleIcon}>{iconUi({ id: 'players', size: 'sm' })}</Box>
              <Typography sx={sx.tableTitle}>{seasonKey ? `שחקני סגל לעונת ${seasonKey}` : 'שחקני סגל'}</Typography>
            </Box>
            {onExport ? (
              <Tooltip title='ייצוא כל נתוני הטבלה ל־Excel' placement='bottom'>
                <Button
                  size='sm'
                  variant='outlined'
                  color='neutral'
                  aria-label='ייצוא נתוני סיווג העמדה ל־Excel'
                  sx={sx.exportButton}
                  disabled={exportDisabled}
                  onClick={onExport}
                  startDecorator={iconUi({ id: 'download', size: 'sm' })}
                >
                  Excel
                </Button>
              </Tooltip>
            ) : null}
          </Box>
          {children}
        </Box>
      ) : null}
    </Box>
  )
}
