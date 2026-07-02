// src/features/playersDatabase/components/leagues/board/LeagueIndicatorsPanel.js

import React from 'react'
import {
  Box,
  Button,
  Chip,
  Table,
  Typography,
} from '@mui/joy'

import { ReportPrintButton } from '../../../../../ui/patterns/reportPrint/index.js'
import {
  buildLeagueIndicatorsData,
  buildLeagueIndicatorsPrintFileName,
  formatIndicatorTeamLabel,
  getLeagueIndicatorsPrintContext,
} from './logic/leagueIndicators.logic.js'
import { indicatorSx as sx } from './sx/indicators.sx.js'
import LeagueIndicatorsPrintReportView from './print/LeagueIndicatorsPrintReport.js'
import { boardPrintSx as printSx } from './print/sx/print.sx.js'

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

function LeagueIndicatorsPrintReport({
  league,
  rows,
  riskClubCount,
  maxLevelGap,
  displayProfilesCount,
}) {
  const context = getLeagueIndicatorsPrintContext(league)

  return (
    <Box className="dpPrintSection" sx={sx.printSection}>
      <Box>
        <Typography level="h2" sx={sx.printTitle}>
          אינדיקציות ליגה
        </Typography>

        <Typography level="body-sm" sx={sx.printSummary}>
          מועדונים בסיכון: {riskClubCount}
          {' | '}
          פער מקסימלי: {maxLevelGap}
          {' | '}
          פרופילים: {displayProfilesCount}
        </Typography>
      </Box>

      <Box className="dpPrintCard" sx={sx.printContextCard}>
        {[
          [ 'שנתון', context.birthYear ],
          [ 'ליגה מצולמת', `${context.leagueName} | ${context.leagueLevel}` ],
          [ 'אזור', context.region ],
          [ 'קבוצת גיל', context.ageGroup ],
        ].map(([label, value]) => (
          <Box key={label}>
            <Typography level="body-xs" sx={sx.printContextLabel}>
              {label}
            </Typography>

            <Typography level="title-md" sx={sx.printContextValue}>
              {value || '-'}
            </Typography>
          </Box>
        ))}
      </Box>

      <Table
        size="sm"
        borderAxis="bothBetween"
        sx={sx.printTable}
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

              <td>
                {item.clubName || '-'}
              </td>

              <td>
                {formatIndicatorTeamLabel(item.currentTeam)}
              </td>

              <td>
                {item.upperTeam ? formatIndicatorTeamLabel(item.upperTeam) : '-'}
              </td>

              <td>
                {item.scoutProfilesCount || 0}
              </td>

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

function IndicatorsHeader({ opportunitiesCount }) {
  return (
    <Box sx={sx.header}>
      <Typography level="title-md" sx={sx.title}>
        אינדיקציות ליגה
      </Typography>

      <Chip
        size="sm"
        variant="soft"
        color={opportunitiesCount ? 'warning' : 'neutral'}
      >
        {opportunitiesCount} בסיכון
      </Chip>
    </Box>
  )
}

function IndicatorsSummary({
  league,
  indicatorRows,
  riskClubCount,
  maxLevelGap,
  displayProfilesCount,
}) {
  const printContext = getLeagueIndicatorsPrintContext(league)

  const defaultPrintFileName = buildLeagueIndicatorsPrintFileName(printContext)

  return (
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

        <Chip
          size="sm"
          variant="soft"
          color="neutral"
        >
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
        sx={printSx.button}
        renderContent={() => (
          <LeagueIndicatorsPrintReportView
            league={league}
            rows={indicatorRows}
            riskClubCount={riskClubCount}
            maxLevelGap={maxLevelGap}
            displayProfilesCount={displayProfilesCount}
          />
        )}
      />
    </Box>
  )
}

function IndicatorTypeChip({ item }) {
  if (item.indicatorType === 'risk') {
    return (
      <Chip
        size="sm"
        variant="soft"
        color={item.levelGap > 1 ? 'danger' : 'warning'}
      >
        פער {item.levelGap}
      </Chip>
    )
  }

  return (
    <Chip
      size="sm"
      variant="soft"
      color="neutral"
    >
      פרופילים קבוצתיים
    </Chip>
  )
}

function UpperTeamCell({ item, onOpenLeague }) {
  const leagueId = item.upperTeam?.leagueId
  const label = item.upperTeam
    ? formatIndicatorTeamLabel(item.upperTeam)
    : '-'

  if (!leagueId || !onOpenLeague) return label

  return (
    <Button
      size="sm"
      variant="plain"
      color="primary"
      sx={sx.leagueLink}
      onClick={event => {
        event.stopPropagation()
        onOpenLeague(leagueId)
      }}
    >
      {label}
    </Button>
  )
}

function IndicatorsTable({ rows, onOpenLeague }) {
  return (
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

      <Box className="dpScrollThin" sx={sx.tableBodyScroll}>
        <Table
          size="sm"
          borderAxis="xBetween"
          stickyHeader={false}
          sx={sx.table}
        >
          <IndicatorColumns />

          <tbody>
            {rows.map((item, index) => (
              <tr key={item.id || `${item.clubId}-${index}`} className={item.levelGap > 1 ? 'isSevere' : ''}>
                <td>{index + 1}</td>

                <td>
                  {item.clubName || '-'}
                </td>

                <td>
                  {formatIndicatorTeamLabel(item.currentTeam)}
                </td>

                <td>
                  <UpperTeamCell item={item} onOpenLeague={onOpenLeague} />
                </td>

                <td>
                  <Chip size="sm" variant="soft" color="neutral">
                    {item.scoutProfilesCount || 0}
                  </Chip>
                </td>

                <td>
                  <IndicatorTypeChip item={item} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Box>
    </Box>
  )
}

export default function LeagueIndicatorsPanel({
  league,
  opportunities = [],
  profileRows = [],
  scoutProfilesCount = 0,
  embedded = false,
  onOpenLeague,
}) {
  const {
    indicatorRows,
    rows,
    maxLevelGap,
    displayProfilesCount,
    riskClubCount,
    hiddenCount,
  } = buildLeagueIndicatorsData({opportunities, profileRows, scoutProfilesCount })

  const panelSx = embedded ? sx.embeddedPanel : sx.panel

  return (
    <Box sx={panelSx}>
      <IndicatorsHeader opportunitiesCount={opportunities.length} />

      <IndicatorsSummary
        league={league}
        indicatorRows={indicatorRows}
        riskClubCount={riskClubCount}
        maxLevelGap={maxLevelGap}
        displayProfilesCount={displayProfilesCount}
      />

      {rows.length ? (
        <>
          <IndicatorsTable rows={rows} onOpenLeague={onOpenLeague} />

          {hiddenCount > 0 ? (
            <Typography level="body-xs" sx={sx.countNote}>
              מציג {rows.length} מתוך{' '}
              {indicatorRows.length}
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
