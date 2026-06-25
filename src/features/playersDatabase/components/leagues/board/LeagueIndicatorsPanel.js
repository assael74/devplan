// src/features/playersDatabase/components/leagues/board/LeagueIndicatorsPanel.js

import React from 'react'
import {
  Box,
  Chip,
  Table,
  Typography,
} from '@mui/joy'

import {
  getLeagueLevelLabel,
  getLeagueRegionLabel,
  getLeagueSeasonRows,
} from '../leagueUtils.js'
import { ReportPrintButton } from '../../../../../ui/patterns/reportPrint/index.js'
import { detailSx as sx } from './sx/detail.sx.js'

const clean = value => String(value ?? '').trim()

const getIndicatorTeamKey = item => (
  clean(item?.currentTeam?.teamSeasonKey) ||
  clean(item?.currentTeam?.teamSlotId) ||
  clean(item?.clubId) ||
  clean(item?.clubName)
)

const formatTeamLabel = team => {
  const levelLabel =
    team?.leagueLevel === null ||
    team?.leagueLevel === undefined
      ? ''
      : getLeagueLevelLabel(team.leagueLevel)

  return [
    team?.ageGroupLabel,
    levelLabel,
  ].filter(Boolean).join(' | ') || '-'
}

function IndicatorColumns() {
  return (
    <colgroup>
      <col style={{ width: 30 }} />
      <col style={{ width: '30%' }} />
      <col />
      <col />
      <col style={{ width: 64 }} />
      <col style={{ width: 92 }} />
    </colgroup>
  )
}

const getPrintLeagueContext = league => {
  const primarySeason = getLeagueSeasonRows(league)[0] || {}
  const birthYear =
    primarySeason.primaryBirthYear ||
    primarySeason.birthYear ||
    primarySeason.birthYears?.join(', ') ||
    '-'

  return {
    birthYear,
    leagueName: league?.leagueName || '-',
    leagueLevel: getLeagueLevelLabel(league?.level),
    region: getLeagueRegionLabel(league?.region),
    ageGroup: league?.ageGroupLabel || primarySeason.ageGroupLabel || '-',
  }
}

const buildDefaultPrintFileName = context => [
  'אינדיקציות',
  context.ageGroup,
  context.leagueLevel,
  context.region,
  context.birthYear,
].filter(value => value && value !== '-').join('_')

function LeagueIndicatorsPrintReport({
  league,
  rows,
  riskClubCount,
  maxLevelGap,
  displayProfilesCount,
}) {
  const context = getPrintLeagueContext(league)

  return (
    <Box
      className="dpPrintSection"
      sx={{
        p: 2,
        display: 'grid',
        gap: 1.5,
        color: '#111827',
      }}
    >
      <Box>
        <Typography level="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
          אינדיקציות ליגה
        </Typography>

        <Typography level="body-sm" sx={{ color: '#4b5563' }}>
          מועדונים בסיכון: {riskClubCount} | פער מקסימלי: {maxLevelGap} | פרופילים: {displayProfilesCount}
        </Typography>
      </Box>

      <Box
        className="dpPrintCard"
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 1,
          p: 1.25,
          border: '2px solid #1d4ed8',
          borderRadius: '8px',
          bgcolor: '#eff6ff',
        }}
      >
        {[
          ['שנתון', context.birthYear],
          ['ליגה מצולמת', `${context.leagueName} | ${context.leagueLevel}`],
          ['אזור', context.region],
          ['קבוצת גיל', context.ageGroup],
        ].map(([label, value]) => (
          <Box key={label}>
            <Typography
              level="body-xs"
              sx={{ color: '#1e40af', fontWeight: 700, mb: 0.35 }}
            >
              {label}
            </Typography>
            <Typography
              level="title-md"
              sx={{ color: '#111827', fontWeight: 700 }}
            >
              {value || '-'}
            </Typography>
          </Box>
        ))}
      </Box>

      <Table
        size="sm"
        borderAxis="bothBetween"
        sx={{
          '--TableCell-paddingX': '8px',
          '--TableCell-paddingY': '7px',
          fontSize: 12,
          tableLayout: 'fixed',
          border: '1px solid #d1d5db',

          '& th': {
            bgcolor: '#eef2f7',
            color: '#374151',
            fontWeight: 700,
          },

          '& td': {
            color: '#111827',
            fontWeight: 600,
            verticalAlign: 'middle',
          },
        }}
      >
        <IndicatorColumns />
        <thead>
          <tr>
            <th>#</th>
            <th>מועדון</th>
            <th>נוכחי</th>
            <th>מעל</th>
            <th>פרופילים</th>
            <th>אינדיקציה</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item, index) => (
            <tr key={item.id || `${item.clubId}-${index}`}>
              <td>{index + 1}</td>
              <td>{item.clubName || '-'}</td>
              <td>{formatTeamLabel(item.currentTeam)}</td>
              <td>{item.upperTeam ? formatTeamLabel(item.upperTeam) : '-'}</td>
              <td>{item.scoutProfilesCount || 0}</td>
              <td>
                {item.indicatorType === 'risk'
                  ? `פער ${item.levelGap}`
                  : 'פרופילים קבוצתיים'}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Box>
  )
}

export default function LeagueIndicatorsPanel({
  league,
  opportunities = [],
  profileRows = [],
  scoutProfilesCount = 0,
  embedded = false,
}) {
  const riskRows = opportunities.map(item => ({
    ...item,
    indicatorType: 'risk',
  }))
  const riskKeys = new Set(riskRows.map(getIndicatorTeamKey).filter(Boolean))
  const profileOnlyRows = profileRows
    .filter(item => !riskKeys.has(getIndicatorTeamKey(item)))
    .map(item => ({
      ...item,
      indicatorType: 'profiles',
    }))
  const indicatorRows = [...riskRows, ...profileOnlyRows]
  const rows = indicatorRows.slice(0, 8)
  const maxLevelGap = opportunities.reduce(
    (max, item) => Math.max(max, Number(item.levelGap) || 0),
    0
  )
  const opportunityProfilesCount = opportunities.reduce(
    (sum, item) => sum + (Number(item.scoutProfilesCount) || 0),
    0
  )
  const displayProfilesCount = Math.max(
    Number(scoutProfilesCount) || 0,
    opportunityProfilesCount,
    profileRows.reduce(
      (sum, item) => sum + (Number(item.scoutProfilesCount) || 0),
      0
    )
  )
  const riskClubCount = new Set(
    opportunities.map(item => item.clubId || item.clubName).filter(Boolean)
  ).size
  const hiddenCount = Math.max(indicatorRows.length - rows.length, 0)
  const printContext = getPrintLeagueContext(league)
  const defaultPrintFileName = buildDefaultPrintFileName(printContext)

  return (
    <Box sx={embedded ? sx.embeddedPanel : sx.panel}>
      <Box sx={sx.header}>
        <Typography
          level="title-md"
          sx={sx.title}
        >
          אינדיקציות ליגה
        </Typography>

        <Chip
          size="sm"
          variant="soft"
          color={opportunities.length ? 'warning' : 'neutral'}
        >
          {opportunities.length} בסיכון
        </Chip>
      </Box>

      <Box sx={sx.summary}>
        <Box sx={sx.summaryChips}>
          <Chip
            size="sm"
            variant="soft"
            color={riskClubCount ? 'warning' : 'neutral'}
          >
            {riskClubCount} מועדונים בסיכון
          </Chip>

          <Chip
            size="sm"
            variant="soft"
            color={maxLevelGap > 1 ? 'danger' : 'neutral'}
          >
            פער מקסימלי {maxLevelGap}
          </Chip>

          <Chip size="sm" variant="soft" color="neutral">
            {displayProfilesCount} פרופילים
          </Chip>
        </Box>

        <ReportPrintButton
          iconOnly
          size="sm"
          variant="soft"
          color="neutral"
          startIcon="print"
          tooltip="הדפס אינדיקציות ליגה"
          documentTitle={defaultPrintFileName}
          disabled={!indicatorRows.length}
          sx={sx.printButton}
          renderContent={() => (
            <LeagueIndicatorsPrintReport
              league={league}
              rows={indicatorRows}
              riskClubCount={riskClubCount}
              maxLevelGap={maxLevelGap}
              displayProfilesCount={displayProfilesCount}
            />
          )}
        />
      </Box>

      {rows.length ? (
        <>
          <Box sx={sx.tableWrap}>
            <Table
              size="sm"
              borderAxis="xBetween"
              stickyHeader={false}
              sx={sx.table}
            >
              <IndicatorColumns />
              <thead>
                <tr>
                  <th>#</th>
                  <th>מועדון</th>
                  <th>נוכחי</th>
                  <th>מעל</th>
                  <th>פרופילים</th>
                  <th>אינדיקציה</th>
                </tr>
              </thead>
            </Table>

            <Box sx={sx.tableBodyScroll}>
              <Table
                size="sm"
                borderAxis="xBetween"
                stickyHeader={false}
                sx={sx.table}
              >
                <IndicatorColumns />
                <tbody>
                  {rows.map((item, index) => (
                    <tr
                      key={item.id || `${item.clubId}-${index}`}
                      className={item.levelGap > 1 ? 'isSevere' : ''}
                    >
                      <td>{index + 1}</td>
                      <td>{item.clubName || '-'}</td>
                      <td>{formatTeamLabel(item.currentTeam)}</td>
                      <td>{item.upperTeam ? formatTeamLabel(item.upperTeam) : '-'}</td>
                      <td>
                        <Chip size="sm" variant="soft" color="neutral">
                          {item.scoutProfilesCount || 0}
                        </Chip>
                      </td>
                      <td>
                        {item.indicatorType === 'risk' ? (
                          <Chip
                            size="sm"
                            variant="soft"
                            color={item.levelGap > 1 ? 'danger' : 'warning'}
                          >
                            פער {item.levelGap}
                          </Chip>
                        ) : (
                          <Chip size="sm" variant="soft" color="neutral">
                            פרופילים קבוצתיים
                          </Chip>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Box>
          </Box>

          {hiddenCount > 0 ? (
            <Typography
              level="body-xs"
              sx={sx.countNote}
            >
              מציג {rows.length} מתוך {indicatorRows.length}
            </Typography>
          ) : null}
        </>
      ) : (
        <Box sx={sx.emptyState}>
          <Typography level="body-sm" sx={sx.emptyText}>
            אין אינדיקציות סיכון לליגה הנבחרת.
          </Typography>
        </Box>
      )}
    </Box>
  )
}
