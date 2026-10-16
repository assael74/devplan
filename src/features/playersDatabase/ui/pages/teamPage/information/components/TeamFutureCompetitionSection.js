// src/features/playersDatabase/ui/pages/teamPage/information/components/TeamFutureCompetitionSection.js

import { useMemo } from 'react'
import { Box, Chip, Typography } from '@mui/joy'
import DataTable from '../../../../components/tables/dataTable/DataTable.js'
import LeagueName from '../../../../components/entities/LeagueName.js'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { TeamYearSection } from '../../yearDevelopment/components/TeamYearDevelopmentShared.js'
import { buildOlderYearTeamRows } from '../model/teamFutureCompetition.model.js'
import { teamFutureCompetitionSx as sx } from '../sx/teamFutureCompetition.sx.js'
import useFutureCompetitionDetails from '../hooks/useFutureCompetitionDetails.js'

const value = number => number === null ? '—' : number
const rankChange = row => {
  if (row.rankChange === null) return '—'
  const color = row.rankChange > 0 ? 'success' : row.rankChange < 0 ? 'danger' : 'neutral'
  const icon = row.rankChange > 0 ? 'sortUp' : row.rankChange < 0 ? 'sortDown' : 'equal'
  const label = row.rankChange > 0 ? 'עלייה' : row.rankChange < 0 ? 'ירידה' : 'ללא שינוי'
  return (
    <Box component='span' sx={sx.change(color)} aria-label={`${label}: ${Math.abs(row.rankChange)} מקומות, מיקום קודם ${row.previousRank}`}>
      {iconUi({ id: icon, size: 'sm' })}
      {Math.abs(row.rankChange)}
    </Box>
  )
}
const columns = [
  {
    key: 'birthYear', label: 'שנתון', sx: { width: '7%' },
    render: row => (
      <Chip size='sm' variant={row.isCurrentYear ? 'outlined' : 'soft'} color={row.isCurrentYear ? 'primary' : 'neutral'}>{row.birthYear}</Chip>
    ),
  },
  { key: 'ageGroup', label: 'קבוצת גיל', sx: { width: '8%' }, render: row => row.ageGroup },
  { key: 'teamSlot', label: 'קבוצה', sx: { width: '5%' }, render: row => value(row.teamSlot) },
  {
    key: 'leagueName', label: 'ליגה ורמה', sx: { width: '15%' },
    render: row => <LeagueName value={row.leagueName} level={row.leagueLevel} showLevel fontSize={11} />,
  },
  { key: 'rank', label: 'מיקום', sx: { width: '5%' }, render: row => value(row.rank) },
  { key: 'rankChange', label: 'שינוי במיקום', sx: { width: '8%' }, render: rankChange },
  { key: 'games', label: 'משחקים', sx: { width: '6%' }, render: row => value(row.games) },
  { key: 'points', label: 'נקודות', sx: { width: '5%' }, render: row => value(row.points) },
  { key: 'successPercent', label: 'אחוז הצלחה', sx: { width: '8%' }, render: row => row.successPercent === null ? '—' : `${row.successPercent}%` },
  { key: 'goalsFor', label: 'שערי זכות', sx: { width: '6%' }, render: row => value(row.goalsFor) },
  { key: 'goalsAgainst', label: 'שערי חובה', sx: { width: '7%' }, render: row => value(row.goalsAgainst) },
  {
    key: 'projection', label: 'מצב התחרות', sx: { width: '14%' },
    getSortValue: row => row.projection.label,
    render: row => <Chip size='sm' variant='soft' color={row.projection.color} sx={sx.status}>{row.projection.label}</Chip>,
  },
  { key: 'projectedLevel', label: 'רמה צפויה', sx: { width: '6%' }, render: row => value(row.projectedLevel) },
]

export default function TeamFutureCompetitionSection({
  groups,
  seasonKey,
  birthYear,
  clubId,
  insight,
}) {
  const { details, loading, error } = useFutureCompetitionDetails(groups, clubId)
  const rows = useMemo(() => buildOlderYearTeamRows(groups, details).map(row => ({
    ...row, isCurrentYear: row.birthYear === Number(birthYear),
  })), [groups, details, birthYear])
  return (
    <TeamYearSection
      iconId='league'
      title='מצב השנתון והשנתונים שמעל במועדון'
      titleAfter={<Chip size='sm' variant='outlined'>{seasonKey}</Chip>}
      titleExtra={<Typography sx={sx.note}>{groups.length} שנתונים</Typography>}
    >
      {insight ? (
        <Box sx={sx.insight(insight.status)}>
          <Typography sx={sx.insightText}>{insight.summary}</Typography>
          <Typography sx={sx.note}>{insight.reliability}</Typography>
        </Box>
      ) : null}
      {loading ? <Typography role='status' sx={sx.note}>טוען נתוני שערים והשוואה לעונה הקודמת…</Typography> : null}
      {error ? <Typography role='status' color='warning' sx={sx.note}>חלק מנתוני השערים או ההשוואה לא נטענו.</Typography> : null}
      <Box sx={sx.scroll} className='dpScrollThin'>
        <DataTable
          columns={columns}
          rows={rows}
          getRowKey={row => row.id}
          defaultSort={{ key: 'birthYear', direction: 'desc' }}
          hoverRow={false}
          getRowSx={row => row.birthYear === Number(birthYear) - 1 ? sx.olderYearRow : undefined}
          wrapSx={sx.wrap}
          tableSx={sx.table}
          emptyText='אין כרגע נתוני שנתונים להצגה במועדון בעונה זו'
        />
      </Box>
      <Typography sx={sx.note}>
        מצב התחרות מתייחס לכל קבוצה בפני עצמה. כשמופיעה רמה נוכחית בלבד, עדיין אין צפי מאושר לשינוי. — נתון חסר.
        {' '}שינוי במיקום מוצג מול העונה הקודמת באותה רמת ליגה ולאחר 8 משחקים לפחות בכל עונה; אחרת מוצג —.
      </Typography>
    </TeamYearSection>
  )
}
