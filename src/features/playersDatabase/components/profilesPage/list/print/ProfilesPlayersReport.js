// features/playersDatabase/components/profilesPage/list/print/ProfilesPlayersReport.js

import React from 'react'
import { Box } from '@mui/joy'

import { ReportShell } from '../../../../../../ui/patterns/reports/index.js'
import { getPlayerPositionInfo } from '../logic/player.logic.js'
import { clean, valueOrDash } from '../../logic/utils.js'
import { printSx as sx } from './print.sx.js'

const resolveValue = (value, fallback) =>
  value !== undefined && value !== null ? value : fallback

export default function ProfilesPlayersReport({ row, resultRows = [] }) {
  return (
    <Box className="dpPrintSection" sx={sx.section}>
      <ReportShell
        title="שחקנים חיצוניים מומלצים"
        reportDate={new Date().toLocaleDateString('en-CA')}
        reportType="player-profiles"
        status="active"
        entity={{
          name: row?.title || '-',
          subtitle: row?.subtitle || '',
        }}
        metaItems={[
          { label: 'פרופיל', value: row?.title || '-' },
          { label: 'שחקנים בדוח', value: resultRows.length || 0 },
          { label: 'ליגות', value: row?.leaguesCount || 0 },
        ]}
      >
        <Box component="table" sx={sx.table}>
          <thead>
            <tr>
              <th></th>
              <th>שחקן</th>
              <th>ליגה</th>
              <th>מועדון</th>
              <th>שנתון</th>
              <th>חוליה</th>
              <th>עמדה</th>
              <th>דק׳</th>
              <th>שערים</th>
              <th>פתח</th>
            </tr>
          </thead>

          <tbody>
            {resultRows.map((player, index) => {
              const current = player.current || {}
              const games = resolveValue(current.games, player.games)
              const starts = resolveValue(current.starts, player.starts)
              const minutes = resolveValue(current.minutes, player.minutes)
              const goals = resolveValue(current.goals, player.goals)
              const position = getPlayerPositionInfo(player)

              return (
                <tr key={player.searchDocId || player.id}>
                  <td>{index + 1}</td>
                  <td>{valueOrDash(player.fullName || player.playerName || player.name)}</td>
                  <td>{valueOrDash(player.leagueName)}</td>
                  <td>{valueOrDash(player.clubName || player.teamName)}</td>
                  <td>{valueOrDash(player.birthYear || player.teamBirthYear)}</td>
                  <td>{clean(position.layerLabel) === '-' ? '' : position.layerLabel}</td>
                  <td>{clean(position.primaryPosition)}</td>
                  <td>{valueOrDash(minutes)}</td>
                  <td>{valueOrDash(goals)}</td>
                  <td>{`${valueOrDash(starts)}/${valueOrDash(games)}`}</td>
                </tr>
              )
            })}
          </tbody>
        </Box>

        <Box sx={sx.reportBoxes}>
          <Box sx={sx.reportEmptyBox} />
          <Box sx={sx.reportEmptyBox} />
          <Box sx={sx.reportEmptyBox} />
        </Box>
      </ReportShell>
    </Box>
  )
}
