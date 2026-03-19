// teamProfile/modules/games/components/entryDrawer/EntryEditContentDrawer.js

import React from 'react'
import { Avatar, Box, Button, Chip, DialogContent, Sheet, Typography, Divider, IconButton } from '@mui/joy'

import OnSquadSelector from '../../../../../../../ui/fields/checkUi/games/OnSquadSelector.js'
import OnSquadStart from '../../../../../../../ui/fields/checkUi/games/OnSquadStart.js'
import GoalField from '../../../../../../../ui/fields/inputUi/games/GoalField.js'
import AssistField from '../../../../../../../ui/fields/inputUi/games/AssistField.js'
import TimePlayedField from '../../../../../../../ui/fields/inputUi/games/TimePlayedField.js'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi'

import { entryEditDrawerSx as sx } from './sx/entryEditDrawer.sx.js'

import {
  getGameDurationLimit,
  getRemainingAssistsForRow,
  getRemainingGoalsForRow,
  getTeamGoalsLimit,
  getGoalsTotal,
  getAssistsTotal
} from './logic/teamGamEentryEdit.logic.js'

function EntryBulkBar({
  isPlayed,
  draft,
  onBulkSetOnSquad,
  onBulkResetStats,
}) {
  const onSquadTotal = (draft?.rows || []).filter(r => r?.onSquad === true).length

  const onStartTotal = (draft?.rows || []).filter(r => r?.onStart === true).length
  const colorStartChip = onStartTotal === 11 ? 'danger' : 'neutral'

  const goalsTotal = getGoalsTotal(draft?.rows || [])
  const assistsTotal = getAssistsTotal(draft?.rows || [])
  const colorGoalsChip = goalsTotal === draft?.raw?.goalsFor ? 'danger' : 'neutral'
  const colorAssitsChip = assistsTotal === draft?.raw?.goalsFor ? 'danger' : 'neutral'

  return (
    <Box sx={sx.bulkBar}>
      <Box sx={sx.bulkBarTop}>
        <Typography level="title-sm" startDecorator={iconUi({id: 'entry'})}>רישום כולל</Typography>

        <Box sx={sx.bulkBarActions}>
          <Chip size="md" variant="solid" startDecorator={iconUi({id: 'isSquad'})}>
            נבחרו לסגל: <Typography level='title-sm' sx={{ display: 'inline', ml: 1, color: '#ffffff' }}>{onSquadTotal}</Typography>
          </Chip>

          <Chip size="md" variant="solid" color={colorStartChip} startDecorator={iconUi({id: 'isStart'})}>
            נבחרו להרכב: <Typography level='title-sm' sx={{ display: 'inline', ml: 1, color: '#ffffff' }}>{onStartTotal}</Typography>
          </Chip>

          <Chip size="sm" variant="solid" color={colorGoalsChip} startDecorator={iconUi({id: 'goals'})}>
            שערים:
            <Typography level='title-sm' sx={{ display: 'inline', ml: 1, color: '#ffffff' }}>
              {goalsTotal} / {draft?.raw?.goalsFor || 0}
            </Typography>
          </Chip>

          <Chip size="sm" variant="solid" color={colorAssitsChip} startDecorator={iconUi({id: 'assists'})}>
            בישולים:
            <Typography level='title-sm' sx={{ display: 'inline', ml: 1, color: '#ffffff' }}>
            {assistsTotal} / {draft?.raw?.goalsFor || 0}
            </Typography>
          </Chip>

          <IconButton
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={() => onBulkSetOnSquad(false)}
          >
            {iconUi({id: 'reset'})}
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography level="body-xs" color="neutral">
          סגל: סמן אם השחקן היה בסגל. הרכב: זמין רק אם השחקן היה בסגל.
        </Typography>

        {!draft?.isPlayed && (
          <Typography level="body-xs" color="warning">
            המשחק עדיין לא שוחק ולכן שערים, בישולים וזמן משחק נעולים.
          </Typography>
        )}
      </Box>
    </Box>
  )
}

function PlayerEntryRow({ row, isPlayed, onChangeRow, draft }) {
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
          <Avatar src={row?.avatar || ''} sx={sx.playerAvatar}>
            {row?.playerName?.[0] || 'ש'}
          </Avatar>

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

export default function EntryEditContentDrawer({
  draft,
  onChangeRow,
  onBulkSetOnSquad,
  onBulkResetStats,
}) {
  return (
    <DialogContent sx={sx.dialogContent}>
      <EntryBulkBar
        draft={draft}
        isPlayed={draft?.isPlayed === true}
        onBulkSetOnSquad={onBulkSetOnSquad}
        onBulkResetStats={onBulkResetStats}
      />

      <Box sx={sx.content} className="dpScrollThin">
        {(draft?.rows || []).map((row) => (
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
