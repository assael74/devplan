// src/features/playersDatabase/ui/pages/teamPage/information/components/TeamClubComparisonSection.js

import { Box, Chip, Typography } from '@mui/joy'
import DataTable from '../../../../components/tables/dataTable/DataTable.js'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import ScoutPriority from '../../../../../../../ui/patterns/scout/ScoutPriority.js'
import { CLUB_COMPARISON_PRIORITY_LEVELS } from '../../../../../../../shared/scouting/teams/clubComparison/index.js'
import { TeamYearSection } from '../../yearDevelopment/components/TeamYearDevelopmentShared.js'
import {
  CLUB_METRIC_LABELS,
  clubComparisonStatusLabel,
  clubMetricDifference,
  clubMetricReason,
  clubMetricTone,
  formatClubMetric,
  formatComparisonSeason,
} from '../model/teamClubComparison.presentation.js'
import { teamClubComparisonSx as sx } from '../sx/teamClubComparison.sx.js'

const metricColumn = (key, width) => ({
  key, label: CLUB_METRIC_LABELS[key], sx: { width: `${width}%` },
  render: row => (
    <Box>
      {(key === 'offense' || key === 'defense') && row[key] !== null ? (
        <ScoutPriority
          value={CLUB_COMPARISON_PRIORITY_LEVELS[row[key]]}
          label={formatClubMetric(key, row[key])}
          number={row[`${key}Score`]}
          fontSize={11}
        />
      ) : <Typography sx={sx.value(row.metrics?.[key]?.isAnomaly)}>{formatClubMetric(key, row[key])}</Typography>}
      {key === 'professionalRate' || key === 'underuseRate' ? (
        <Typography sx={sx.note}>
          {row.profilesAvailable ? `${key === 'professionalRate' ? row.professionalCount : row.underuseCount} מתוך ${row.rosterCount}` : 'נתונים חסרים'}
        </Typography>
      ) : null}
      {row.metrics?.[key]?.isAnomaly ? <Typography sx={sx.note}>חריג ביחס לנורמה</Typography> : null}
    </Box>
  ),
})

const buildColumns = targetId => [
  {
    key: 'birthYear', label: 'שנתון', sx: { width: '8%' },
    render: row => <Chip size='sm' variant={row.teamId === targetId ? 'outlined' : 'soft'} color={row.teamId === targetId ? 'primary' : 'neutral'}>{row.birthYear}</Chip>,
  },
  metricColumn('leagueLevel', 8),
  { key: 'games', label: 'משחקים', sx: { width: '6%' }, render: row => row.games === null ? '—' : row.games },
  metricColumn('successRate', 11),
  metricColumn('offense', 11),
  metricColumn('defense', 11),
  metricColumn('professionalRate', 15),
  metricColumn('underuseRate', 15),
  {
    key: 'status', label: 'איתות', sx: { width: '15%' }, getSortValue: row => row.signalLevel,
    render: row => (
      <Box>
        <Chip size='sm' variant='soft' color={row.signalLevel === 2 ? 'warning' : row.signalLevel === 1 ? 'primary' : 'neutral'} sx={sx.chip}>
          {clubComparisonStatusLabel(row)}
        </Chip>
        <Typography sx={sx.note}>{row.availableCount}/6 מדדים זמינים</Typography>
      </Box>
    ),
  },
]

function MetricEvidence({ metric }) {
  const available = metric.availability === 'available'
  const tone = clubMetricTone(metric)
  return (
    <Box sx={sx.metric(tone)}>
      <Box sx={sx.metricTitle}>
        <Typography level='title-sm'>{CLUB_METRIC_LABELS[metric.key]}</Typography>
        <Chip size='sm' variant='soft' color={tone} sx={sx.chip}>
          {!available ? 'אין השוואה' : tone === 'success' ? 'חריגה חיובית' : tone === 'danger' ? 'חריגה שלילית' : 'ללא חריגה'}
        </Chip>
      </Box>
      <Box sx={sx.values}>
        <Box sx={sx.cohortValue}>
          <Typography sx={sx.valueLabel}>השנתון</Typography>
          <Typography sx={sx.comparisonValue}>{formatClubMetric(metric.key, metric.value)}</Typography>
        </Box>
        <Box sx={sx.normValue}>
          <Typography sx={sx.valueLabel}>נורמת המועדון</Typography>
          <Typography sx={sx.comparisonValue}>{formatClubMetric(metric.key, metric.reference)}</Typography>
        </Box>
      </Box>
      {available ? (
        <>
          <Typography sx={sx.difference(tone)}>
            {iconUi({ id: metric.delta === 0 ? 'equal' : metric.delta > 0 ? 'sortUp' : 'sortDown', size: 'sm' })}
            {clubMetricDifference(metric)}
          </Typography>
          <Typography sx={sx.note}>
            {metric.peerCount} רשומות מ־{metric.cohortCount} שנתונים{metric.key === 'successRate' ? ' באותה רמת ליגה' : ''}
            {' · '}{metric.seasonIds.map(formatComparisonSeason).join(', ')}
          </Typography>
        </>
      ) : <Typography sx={sx.note}>{clubMetricReason(metric)}</Typography>}
    </Box>
  )
}

export default function TeamClubComparisonSection({ comparison, seasonKey }) {
  const { target, rows } = comparison
  return (
    <TeamYearSection
      iconId='players'
      title='השוואת שנתוני המועדון'
      titleAfter={<Chip size='sm' variant='outlined'>{seasonKey}</Chip>}
      titleExtra={<Typography sx={sx.note}>{rows.length} קבוצות ראשיות</Typography>}
    >
      <Box sx={sx.summary}>
        <Typography sx={sx.summaryText}>{comparison.summary}</Typography>
        {comparison.familyText ? <Typography sx={sx.note}>תחומי החריגה: {comparison.familyText}</Typography> : null}
        <Typography sx={sx.note}>{comparison.reliability}</Typography>
        <Typography sx={sx.note}>{comparison.historyText}</Typography>
      </Box>
      {target ? (
        <Box sx={sx.details} aria-label='הסבר השוואת השנתון לחציון המועדון'>
          {Object.values(target.metrics).map(metric => <MetricEvidence key={metric.key} metric={metric} />)}
        </Box>
      ) : null}
      <Box sx={sx.scroll} className='dpScrollThin'>
        <DataTable
          columns={buildColumns(target?.teamId)}
          rows={rows}
          getRowKey={row => row.teamId}
          defaultSort={{ key: 'birthYear', direction: 'desc' }}
          hoverRow={false}
          getRowSx={row => row.teamId === target?.teamId ? sx.currentRow : undefined}
          wrapSx={sx.wrap}
          tableSx={sx.table}
          emptyText='אין נתוני שנתונים להשוואה בעונה זו'
        />
      </Box>
      <Typography sx={{ ...sx.note, mt: 1 }}>
        כל שנתון נבדק מול חציון נתוני העונות הקודמות של כל שנתוני המועדון, כולל העבר שלו.
        נתוני העונה הנבדקת אינם נכללים בנורמה. כל שנתון בעונה נספר פעם אחת, ונדרשים לפחות 3 שנתונים שונים כשירים;
        בביצועים ובפרופילים נדרשים לפחות 8 משחקים. מספר רמת תחרות נמוך יותר מציין רמה גבוהה יותר.
        {' '}הספים: רמת תחרות אחת, 15 נק׳ אחוז בהצלחה, 2 דרגות בעדיפות, ובפרופילים גם פער השקול ל־3 שחקנים לפחות.
        {' '}תחום חריג אחד מפעיל איתות 1; שני תחומים ומעלה מפעילים איתות 2. — מציין נתון חסר.
      </Typography>
    </TeamYearSection>
  )
}
