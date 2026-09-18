// src/features/playersDatabase/ui/pages/leaguePage/LeagueTeamsTable.js

import * as React from 'react'
import { Stack, Typography } from '@mui/joy'

import PageContentPanel from '../../components/page/PageContentPanel.js'
import DataTable from '../../components/tables/dataTable/index.js'
import { getFullDateTimeIl } from '../../../../../shared/format/dateUtils.js'
import { buildLeagueTeamsColumns } from './logic/leagueTeams.columns.js'
import { leagueTeamsTableSx as sx } from './sx/leagueTeamsTable.sx.js'

const clean = value => String(value || '').trim()
const safeFilePart = value => clean(value)
  .replace(/[\\/:*?"<>|]+/g, '-')
  .replace(/\s+/g, ' ')
  .replace(/-+/g, '-')
  .trim()
const toNumber = value => {
  const nextValue = Number(value)
  return Number.isFinite(nextValue) ? nextValue : 0
}

const PRIORITY_LABELS = {
  elite: 'יעד מוביל',
  high: 'עדיפות גבוהה',
  positive: 'חיובי',
  neutral: 'רגיל',
  low: 'עדיפות נמוכה',
  unavailable: 'לא זמין',
}

const resolveTeamUrl = row => clean(row?.teamUrl || row?.teamStats?.teamUrl)
const resolveTeamName = row => clean(row?.name || row?.teamName || row?.displayName)
const resolveTeamStats = row => row?.teamStats || {}
const resolvePriorityLabel = value => PRIORITY_LABELS[clean(value)] || clean(value)
const normalizePlaces = values => new Set((Array.isArray(values) ? values : [])
  .map(value => Number(value))
  .filter(value => Number.isInteger(value) && value > 0))

const buildCompetitionRowSx = rules => {
  const promotion = normalizePlaces(rules?.promotion?.directPlaces)
  const promotionPlayoff = normalizePlaces(rules?.promotion?.playoffPlaces)
  const relegation = normalizePlaces(rules?.relegation?.directPlaces)
  const relegationPlayoff = normalizePlaces(rules?.relegation?.playoffPlaces)

  return row => {
    const rank = toNumber(row?.tableRank)
    const backgroundColor = promotion.has(rank)
      ? 'rgba(46, 125, 50, 0.14)'
      : relegation.has(rank)
        ? 'rgba(237, 108, 2, 0.15)'
        : promotionPlayoff.has(rank) || relegationPlayoff.has(rank)
          ? 'rgba(25, 118, 210, 0.12)'
          : ''

    return backgroundColor ? {
      '& > td': { bgcolor: backgroundColor },
      '&:hover > td': { bgcolor: backgroundColor },
    } : {}
  }
}

export const buildLeagueTableExportConfig = ({
  selectedSeasonOption,
  leagueName = '',
  region = '',
  ageGroup = '',
  birthYear = '',
  rowsCount = 0,
} = {}) => ({
  enabled: rowsCount > 0,
  placementColumnKey: 'actions',
  align: 'end',
  buttonLabel: 'Excel',
  showLabel: true,
  tooltip: 'הורדת טבלת הליגה המלאה',
  fileName: [
    safeFilePart(leagueName) || 'ליגה',
    safeFilePart(region) || 'אזור',
    safeFilePart(ageGroup) || 'קבוצת גיל',
    safeFilePart(birthYear) || 'שנתון',
    safeFilePart(selectedSeasonOption?.seasonKey) || 'עונה',
  ].join(' - '),
  sheetName: 'League Table',
  getRows: rows => rows,
  columns: [
    {
      key: 'tableRank',
      label: 'מיקום',
      value: row => toNumber(row?.tableRank),
    },
    {
      key: 'teamName',
      label: 'קבוצה',
      value: row => resolveTeamName(row),
    },
    {
      key: 'games',
      label: 'משחקים',
      value: row => toNumber(row?.games),
    },
    {
      key: 'wins',
      label: 'ניצחונות',
      value: row => toNumber(resolveTeamStats(row).wins),
    },
    {
      key: 'draws',
      label: 'תיקו',
      value: row => toNumber(resolveTeamStats(row).draws),
    },
    {
      key: 'losses',
      label: 'הפסדים',
      value: row => toNumber(resolveTeamStats(row).losses),
    },
    {
      key: 'goalsFor',
      label: 'שערי זכות',
      value: row => toNumber(row?.goalsFor),
    },
    {
      key: 'goalsAgainst',
      label: 'שערי חובה',
      value: row => toNumber(row?.goalsAgainst),
    },
    {
      key: 'goalDifference',
      label: 'הפרש שערים',
      value: row => (
        toNumber(row?.goalsFor) -
        toNumber(row?.goalsAgainst)
      ),
    },
    {
      key: 'points',
      label: 'נקודות',
      value: row => toNumber(row?.points),
    },
    {
      key: 'attackPriority',
      label: 'עדיפות התקפית',
      value: row => resolvePriorityLabel(row?.attackPriority),
    },
    {
      key: 'defensePriority',
      label: 'עדיפות הגנתית',
      value: row => resolvePriorityLabel(row?.defensePriority),
    },
    {
      key: 'playersCount',
      label: 'שחקנים',
      value: row => toNumber(row?.playersCount),
    },
    {
      key: 'profilesCount',
      label: 'פרופילים',
      value: row => toNumber(row?.profilesCount),
    },
    {
      key: 'profileAssignmentsCount',
      label: 'שיוכי פרופילים',
      value: row => toNumber(row?.profileAssignmentsCount),
    },
    {
      key: 'teamUrl',
      label: 'קישור קבוצה',
      value: row => resolveTeamUrl(row),
    },
  ],
})

export default function LeagueTeamsTable({
  rows = [],
  loading = false,
  error = '',
  selectedSeasonOption = null,
  leagueName = '',
  region = '',
  ageGroup = '',
  birthYear = '',
  onTeamOpen,
  onTeamUrlEdit,
  onFavoriteToggle,
}) {
  const columns = React.useMemo(() => (
    buildLeagueTeamsColumns({
      onTeamOpen,
      onTeamUrlEdit,
      onFavoriteToggle: row => {
        Promise.resolve(onFavoriteToggle?.(row)).catch(() => {})
      },
    })
  ), [onFavoriteToggle, onTeamOpen, onTeamUrlEdit])
  const exportConfig = React.useMemo(
    () => buildLeagueTableExportConfig({
      selectedSeasonOption,
      leagueName,
      region,
      ageGroup,
      birthYear,
      rowsCount: rows.length,
    }),
    [
      ageGroup,
      birthYear,
      leagueName,
      region,
      rows.length,
      selectedSeasonOption,
    ]
  )
  const lastUpdated = selectedSeasonOption?.season?.updatedAt
  const competitionRowSx = React.useMemo(() => (
    buildCompetitionRowSx(selectedSeasonOption?.season?.competitionRules)
  ), [selectedSeasonOption?.season?.competitionRules])
  const headerActions = (
    <Stack sx={sx.headerInfo}>
      <Typography level='body-xs' sx={sx.headerInfoText}>טבלת הליגה היא מקור האמת לביצועי הקבוצה</Typography>
      <Typography level='body-xs' sx={sx.headerInfoText}>עדכון אחרון: {getFullDateTimeIl(lastUpdated)}</Typography>
    </Stack>
  )

  return (
    <PageContentPanel
      title='טבלת ליגה'
      headerActions={headerActions}
    >
      <DataTable
        className='dpScrollThin'
        columns={columns}
        rows={rows}
        getRowKey={row => row.id}
        defaultSort={{
          key: 'tableRank',
          direction: 'asc',
        }}
        emptyText={
          loading
            ? 'טוען נתוני ליגה...'
            : error || 'אין נתוני טבלה לעונה שנבחרה'
        }
        wrapSx={sx.tableWrap}
        getRowSx={competitionRowSx}
        exportConfig={exportConfig}
      />
    </PageContentPanel>
  )
}
