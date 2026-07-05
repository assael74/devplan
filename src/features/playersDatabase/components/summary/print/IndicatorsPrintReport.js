/// features/playersDatabase/components/summary/print/IndicatorsPrintReport.js

import React from 'react'
import {
  Box,
  Table,
  Typography,
} from '@mui/joy'

import {
  formatSummaryIndicatorTeamLabel,
  getSummaryIndicatorsPrintContext,
} from '../logic/index.js'
import { summaryPrintSx as sx } from './print.sx.js'

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

function IndicatorPrintRow({ item, index }) {
  return (
    <tr>
      <td>{index + 1}</td>

      <td>
        {item.clubName || '-'}
      </td>

      <td>
        {formatSummaryIndicatorTeamLabel(item.currentTeam)}
      </td>

      <td>
        {item.upperTeam ? formatSummaryIndicatorTeamLabel(item.upperTeam) : '-'}
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
  )
}

export default function IndicatorsPrintReport({
  league,
  rows,
  riskClubCount,
  maxLevelGap,
  displayProfilesCount,
}) {
  const context = getSummaryIndicatorsPrintContext(league)

  return (
    <Box className="dpPrintSection" sx={sx.section}>
      <Box>
        <Typography level="h2" sx={sx.title}>
          אינדיקציות ליגה
        </Typography>

        <Typography level="body-sm" sx={sx.summary}>
          מועדונים בסיכון: {riskClubCount}
          {' | '}
          פער מקסימלי: {maxLevelGap}
          {' | '}
          פרופילים: {displayProfilesCount}
        </Typography>
      </Box>

      <Box className="dpPrintCard" sx={sx.contextCard}>
        {[
          ['שנתון', context.birthYear],
          ['ליגה מצולמת', `${context.leagueName} | ${context.leagueLevel}`],
          ['אזור', context.region],
          ['קבוצת גיל', context.ageGroup],
        ].map(([label, value]) => (
          <Box key={label}>
            <Typography level="body-xs" sx={sx.contextLabel}>
              {label}
            </Typography>

            <Typography level="title-md" sx={sx.contextValue}>
              {value || '-'}
            </Typography>
          </Box>
        ))}
      </Box>

      <Table
        size="sm"
        borderAxis="bothBetween"
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

        <tbody>
          {rows.map((item, index) => (
            <IndicatorPrintRow
              key={item.id || `${item.clubId}-${index}`}
              item={item}
              index={index}
            />
          ))}
        </tbody>
      </Table>
    </Box>
  )
}
