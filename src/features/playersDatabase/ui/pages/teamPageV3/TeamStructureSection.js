import { Box, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { TEAM_STRUCTURE_FILTER } from './model/teamStructureFilter.model.js'
import { teamStructureSx as sx } from './sx/teamStructure.sx.js'

const BENCHMARK_ICONS = Object.freeze({
  below_reference: 'sortDown',
  at_reference: 'equal',
  above_reference: 'sortUp',
})

const LineCount = ({
  label,
  count,
  icon,
  compact = false,
  rate = null,
  reference = null,
  benchmarkState = '',
  filterKey = null,
  selectedFilter = null,
  onFilterChange,
}) => {
  const selected = filterKey === selectedFilter
  const clickable = Boolean(filterKey && onFilterChange)

  return (
  <Box sx={[
    sx.lineCount,
    compact && sx.lineCountCompact,
    !compact && benchmarkState === 'above_reference' && sx.lineCountAboveReference,
    !compact && benchmarkState === 'below_reference' && sx.lineCountBelowReference,
    clickable && sx.lineCountClickable,
    selected && sx.lineCountSelected,
  ]}
  component={clickable ? 'button' : 'div'}
  type={clickable ? 'button' : undefined}
  onClick={clickable ? () => onFilterChange(filterKey) : undefined}
  aria-pressed={clickable ? selected : undefined}
  aria-label={clickable ? `סינון טבלת השחקנים לפי ${label}` : undefined}
>
    <Box sx={sx.lineCountValueRow}>
      <Typography sx={[
        sx.lineCountValue,
        compact && sx.lineCountValueCompact,
        !compact && benchmarkState === 'above_reference' && sx.lineCountValueAboveReference,
        !compact && benchmarkState === 'below_reference' && sx.lineCountValueBelowReference,
      ]}>{count ?? '—'}</Typography>
      {!compact && reference !== null ? (
        <Box sx={[
          sx.referenceChip,
          benchmarkState === 'above_reference' && sx.referenceChipAbove,
          benchmarkState === 'below_reference' && sx.referenceChipBelow,
        ]}>
          <Box sx={sx.referenceChipIcon}>
            {iconUi({ id: BENCHMARK_ICONS[benchmarkState] || 'equal', size: 'sm' })}
          </Box>
          <Typography component='span' sx={sx.referenceChipValue}>{reference}</Typography>
        </Box>
      ) : null}
      {compact && rate !== null ? <Typography sx={sx.lineCountRate}>{rate}%</Typography> : null}
    </Box>
    <Box sx={sx.lineCountFooter}>
      <Box sx={sx.lineCountLabels}>
        <Typography sx={[sx.lineCountLabel, compact && sx.lineCountLabelCompact]}>{label}</Typography>
      </Box>
      <Box sx={sx.lineCountIcon}>{iconUi({ id: icon, size: 'sm' })}</Box>
    </Box>
  </Box>
)

}

const InterestCard = ({ label, icon, interest = {}, presentation = null, onFilterSelect = null }) => {
  const isInteresting = Boolean(interest?.isInteresting)
  const clickable = Boolean(isInteresting && onFilterSelect)
  const isSquadInterest = label === 'עניין סגל'
  const status = isInteresting && presentation?.label
    ? presentation.label
    : isInteresting
      ? 'יש עניין'
      : isSquadInterest
        ? 'חלוקת דקות ללא ממצא משמעותי'
        : 'אין עניין'
  const reason = isInteresting && presentation?.explanation
    ? presentation.explanation
    :
    (isSquadInterest
      ? 'אין כרגע שילוב חד־משמעי של מבנה הסגל והביצועים שמצדיק העמקה'
      : 'אין אות עניין קנוני')

  return (
    <Box
      component={clickable ? 'button' : 'div'}
      type={clickable ? 'button' : undefined}
      onClick={clickable ? onFilterSelect : undefined}
      sx={[sx.interestCard, isInteresting && sx.interestCardActive, clickable && sx.interestCardClickable]}
    >
      <Box sx={sx.interestCardContent}>
        <Typography sx={sx.interestCardLabel}>{label}</Typography>
        <Typography sx={[sx.interestCardStatus, isInteresting && sx.interestCardStatusActive]}>
          {status}
        </Typography>
        {reason ? <Typography sx={sx.interestCardReason}>{reason}</Typography> : null}
      </Box>
      <Box sx={sx.interestCardIcon}>{iconUi({ id: icon, size: 'sm' })}</Box>
    </Box>
  )
}

export default function TeamStructureSection({
  structure = null,
  title = 'ניתוח סגל',
  selectedFilter = TEAM_STRUCTURE_FILTER.CLASSIFIED,
  onFilterChange,
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
          <Typography sx={sx.title}>{title}</Typography>
        </Box>
        <Typography sx={sx.coverage}>{message}</Typography>
      </Box>
    )
  }

  return (
    <Box sx={sx.section}>
      <Box sx={sx.header}>
        <Typography sx={sx.title}>{title}</Typography>
        {structure.conclusionDetail ? (
          <Tooltip title={structure.conclusionDetail} placement='bottom' variant='soft'>
            <Box sx={sx.info} aria-label='הסבר על מבנה הסגל'>
              {iconUi({ id: 'info', size: 'sm' })}
            </Box>
          </Tooltip>
        ) : null}
      </Box>

      <Box sx={sx.interestGrid}>
        <Box sx={sx.defenseInterestArea}>
          <InterestCard label='עניין הגנתי' icon='defense' interest={structure.teamInterest?.lines?.defense} presentation={structure.interestPresentation?.defense} onFilterSelect={() => onFilterChange?.(TEAM_STRUCTURE_FILTER.DEFENSE)} />
        </Box>
        <Box sx={sx.attackInterestArea}>
          <InterestCard label='עניין התקפי' icon='attack' interest={structure.teamInterest?.lines?.offense} presentation={structure.interestPresentation?.offense} onFilterSelect={() => onFilterChange?.(TEAM_STRUCTURE_FILTER.ATTACK)} />
        </Box>
        <Box sx={sx.squadInterestArea}>
          <InterestCard label='עניין סגל' icon='group' interest={structure.teamInterest?.squad} presentation={structure.interestPresentation?.squad} />
        </Box>
      </Box>

      <Box sx={sx.factsGrid}>
        <LineCount label='שוער' count={structure.lines.goalkeeper} icon='goalkeeper' reference={structure.benchmark?.metrics?.goalkeeper?.reference} benchmarkState={structure.benchmark?.metrics?.goalkeeper?.state} filterKey={TEAM_STRUCTURE_FILTER.GOALKEEPER} selectedFilter={selectedFilter} onFilterChange={onFilterChange} />
        <LineCount label='הגנה' count={structure.lines.defense} icon='defense' reference={structure.benchmark?.metrics?.defense?.reference} benchmarkState={structure.benchmark?.metrics?.defense?.state} filterKey={TEAM_STRUCTURE_FILTER.DEFENSE} selectedFilter={selectedFilter} onFilterChange={onFilterChange} />
        <LineCount label='קישור' count={structure.lines.midfield} icon='midfield' reference={structure.benchmark?.metrics?.midfield?.reference} benchmarkState={structure.benchmark?.metrics?.midfield?.state} filterKey={TEAM_STRUCTURE_FILTER.MIDFIELD} selectedFilter={selectedFilter} onFilterChange={onFilterChange} />
        <LineCount label='התקפה' count={structure.lines.attack} icon='attack' reference={structure.benchmark?.metrics?.attack?.reference} benchmarkState={structure.benchmark?.metrics?.attack?.state} filterKey={TEAM_STRUCTURE_FILTER.ATTACK} selectedFilter={selectedFilter} onFilterChange={onFilterChange} />
        <LineCount compact label='מסווגים' count={structure.lines.classified} rate={structure.rates.classified} icon='verified' filterKey={TEAM_STRUCTURE_FILTER.CLASSIFIED} selectedFilter={selectedFilter} onFilterChange={onFilterChange} />
        <LineCount compact label='לא מסווגים 8+' count={structure.lines.unclassifiedSufficientSample} rate={structure.rates.unclassifiedSufficientSample} icon='help' filterKey={TEAM_STRUCTURE_FILTER.UNCLASSIFIED_SUFFICIENT_SAMPLE} selectedFilter={selectedFilter} onFilterChange={onFilterChange} />
        <LineCount compact label='מדגם חסר <8' count={structure.lines.insufficientSample} rate={structure.rates.insufficientSample} icon='time' filterKey={TEAM_STRUCTURE_FILTER.INSUFFICIENT_SAMPLE} selectedFilter={selectedFilter} onFilterChange={onFilterChange} />
      </Box>
      {children ? <Box sx={sx.tableContent}>{children}</Box> : null}
    </Box>
  )
}
