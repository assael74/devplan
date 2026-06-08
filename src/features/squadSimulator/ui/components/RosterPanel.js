// features/squadSimulator/ui/components/RosterPanel.js

import { Box, Chip, Sheet, Typography } from '@mui/joy'

import { formatNumber, getStatusColor } from '../simulatorUi.utils.js'
import { squadSimulatorSx as sx } from './sx/squadSimulator.sx.js'
import { rosterSx } from './sx/roster.sx.js'
import Metric from './Metric.js'
import PlayerHeaderRow from './PlayerHeaderRow.js'
import PlayerRow from './PlayerRow.js'

export default function RosterPanel({
  rows,
  playerBank = [],
  goalsKpi,
  confidenceKpi,
  minutesKpi,
  bankKpi,
  positionDistribution = [],
  positionOptions = [],
  onPlayerChange,
  onRemovePlayer,
}) {
  const selectedPlayerIds = rows
    .map(row => row.selectedPlayerId)
    .filter(Boolean)

  return (
    <Sheet sx={{ ...sx.panel, ...rosterSx.rosterPanel }}>
      <Box sx={rosterSx.summaryGrid}>
        <Metric
          label="פוטנציאל שערים"
          value={`${formatNumber(goalsKpi?.target)} / ${formatNumber(goalsKpi?.allocated)}`}
          color={getStatusColor(goalsKpi?.status)}
          sub={`מובטח ${formatNumber(goalsKpi?.guaranteed)} | ${goalsKpi?.guaranteedCoveragePct || 0}%`}
        />
        <Metric
          label="ביטחון סגל"
          value={`${formatNumber(confidenceKpi?.scorePct)}%`}
          color={confidenceKpi?.status || 'neutral'}
          sub={`דורגו ${formatNumber(confidenceKpi?.targetRows)} / ${formatNumber(confidenceKpi?.ratedRows)} | סיכון ${formatNumber(confidenceKpi?.riskGoalsGap)}`}
        />
        <Metric
          label="חלוקת דקות"
          value={`${formatNumber(minutesKpi?.target)} / ${formatNumber(minutesKpi?.allocated)}`}
          color={getStatusColor(minutesKpi?.status)}
          sub={`${minutesKpi?.coveragePct || 0}% כיסוי`}
        />
        <Metric
          label="רישום שחקנים"
          value={`${formatNumber(bankKpi?.namedPlayers)} / ${formatNumber(bankKpi?.selectedRows)}`}
          color="primary"
          sub={`ייחודיים בסגל ${formatNumber(bankKpi?.uniqueSelectedPlayers)}`}
        />
        <Metric label="פריסת עמדות" value="" color="neutral">
          <Box sx={rosterSx.positionKpiChips}>
            {positionDistribution.map(item => (
              <Chip
                key={item.id}
                size="sm"
                variant="soft"
                color={item.status}
                sx={rosterSx.positionKpiChip}
              >
                <Typography level="title-sm" sx={{ fontSize: 13 }}>
                  {item.id}{' '}
                  <Typography level="body-sm" sx={{ fontSize: 11, mr: 0.3 }}>
                    {item.actualCount}/{item.targetCount}
                  </Typography>
                </Typography>
              </Chip>
            ))}
          </Box>
        </Metric>
      </Box>

      <Box sx={rosterSx.playerRows} className="dpScrollThin">
        <PlayerHeaderRow />
        {rows.map(row => (
          <PlayerRow
            key={row.id}
            row={row}
            playerBank={playerBank}
            selectedPlayerIds={selectedPlayerIds}
            positionOptions={positionOptions}
            onChange={onPlayerChange}
            onRemove={onRemovePlayer}
          />
        ))}
      </Box>
    </Sheet>
  )
}
