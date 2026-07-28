// features/reports/renderers/external/league/LeagueTableContent.js

import * as React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import { SortMenuButton } from '../../../../../ui/patterns/sort/index.js'

import { resolveTeamScoutPriorityLevel } from '../../../../../shared/teams/scout/index.js'
import {
  ReportList,
  ReportListRow,
  ReportListToolbar,
  ReportMetric,
  ReportViewToggle,
} from '../shared/index.js'
import { leagueTableSx as sx } from './leagueTable.sx.js'

const LEVEL_DISPLAY = {
  elite: { label: 'יעד מוביל', border: '#1F7A4D', background: '#E8F5EE', text: '#175C3A' },
  high: { label: 'עדיפות גבוהה', border: '#2F86C7', background: '#EAF5FC', text: '#215F8F' },
  positive: { label: 'חיובי', border: '#4F9A73', background: '#EDF7F1', text: '#356B4F' },
  exceptional: { label: 'חריג', border: '#9B2C2C', background: '#FFF1F1', text: '#7F1D1D' },
  quality: { label: 'איכותי', border: '#7C3AED', background: '#F3E8FF', text: '#5B21B6' },
  preferred: { label: 'מועדף', border: '#2F86C7', background: '#EAF5FC', text: '#215F8F' },
  neutral: { label: 'רגיל', border: '#B9C3CA', background: '#F1F4F6', text: '#4D5B66' },
  low: { label: 'עדיפות נמוכה', border: '#C58A32', background: '#FBF3E6', text: '#8A5E1F' },
  unavailable: { label: 'לא זמין', border: '#D5DCE1', background: '#F7F8F9', text: '#657684' },
}

const VIEW_OPTIONS = [
  { id: 'performance', label: 'ביצוע חריג' },
  { id: 'quality', label: 'ביצוע איכותי' },
  { id: 'combined', label: 'ביצוע משולב' },
]

const SORT_OPTIONS = [
  { id: 'tableRank', label: 'מיקום', defaultDirection: 'asc' },
  { id: 'offense', label: 'ביצוע התקפי', defaultDirection: 'desc' },
  { id: 'defense', label: 'ביצוע הגנתי', defaultDirection: 'desc' },
]

const HEADERS = [
  { id: 'team', label: 'מיקום וקבוצה' },
  { id: 'stats', label: 'נתוני ליגה' },
  { id: 'offense', label: 'ביצוע התקפי' },
  { id: 'defense', label: 'ביצוע הגנתי' },
]

function toDisplayNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function formatRate(value) {
  const number = Number(value)
  return Number.isFinite(number) ? `${Math.round(number)}%` : '—'
}

function getLevel(value) {
  return LEVEL_DISPLAY[value] || LEVEL_DISPLAY.unavailable
}

function resolveQualityLevel(rate) {
  return resolveTeamScoutPriorityLevel(rate)
}

function getViewValue(side = {}, view = 'combined') {
  if (view === 'performance') {
    return {
      rate: side.anomalyRate,
      level: side.performanceLevel,
    }
  }

  if (view === 'quality') {
    return {
      rate: side.qualityRate,
      level: resolveQualityLevel(side.qualityRate),
    }
  }

  return {
    rate: side.combinedRate,
    level: side.combinedLevel,
  }
}

function getSortValue(row, sortBy, view) {
  if (sortBy === 'offense') return Number(getViewValue(row.offense, view).rate) || 0
  if (sortBy === 'defense') return Number(getViewValue(row.defense, view).rate) || 0
  return Number(row[sortBy]) || 0
}

function sortRows(rows, sortBy, sortDirection, view) {
  const direction = sortDirection === 'asc' ? 1 : -1

  return [...rows].sort((first, second) => {
    const firstValue = getSortValue(first, sortBy, view)
    const secondValue = getSortValue(second, sortBy, view)

    if (firstValue === secondValue) {
      return (Number(first.tableRank) - Number(second.tableRank))
    }

    return (firstValue - secondValue) * direction
  })
}

function SummaryItem({ label, value }) {
  return (
    <Sheet variant='plain' sx={sx.summaryItem}>
      <Typography component='span' sx={sx.summaryValue}>
        {toDisplayNumber(value)}
      </Typography>
      <Typography component='span' sx={sx.summaryLabel}>
        {label}
      </Typography>
    </Sheet>
  )
}

function PerformanceValue({ side = {}, view = 'combined', label }) {
  const value = getViewValue(side, view)
  const display = getLevel(value.level)

  return (
    <Box
      sx={{
        ...sx.performance,
        borderColor: display.border,
        bgcolor: display.background,
        color: display.text,
      }}
    >
      <Typography component='span' sx={sx.performanceMobileLabel}>
        {label}
      </Typography>
      <Typography component='span' sx={sx.performanceLabel}>
        {display.label}
      </Typography>
      <Typography component='span' sx={sx.performanceRate}>
        {formatRate(value.rate)}
      </Typography>
    </Box>
  )
}

function LeagueRow({ row = {}, view }) {
  return (
    <ReportListRow
      identity={(
        <Box sx={sx.identity}>
          <Box sx={sx.rank}>{row.tableRank || '—'}</Box>
          <Typography component='span' sx={sx.teamName}>
            {row.name || 'קבוצה'}
          </Typography>
        </Box>
      )}
      stats={(
        <>
          <ReportMetric label='משחקים' value={toDisplayNumber(row.games)} compact />
          <ReportMetric label='שערים' value={toDisplayNumber(row.goalsFor)} compact />
          <ReportMetric label='ספיגה' value={toDisplayNumber(row.goalsAgainst)} compact />
          <ReportMetric label='נקודות' value={toDisplayNumber(row.points)} compact />
          <ReportMetric label='הצלחה' value={formatRate(row.successRate)} compact />
        </>
      )}
      third={<PerformanceValue side={row.offense} view={view} label='התקפה' />}
      fourth={<PerformanceValue side={row.defense} view={view} label='הגנה' />}
    />
  )
}

export default function LeagueTableContent({ model = {} }) {
  const [view, setView] = React.useState('combined')
  const [sortBy, setSortBy] = React.useState('tableRank')
  const [sortDirection, setSortDirection] = React.useState('asc')
  const content = model.content || {}
  const snapshot = model.snapshot || {}
  const summary = snapshot.summary || {}
  const rows = Array.isArray(snapshot.rows) ? snapshot.rows : []
  const sortedRows = React.useMemo(
    () => sortRows(rows, sortBy, sortDirection, view),
    [rows, sortBy, sortDirection, view]
  )

  return (
    <Box sx={sx.root}>
      <Box sx={sx.intro}>
        <Box sx={sx.introCopy}>
          <Typography level='title-md' sx={sx.title}>
            {content.title || 'מפת ביצועי הקבוצות'}
          </Typography>
          <Typography level='body-sm' sx={sx.description}>
            {content.description || 'צילום מצב הליגה בזמן פרסום הדוח.'}
          </Typography>
        </Box>

        <Box sx={sx.summary}>
          <SummaryItem label='שערים בליגה' value={summary.goalsCount} />
          <SummaryItem label='חריג בהגנה' value={summary.defenseAnomalyRecommended} />
          <SummaryItem label='משולב בהגנה' value={summary.defenseCombinedRecommended} />
          <SummaryItem label='חריג בהתקפה' value={summary.offenseAnomalyRecommended} />
          <SummaryItem label='משולב בהתקפה' value={summary.offenseCombinedRecommended} />
        </Box>
      </Box>

      <ReportListToolbar
        entityType='team'
        title='רשימת קבוצות'
        headers={HEADERS}
      />

      <Box sx={sx.controls}>
        <Box sx={sx.sortControl}>
          <SortMenuButton
            sortBy={sortBy}
            sortDirection={sortDirection}
            sortOptions={SORT_OPTIONS}
            onChangeSortBy={setSortBy}
            onChangeSortDirection={setSortDirection}
            width={112}
            compact
          />
        </Box>

        <Box sx={sx.viewControl}>
          <ReportViewToggle
            value={view}
            options={VIEW_OPTIONS}
            onChange={setView}
            ariaLabel='בחירת שכבת ביצוע'
          />
        </Box>
      </Box>

      <ReportList
        rows={sortedRows}
        emptyText='אין קבוצות להצגה בדוח זה.'
        renderRow={(row, index) => (
          <LeagueRow
            key={row.id || `${row.name || 'team'}-${index}`}
            row={row}
            view={view}
          />
        )}
      />
    </Box>
  )
}
