// teamProfile/modules/games/components/entryDrawer/EntryEditContentDrawer.js

import React from 'react'
import {
  Avatar,
  Box,
  Chip,
  DialogContent,
  Sheet,
  Typography,
  Divider,
} from '@mui/joy'

import OnSquadSelector from '../../../../../../../../ui/fields/checkUi/games/OnSquadSelector.js'
import OnSquadStart from '../../../../../../../../ui/fields/checkUi/games/OnSquadStart.js'
import GoalField from '../../../../../../../../ui/fields/inputUi/games/GoalField.js'
import AssistField from '../../../../../../../../ui/fields/inputUi/games/AssistField.js'
import TimePlayedField from '../../../../../../../../ui/fields/inputUi/games/TimePlayedField.js'

import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'

import EntryBulkBar from './EntryBulkBar'

import { entryEditDrawerSx as sx } from './sx/entryEditDrawer.sx.js'

import {
  getGameDurationLimit,
  getRemainingAssistsForRow,
  getRemainingGoalsForRow,
  getTeamGoalsLimit,
} from '../../../../../../editLogic/games/entryGames/index.js'

function getRowIsActive(row) {
  return row?.active !== false
}

function PlayerEntryRow({ row, isPlayed, onChangeRow, draft }) {
  const isActive = getRowIsActive(row)
  const statsDisabled = !row?.onSquad || !isPlayed

  const onStartTotal = (draft?.rows || []).filter((r) => r?.onStart === true).length
  const disableStartSelection = row?.onStart !== true && onStartTotal >= 11

  const teamGoalsLimit = getTeamGoalsLimit(draft)
  const goalsMax = getRemainingGoalsForRow(draft?.rows || [], row?.playerId, teamGoalsLimit)
  const assistsMax = getRemainingAssistsForRow(draft?.rows || [], row?.playerId, teamGoalsLimit)
  const timePlayedMax = getGameDurationLimit(draft)

  return (
    <Sheet variant="soft" sx={sx.rowCard}>
      <Box sx={sx.rowGrid}>
        <Box sx={sx.playerCell}>
          <Avatar src={row?.avatar || playerImage} sx={sx.playerAvatar} />

          <Box sx={sx.playerMeta}>
            <Typography level="title-sm" noWrap>
              {row?.playerName}
            </Typography>

            <Box sx={sx.playerSubMeta}>
              {!!row?.playerNumber && (
                <Chip size="sm" variant="soft" color="neutral">
                  #{row.playerNumber}
                </Chip>
              )}

              {!!row?.position && (
                <Chip size="sm" variant="soft" color="primary">
                  {row.position}
                </Chip>
              )}

              {!isActive && (
                <Chip size="sm" variant="soft" color="warning">
                  לא פעיל
                </Chip>
              )}
            </Box>
          </Box>
        </Box>

        <Box sx={sx.cellCenter}>
          <OnSquadSelector
            size="md"
            value={row?.onSquad === true}
            onChange={(value) => onChangeRow(row.playerId, 'onSquad', value === true)}
          />
        </Box>

        <Box sx={sx.cellCenter}>
          <OnSquadStart
            size="md"
            value={row?.onStart === true}
            disabled={!row?.onSquad || disableStartSelection}
            onChange={(value) => onChangeRow(row.playerId, 'onStart', value === true)}
          />
        </Box>

        <Divider orientation="vertical" sx={sx.dividerSx} />

        <GoalField
          value={row?.goals}
          max={goalsMax}
          disabled={statsDisabled}
          onChange={(value) => onChangeRow(row.playerId, 'goals', value)}
        />

        <AssistField
          value={row?.assists}
          max={assistsMax}
          disabled={statsDisabled}
          onChange={(value) => onChangeRow(row.playerId, 'assists', value)}
        />

        <TimePlayedField
          value={row?.timePlayed}
          max={timePlayedMax}
          disabled={statsDisabled}
          onChange={(value) => onChangeRow(row.playerId, 'timePlayed', value)}
        />
      </Box>
    </Sheet>
  )
}

function applyEntryFilters(rows = [], filters = {}) {
  return rows.filter((row) => {
    const isActive = getRowIsActive(row)

    const squadOk =
      filters?.squad === 'all' ||
      (filters?.squad === 'in' && row?.onSquad === true) ||
      (filters?.squad === 'out' && row?.onSquad !== true)

    const startOk =
      filters?.start === 'all' ||
      (filters?.start === 'in' && row?.onStart === true) ||
      (filters?.start === 'out' && row?.onStart !== true)

    const activeOk =
      filters?.activeOnly !== true ||
      isActive

    return squadOk && startOk && activeOk
  })
}

export default function EntryEditContentDrawer({
  draft,
  filters,
  onSetFilter,
  onResetFilters,
  onChangeRow,
  onBulkSetOnSquad,
  onBulkResetStats,
}) {
  const filteredRows = applyEntryFilters(draft?.rows || [], filters)

  return (
    <DialogContent sx={sx.dialogContent}>
      <EntryBulkBar
        draft={draft}
        filters={filters}
        onSetFilter={onSetFilter}
        onResetFilters={onResetFilters}
        isPlayed={draft?.isPlayed === true}
        onBulkSetOnSquad={onBulkSetOnSquad}
        onBulkResetStats={onBulkResetStats}
      />

      <Box sx={sx.content} className="dpScrollThin">
        {filteredRows.map((row) => (
          <PlayerEntryRow
            key={row.playerId}
            row={row}
            draft={draft}
            isPlayed={draft?.isPlayed === true}
            onChangeRow={onChangeRow}
          />
        ))}
      </Box>
    </DialogContent>
  )
}
