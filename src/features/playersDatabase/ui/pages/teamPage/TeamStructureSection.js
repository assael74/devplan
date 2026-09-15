import { Box, Button, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { TEAM_STRUCTURE_FILTER } from './model/teamStructureFilter.model.js'
import { teamStructureSx as sx } from './sx/teamStructure.sx.js'

const BENCHMARK_ICONS = Object.freeze({
  below_reference: 'sortDown',
  at_reference: 'equal',
  above_reference: 'sortUp',
})

const CLASSIFICATION_COVERAGE_CARD_STATE = Object.freeze({
  below_typical: Object.freeze({
    tone: 'review',
    benchmarkIconId: 'sortDown',
  }),
  typical: Object.freeze({
    tone: 'clear',
    benchmarkIconId: 'equal',
  }),
  above_typical: Object.freeze({
    tone: 'review',
    benchmarkIconId: 'sortUp',
  }),
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
  const isInteresting = Boolean(interest?.isInteresting)
  return {
    count: structure?.lines?.[definition.key],
    reference: metric?.reference === undefined || metric?.reference === null ? null : metric.reference,
    benchmarkState: metric?.state || '',
    isInteresting,
  }
}

const LineCard = ({ definition, structure, selectedFilter, onFilterChange }) => {
  const state = resolveLineState({ definition, structure })
  const selected = definition.filterKey === selectedFilter
  const clickable = Boolean(onFilterChange)
  const handleCardKeyDown = event => {
    if (!clickable || !['Enter', ' '].includes(event.key)) return
    event.preventDefault()
    onFilterChange(definition.filterKey)
  }

  return (
    <Box
      component='div'
      onClick={clickable ? () => onFilterChange(definition.filterKey) : undefined}
      onKeyDown={handleCardKeyDown}
      sx={[
        sx.lineCard,
        state.isInteresting ? sx.lineCardReview : sx.lineCardClear,
        clickable && sx.lineCardClickable,
        selected && (state.isInteresting ? sx.lineCardReviewSelected : sx.lineCardSelected),
      ]}
      aria-pressed={clickable ? selected : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={clickable ? `הצגת שחקני ${definition.label}` : undefined}
    >
      <Box sx={sx.lineBody}>
        <Box sx={sx.lineHeader}>
          <Box sx={sx.lineHeading}>
            <Box sx={sx.lineIcon}>{iconUi({ id: definition.iconId, size: 'sm' })}</Box>
            <Typography sx={sx.lineLabel}>{definition.label}</Typography>
          </Box>
        </Box>

        <Box sx={sx.lineMetricRow}>
          <Typography sx={sx.lineValue}>{state.count === undefined || state.count === null ? '—' : state.count}</Typography>
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
      </Box>
    </Box>
  )
}

const CoverageStrip = ({ structure, selectedFilter, onFilterChange }) => {
  const classified = structure?.lines?.classified
  const selected = selectedFilter === TEAM_STRUCTURE_FILTER.ALL_SQUAD
  const coverageState = CLASSIFICATION_COVERAGE_CARD_STATE[
    String(structure?.classificationCoverageBenchmark?.state || '').trim()
  ] || CLASSIFICATION_COVERAGE_CARD_STATE.typical
  const clickable = Boolean(onFilterChange)
  const handleCardKeyDown = event => {
    if (!clickable || !['Enter', ' '].includes(event.key)) return
    event.preventDefault()
    onFilterChange(TEAM_STRUCTURE_FILTER.ALL_SQUAD)
  }

  return (
    <Box
      component='div'
      onClick={clickable ? () => onFilterChange(TEAM_STRUCTURE_FILTER.ALL_SQUAD) : undefined}
      onKeyDown={handleCardKeyDown}
      sx={[
        sx.lineCard,
        coverageState.tone === 'review' ? sx.lineCardReview : sx.lineCardClear,
        clickable && sx.lineCardClickable,
        selected && (coverageState.tone === 'review' ? sx.lineCardReviewSelected : sx.lineCardSelected),
      ]}
      aria-pressed={clickable ? selected : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={clickable ? 'הצגת כל שחקני הסגל' : undefined}
    >
      <Box sx={sx.lineBody}>
        <Box sx={sx.lineHeader}>
          <Box sx={sx.lineHeading}>
            <Box sx={sx.lineIcon}>{iconUi({ id: 'verified', size: 'sm' })}</Box>
            <Typography sx={sx.lineLabel}>פיזור דקות מסווגות</Typography>
          </Box>
        </Box>

        <Box sx={sx.lineMetricRow}>
          <Typography sx={sx.lineValue}>{classified === undefined || classified === null ? '—' : classified}</Typography>
          <Box sx={sx.referenceChip}>
            <Box sx={sx.referenceChipIcon}>
              {iconUi({ id: coverageState.benchmarkIconId, size: 'sm' })}
            </Box>
            <Typography component='span' sx={sx.referenceChipText}>יעד 10–13</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default function TeamStructureSection({
  structure = null,
  title = 'מבנה הסגל',
  titleMeta = null,
  seasonKey = '',
  selectedFilter = TEAM_STRUCTURE_FILTER.CLASSIFIED,
  onFilterChange,
  onExport,
  exportDisabled = false,
  children,
}) {
  if (!structure) {
    return (
      <Box sx={sx.section}>
        <Box sx={sx.header}>
          <Box sx={sx.titleRow}>
            <Box sx={sx.titleIcon}>{iconUi({ id: 'players', size: 'sm' })}</Box>
            <Typography sx={sx.title}>{title}</Typography>
            {titleMeta}
          </Box>
        </Box>
        <Typography sx={sx.coverageText}>לא נטענו עדיין שחקנים לעונה זאת.</Typography>
      </Box>
    )
  }

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
            {titleMeta}
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
          {titleMeta}
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
