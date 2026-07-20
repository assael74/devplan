// features/playersDatabase/components/profilesPage/list/print/ProfilesPlayersReport.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import { ReportShell } from '../../../../../../ui/patterns/reports/index.js'
import { clean, valueOrDash } from '../../logic/utils.js'
import { getPlayerPositionInfo } from '../logic/player.logic.js'
import { printSx as sx, printTableColumns } from './print.sx.js'

const resolveValue = (value, fallback) =>
  value !== undefined && value !== null ? value : fallback

const getNotes = player =>
  clean(
    player?.comments ||
    player?.comment ||
    player?.notes ||
    player?.searchDoc?.comments ||
    player?.statsDoc?.comments ||
    player?.playerSeason?.comments
  )

const getRowBg = index => (index % 2 === 0 ? sx.rowEven : sx.rowOdd)

function PrintNameCell({ player }) {
  const playerName = player?.fullName || player?.playerName || player?.name || '-'

  return (
    <Box sx={sx.nameCell}>
      <Box sx={sx.nameText}>
        <Typography level="body-sm" sx={sx.playerName}>
          {playerName}
        </Typography>
      </Box>
    </Box>
  )
}

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
          { label: 'ליגות', value: row?.leaguesCount || 0 },
        ]}
      >
        <Box component="table" sx={sx.table}>
          <colgroup>
            <col style={{ width: printTableColumns.index }} />
            <col style={{ width: printTableColumns.player }} />
            <col style={{ width: printTableColumns.team }} />
            <col style={{ width: printTableColumns.position }} />
            <col style={{ width: printTableColumns.minutes }} />
            <col style={{ width: printTableColumns.goals }} />
            <col style={{ width: printTableColumns.starts }} />
            <col style={{ width: printTableColumns.notes }} />
          </colgroup>
          <thead>
            <tr>
              <th>#</th>
              <th>שחקן</th>
              <th>קבוצה</th>
              <th>חוליה / עמדה</th>
              <th>דק'</th>
              <th>שערים</th>
              <th>פתח</th>
              <th>הערות</th>
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
              const notes = getNotes(player)

              return (
                <tr key={`${player.searchDocId || player.id || index}-${player.teamSeasonKey || ''}`}>
                  <Box component="td" sx={[sx.cellBase, sx.indexCell, getRowBg(index)]}>
                    {index + 1}
                  </Box>
                  <Box component="td" sx={[sx.cellBase, sx.playerCell, getRowBg(index)]}>
                    <PrintNameCell player={player} />
                  </Box>
                  <Box component="td" sx={[sx.cellBase, sx.teamCell, getRowBg(index)]}>{valueOrDash(player.clubName || player.teamName)}</Box>
                  <Box
                    component="td"
                    sx={[
                      sx.cellBase,
                      sx.positionCell,
                      position.missingDocumentLayer ? sx.positionCellMissing : null,
                      getRowBg(index),
                    ]}
                  >
                    <Box>
                      <Typography level="body-xs" sx={sx.positionLayer}>
                        {clean(position.layerLabel) === '-' ? '' : position.layerLabel}
                      </Typography>
                      <Typography level="body-sm" sx={sx.positionPrimary}>
                        {clean(position.primaryPosition)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box component="td" sx={[sx.cellBase, sx.minutesCell, getRowBg(index)]}>{valueOrDash(minutes)}</Box>
                  <Box component="td" sx={[sx.cellBase, sx.goalsCell, getRowBg(index)]}>
                    <Box sx={sx.goalsValue}>
                      {valueOrDash(goals)}
                    </Box>
                  </Box>
                  <Box component="td" sx={[sx.cellBase, sx.startsCell, getRowBg(index)]}>
                    {`${valueOrDash(starts)}/${valueOrDash(games)}`}
                  </Box>
                  <Box component="td" sx={[sx.cellBase, sx.notesCell, notes ? sx.notesCellHasNotes : null, getRowBg(index)]}>
                    {notes ? <Box sx={sx.notesText}>{notes}</Box> : null}
                  </Box>
                </tr>
              )
            })}
          </tbody>
        </Box>

        <Box sx={sx.reportBoxes}>
          <Box sx={sx.reportSummaryBox}>
            <Typography level="body-xs" sx={sx.reportSummaryLabel}>
              ליגות
            </Typography>
            <Typography level="title-lg" sx={sx.reportSummaryValue}>
              {row?.leaguesCount || 0}
            </Typography>
          </Box>

          <Box sx={sx.reportSummaryBox}>
            <Typography level="body-xs" sx={sx.reportSummaryLabel}>
              כמות קבוצות
            </Typography>
            <Typography level="title-lg" sx={sx.reportSummaryValue}>
              {row?.loadedTeamsCount || row?.teamsCount || 0}
            </Typography>
          </Box>
        </Box>
      </ReportShell>
    </Box>
  )
}
