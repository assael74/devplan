import React from 'react'
import { Box } from '@mui/joy'

import { getPlayerGeneralPosition } from '../../../../../shared/players/player.positions.utils.js'
import { LAYER_TITLES } from '../../../../../shared/players/players.constants.js'
import { ReportShell } from '../../../../../ui/patterns/reports/index.js'
import { scanPrintSx as sx } from './sx/print.sx.js'

const clean = value => String(value ?? '').trim()

const valueOrDash = value => {
  const text = clean(value)
  return text || '-'
}

const getPlayerPositionInfo = player => {
  const primaryPosition = clean(player.primaryPosition)
  const positions = Array.isArray(player.positions)
    ? player.positions.filter(Boolean)
    : clean(player.positions)
      ? [clean(player.positions)]
      : []
  const documentLayer = clean(player.positionLayer)

  if (documentLayer) {
    return {
      primaryPosition,
      positions,
      layerLabel: LAYER_TITLES[documentLayer] || documentLayer,
    }
  }

  const inferred = getPlayerGeneralPosition({
    primaryPosition,
    positions,
  })

  return {
    primaryPosition,
    positions,
    layerLabel: inferred.layerLabel || '-',
  }
}

export default function ScanPlayersReport({ row, resultRows = [] }) {
  return (
    <Box className="dpPrintSection" sx={sx.section}>
      <ReportShell
        title="שחקנים חיצוניים מומלצים"
        reportDate={new Date().toLocaleDateString('en-CA')}
        reportType="player-scan"
        status="active"
        entity={{
          name: row?.title || '-',
          subtitle: row?.subtitle || '',
        }}
        metaItems={[
          { label: 'פרופיל סריקה', value: row?.title || '-' },
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
              const games = current.games ?? player.games
              const starts = current.starts ?? player.starts
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
                  <td>{valueOrDash(current.minutes ?? player.minutes)}</td>
                  <td>{valueOrDash(current.goals ?? player.goals)}</td>
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
