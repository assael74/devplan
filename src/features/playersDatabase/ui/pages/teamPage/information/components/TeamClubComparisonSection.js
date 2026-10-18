// src/features/playersDatabase/ui/pages/teamPage/information/components/TeamClubComparisonSection.js

import { useState } from 'react'
import { Box, Button, Chip, Typography } from '@mui/joy'
import DataTable from '../../../../components/tables/dataTable/DataTable.js'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { CLUB_COMPARISON_METRICS } from '../../../../../../../shared/scouting/teams/clubComparison/index.js'
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
import { teamInformationSx } from '../sx/teamInformation.sx.js'
import { teamClubComparisonSx as sx } from '../sx/teamClubComparison.sx.js'

const FAMILY_SECTIONS = [
  { key: 'competition', label: 'תחרות' },
  { key: 'squad', label: 'סגל' },
  { key: 'performance', label: 'ביצועים' },
]

const metricColumn = (key, width, shortLabel) => ({
  key, label: CLUB_METRIC_LABELS[key], headerContent: shortLabel, headerAriaLabel: CLUB_METRIC_LABELS[key],
  sx: { width: `${width}%` },
  render: row => (
    <Box title={row.metrics?.[key]?.isAnomaly ? 'חריג ביחס לנורמת המועדון' : CLUB_METRIC_LABELS[key]}>
      <Typography sx={sx.tableValue(row.metrics?.[key]?.isAnomaly)}>{formatClubMetric(key, row[key])}</Typography>
      {key === 'professionalRate' || key === 'underuseRate' ? (
        <Typography sx={sx.tableNote}>
          {row.profilesAvailable ? `${key === 'professionalRate' ? row.professionalCount : row.underuseCount}/${row.rosterCount}` : 'חסר'}
        </Typography>
      ) : null}
      {key === 'rankPercentile' && row.rank !== null ? (
        <Typography sx={sx.tableNote}>{row.rank}/{row.leagueTeamCount}</Typography>
      ) : null}
    </Box>
  ),
})

const buildColumns = targetId => [
  {
    key: 'birthYear', label: 'שנתון', sx: { width: '7%' },
    render: row => <Chip size='sm' variant={row.teamId === targetId ? 'outlined' : 'soft'} color={row.teamId === targetId ? 'primary' : 'neutral'}>{row.birthYear}</Chip>,
  },
  metricColumn('leagueLevel', 6, 'ליגה'),
  { key: 'games', label: 'משחקים', headerContent: 'מש׳', sx: { width: '5%' }, render: row => row.games === null ? '—' : row.games },
  metricColumn('rankPercentile', 9, 'מיקום'),
  metricColumn('successRate', 8, 'הצלחה'),
  metricColumn('goalsForPerGame', 8, 'שערים'),
  metricColumn('goalsAgainstPerGame', 8, 'ספיגות'),
  metricColumn('offense', 8, 'התקפה'),
  metricColumn('defense', 8, 'הגנה'),
  metricColumn('professionalRate', 9, 'מקצועיים'),
  metricColumn('underuseRate', 9, 'חוסר שימוש'),
  {
    key: 'status', label: 'איתות', sx: { width: '15%' }, getSortValue: row => row.signalLevel,
    render: row => (
      <Box title={clubComparisonStatusLabel(row)}>
        <Chip size='sm' variant='soft' color={row.signalLevel === 2 ? 'warning' : row.signalLevel === 1 ? 'primary' : 'neutral'} sx={sx.chip}>
          {row.signalLevel ? `איתות ${row.signalLevel}` : row.status === 'limited' ? 'חלקי' : 'ללא חריגה'}
        </Chip>
        <Typography sx={sx.tableNote}>{row.availableCount}/{CLUB_COMPARISON_METRICS.length} מדדים</Typography>
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
      <Box sx={sx.metricFacts}>
        <Typography sx={sx.metricValue}>השנתון <strong>{formatClubMetric(metric.key, metric.value)}</strong></Typography>
        <Typography sx={sx.metricValue}>נורמה <strong>{formatClubMetric(metric.key, metric.reference)}</strong></Typography>
        {available ? (
          <Typography sx={sx.difference(tone)}>
            {iconUi({ id: metric.delta === 0 ? 'equal' : metric.delta > 0 ? 'sortUp' : 'sortDown', size: 'sm' })}
            {clubMetricDifference(metric)}
          </Typography>
        ) : null}
      </Box>
      {available ? (
        <Typography sx={sx.metricNote} title={metric.seasonIds.map(formatComparisonSeason).join(', ')}>
          {metric.cohortCount} שנתונים{metric.key === 'successRate' ? ' · אותה רמת ליגה' : ''}
          {metric.isEarlySample ? ' · מדגם מוקדם' : ''}
          {metric.key === 'rankPercentile' ? ' · 0% ראש הטבלה' : ''}
        </Typography>
      ) : <Typography sx={sx.metricNote}>{clubMetricReason(metric)}</Typography>}
    </Box>
  )
}

function FamilySection({ family, metrics, signalLevel }) {
  const [openOverride, setOpenOverride] = useState(null)
  const activeCount = metrics.filter(metric => metric.isAnomaly).length
  const availableCount = metrics.filter(metric => metric.availability === 'available').length
  const status = activeCount === 0 ? 'none'
    : family.key === 'competition' || family.key === 'performance' || signalLevel === 2 ? 'multiple' : 'single'
  const open = openOverride === null ? activeCount > 0 : openOverride
  const familyLabel = activeCount ? `${activeCount} תתי־איתותים`
    : availableCount === 0 ? 'אין מספיק נתונים'
      : availableCount < metrics.length ? 'השוואה חלקית' : 'ללא חריגה'

  return (
    <Box sx={[sx.family, teamInformationSx.insightTileShadow(status)]}>
      <Button
        variant='plain'
        color='neutral'
        aria-expanded={open}
        aria-label={`${family.label}: ${familyLabel}. ${open ? 'סגירת' : 'פתיחת'} המדדים`}
        onClick={() => setOpenOverride(!open)}
        sx={sx.familyToggle}
      >
        <Box sx={sx.familyHeader}>
          <Typography level='title-sm'>{family.label}</Typography>
          <Chip size='sm' variant='outlined' sx={[sx.chip, teamInformationSx.insightTileStatus(status)]}>
            {familyLabel}
          </Chip>
        </Box>
        <Box sx={sx.familyArrow(open)}>{iconUi({ id: 'arrowDown', size: 'sm' })}</Box>
      </Button>
      <Box sx={sx.familyContent(open)} aria-hidden={!open}>
        <Box sx={sx.familyInner}>
          <Box sx={sx.details(family.key)}>
            {metrics.map(metric => <MetricEvidence key={metric.key} metric={metric} />)}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default function TeamClubComparisonSection({ comparison, seasonKey }) {
  const { target, rows } = comparison
  const families = target ? FAMILY_SECTIONS.map(family => ({
    ...family,
    metrics: Object.values(target.metrics).filter(metric => metric.family === family.key),
  })) : []
  const performanceFirst = families.length > 0 && families[2].metrics.some(metric => metric.isAnomaly) &&
    !families.slice(0, 2).some(family => family.metrics.some(metric => metric.isAnomaly))
  const performanceSection = families[2] && (
    <FamilySection key={`${target.teamId}-${seasonKey}-performance`} family={families[2]} metrics={families[2].metrics} signalLevel={target.signalLevel} />
  )
  const pairedSections = families.length > 0 && (
    <Box key='competition-squad' sx={sx.familyPair}>
      {families.slice(0, 2).map(family => (
        <FamilySection key={`${target.teamId}-${seasonKey}-${family.key}`} family={family} metrics={family.metrics} signalLevel={target.signalLevel} />
      ))}
    </Box>
  )
  return (
    <TeamYearSection hideHeader>
      <Box sx={sx.summary}>
        <Box sx={sx.summaryHeader}>
          <Typography sx={sx.summaryText} title={comparison.summary}>{comparison.headline}</Typography>
          <Box sx={sx.summaryBadges}>
            <Chip size='sm' variant='outlined' sx={sx.chip}>{seasonKey}</Chip>
            <Chip size='sm' variant='soft' color={target?.signalLevel === 2 ? 'warning' : target?.signalLevel === 1 ? 'primary' : 'neutral'} sx={sx.chip}>
              {comparison.label}
            </Chip>
          </Box>
        </Box>
        <Typography sx={sx.note}>{comparison.reliability}</Typography>
        <Typography sx={sx.note}>{comparison.historyText}</Typography>
      </Box>
      {target ? (
        <Box sx={sx.families} aria-label='תתי־איתותים ביחס לחציון המועדון'>
          {performanceFirst ? performanceSection : pairedSections}
          {performanceFirst ? pairedSections : performanceSection}
        </Box>
      ) : null}
      <Box sx={sx.scroll}>
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
        בביצועים נדרשים לפחות 3 משחקים בעונה הנבדקת ו־8 בעונות ההשוואה; ב־3–7 משחקים האיתות מוקדם. בפרופילים נדרשים 8 משחקים.
        {' '}הספים: רמת תחרות אחת, רבע טבלה במיקום יחסי, 15 נק׳ אחוז בהצלחה, שער אחד למשחק בכיבוש או בספיגה, 2 דרגות בעדיפות, ובפרופילים גם פער השקול ל־3 שחקנים לפחות.
        {' '}חריגת תחרות מפעילה איתות 2; בלעדיה תחום חריג אחד מפעיל איתות 1 ושני תחומים מפעילים איתות 2. — מציין נתון חסר.
      </Typography>
    </TeamYearSection>
  )
}
