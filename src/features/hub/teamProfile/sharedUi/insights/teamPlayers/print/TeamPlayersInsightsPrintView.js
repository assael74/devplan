// teamProfile/sharedUi/insights/teamPlayers/print/TeamPlayersInsightsPrintView.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import {
  buildTeamPlayersInsightsPrintModel,
} from '../../../../sharedLogic/players/insightsLogic/print/index.js'

import { teamPlayersPrintSx as sx } from './teamPlayersPrint.sx.js'

const SummaryCard = ({
  item,
}) => {
  return (
    <Box sx={sx.summaryCard} className="dpPrintCard">
      <Typography sx={sx.summaryLabel}>
        {item.label}
      </Typography>

      <Typography sx={sx.summaryValue}>
        {item.value}
      </Typography>
    </Box>
  )
}

const ProfileCard = ({
  item,
}) => {
  return (
    <Box sx={sx.profileCard} className="dpPrintCard">
      <Typography sx={sx.profileCardLabel}>
        {item.shortLabel}
      </Typography>

      <Typography sx={sx.profileCardValue}>
        {item.value}
      </Typography>
    </Box>
  )
}

const ProfileLegendItem = ({
  item,
}) => {
  return (
    <Box sx={sx.legendItem} className="dpPrintRow">
      <Typography sx={sx.legendTitle}>
        {item.label}
      </Typography>

      <Typography sx={sx.legendText}>
        {item.coachText || item.description || '-'}
      </Typography>
    </Box>
  )
}

const TableCell = ({
  children,
}) => {
  return (
    <td style={sx.td}>
      {children}
    </td>
  )
}

export default function TeamPlayersInsightsPrintView({
  team,
  rows,
  games,
  performanceScope,
}) {
  const model = buildTeamPlayersInsightsPrintModel({
    team,
    rows,
    games,
    performanceScope,
  })

  return (
    <Box sx={sx.root}>
      <Box sx={sx.header}>
        <Typography sx={sx.title}>
          {model.title}
        </Typography>

        <Typography sx={sx.subtitle}>
          {model.teamName}
        </Typography>
      </Box>

      <Box sx={sx.scopeBox} className="dpPrintSection">
        <Typography sx={sx.scopeTitle}>
          {model.scope.title}
        </Typography>

        <Typography sx={sx.scopeText}>
          {model.scope.description}
        </Typography>

        <Typography sx={sx.scopeText}>
          הפרופיל והמדדים בטבלה מחושבים לפי טווח המשחקים שנבחר.
        </Typography>
      </Box>

      <Box sx={sx.summaryGrid} className="dpPrintSection">
        {model.summary.map((item) => {
          return (
            <SummaryCard
              key={item.id || item.label}
              item={item}
            />
          )
        })}
      </Box>

      <Box sx={sx.profileCardsGrid} className="dpPrintSection">
        {model.profileCards.map((item) => {
          return (
            <ProfileCard
              key={item.id}
              item={item}
            />
          )
        })}
      </Box>

      <Box sx={sx.tableWrap} className="dpPrintSection">
        <table style={sx.table} dir="rtl">
          <thead>
            <tr>
              <th style={{ ...sx.th, width: '4%' }}>#</th>
              <th style={{ ...sx.th, width: '16%' }}>שחקן</th>
              <th style={{ ...sx.th, width: '11%' }}>מעמד בסגל</th>
              <th style={{ ...sx.th, width: '9%' }}>עמדה</th>
              <th style={{ ...sx.th, width: '12%' }}>כושר בטווח</th>
              <th style={{ ...sx.th, width: '9%' }}>מדד יעילות</th>
              <th style={{ ...sx.th, width: '9%' }}>מדד השפעה</th>
              <th style={{ ...sx.th, width: '6%' }}>מש׳</th>
              <th style={{ ...sx.th, width: '7%' }}>דק׳</th>
              <th style={{ ...sx.th, width: '5%' }}>ש׳</th>
              <th style={{ ...sx.th, width: '5%' }}>ב׳</th>
              <th style={{ ...sx.th, width: '7%' }}>הערה</th>
            </tr>
          </thead>

          <tbody>
            {model.rows.map((row) => {
              return (
                <tr key={row.id} className="dpPrintRow">
                  <TableCell>{row.index}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.role}</TableCell>
                  <TableCell>{row.position}</TableCell>
                  <TableCell>{row.scopedProfile}</TableCell>
                  <TableCell>{row.rating}</TableCell>
                  <td style={sx.tdImpact(row.tvaTone)}>{row.tva}</td>
                  <TableCell>{row.games}</TableCell>
                  <TableCell>{row.minutes}</TableCell>
                  <TableCell>{row.goals}</TableCell>
                  <TableCell>{row.assists}</TableCell>
                  <td style={sx.tdNote}>
                    {row.subStatus}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Box>

      <Box sx={sx.legendSection} className="dpPrintSection">
        <Typography sx={sx.legendSectionTitle}>
          הסבר פרופילים
        </Typography>

        <Box sx={sx.legendGrid}>
          {model.profileLegend.map((item) => {
            return (
              <ProfileLegendItem
                key={item.id}
                item={item}
              />
            )
          })}
        </Box>
      </Box>

      <Box sx={sx.footer}>
        הופק מתוך DevPlan · דוח שחקנים לפי טווח משחקים
      </Box>
    </Box>
  )
}
