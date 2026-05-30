// src/ui/forms/gameStatsForm/steps/EntryStep.js

import React from 'react'
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Sheet,
  Typography,
} from '@mui/joy'

import { entryStepSx as sx } from './sx/entryStep.sx.js'
import playerImage from '../../../core/images/playerImage.jpg'
import { iconUi } from '../../../core/icons/iconUi.js'

import {
  StatsFieldRenderer,
  StatsTripletInput,
} from '../inputs/index.js'

import {
  buildEntryFields,
  findPlayerStatsRow,
  getEntryFieldsProgress,
  getVisibleParms,
  resetPlayerStatsRow,
  restorePlayerStatsRow,
  splitEntryFields,
  updatePlayerStatsRow,
} from '../logic/index.js'

function EmptyPlayersState() {
  return (
    <Box sx={sx.stepContent}>
      <Typography level="title-sm">
        מילוי נתונים
      </Typography>

      <Sheet variant="outlined" sx={sx.placeholder}>
        <Typography level="body-sm" color="neutral">
          לא נבחרו שחקנים. חזור לשלב שחקנים ובחר לפחות שחקן אחד.
        </Typography>
      </Sheet>
    </Box>
  )
}

function FieldCard({ field, children }) {
  const type = field?.statsParmType || field?.parm?.statsParmType || 'general'

  return (
    <Sheet variant="plain" sx={sx.entryFieldCard(type)}>
      {children}
    </Sheet>
  )
}

function PlayerTabs({
  players,
  selectedPlayerIds,
  activePlayerId,
  onActivePlayer,
}) {
  return (
    <Box sx={sx.activePlayersBar}>
      {selectedPlayerIds.map(playerId => {
        const player = players.find(item => item.playerId === playerId)
        const selected = playerId === activePlayerId
        const photo = player?.photo || playerImage

        return (
          <Button
            key={playerId}
            size="sm"
            variant={selected ? 'solid' : 'soft'}
            color={selected ? 'primary' : 'neutral'}
            onClick={() => onActivePlayer(playerId)}
            startDecorator={<Avatar src={photo} sx={{ width: 20, height: 20 }} />}
            sx={sx.playerTabButton}
          >
            {player?.name || 'שחקן'}
          </Button>
        )
      })}
    </Box>
  )
}

function PlayerEntryHeader({
  activePlayer,
  progress,
  onReset,
  onRestore,
  canRestore,
}) {
  const photo = activePlayer?.photo || playerImage
  const icon = activePlayer?.isStarting ? 'isStart' : 'isSquad'

  return (
    <Box sx={sx.entryHeader}>
      <Box>
        <Box sx={sx.entryPlayerTitle}>
          <Avatar src={photo} sx={{ width: 22, height: 22 }} />

          <Typography level="title-sm">
            {activePlayer?.name || 'שחקן'}
          </Typography>
        </Box>

        <Typography level="body-xs" color="neutral" startDecorator={iconUi({ id: icon })}>
          {activePlayer?.isStarting ? 'הרכב' : 'ספסל'} · {activePlayer?.timePlayed || 0} דק׳
        </Typography>
      </Box>

      <Box sx={sx.entryHeaderActions}>
        {canRestore ? (
          <Button size="sm" variant="soft" color="neutral" onClick={onRestore}>
            שחזור שחקן
          </Button>
        ) : null}

        <Button size="sm" variant="soft" color="neutral" onClick={onReset}>
          איפוס שחקן
        </Button>

        <Chip size="sm" variant="soft" color="neutral">
          {progress?.filled || 0}/{progress?.total || 0} שדות
        </Chip>
      </Box>
    </Box>
  )
}

function RegularFieldsSection({ fields, row, onUpdateRow }) {
  if (!fields.length) return null

  return (
    <Box sx={sx.entrySection}>
      <Typography level="body-xs" sx={sx.entrySectionTitle}>
        שדות בודדים
      </Typography>

      <Box sx={sx.regularEntryGrid}>
        {fields.map(field => (
          <FieldCard key={field.id} field={field}>
            <StatsFieldRenderer
              parm={field.parm}
              value={row?.[field.id]}
              onChange={value => onUpdateRow({ [field.id]: value })}
            />
          </FieldCard>
        ))}
      </Box>
    </Box>
  )
}

function TripletFieldsSection({ fields, row, onUpdateRow }) {
  if (!fields.length) return null

  return (
    <Box sx={sx.entrySection}>
      <Typography level="body-xs" sx={sx.entrySectionTitle}>
        מדדים מחושבים
      </Typography>

      <Box sx={sx.tripletEntryGrid}>
        {fields.map(field => (
          <FieldCard key={field.id} field={field}>
            <StatsTripletInput
              label={field.label}
              totalKey={field.totalKey}
              successKey={field.successKey}
              rateKey={field.rateKey}
              totalValue={row?.[field.totalKey]}
              successValue={row?.[field.successKey]}
              rateValue={row?.[field.rateKey]}
              onChange={onUpdateRow}
            />
          </FieldCard>
        ))}
      </Box>
    </Box>
  )
}

export function EntryStep({ draft, savedDraft, onDraft }) {
  const selectedParmIds = draft?.selectedParmIds || []
  const selectedPlayerIds = draft?.selectedPlayerIds || []
  const players = draft?.players || []

  const visibleParms = getVisibleParms(selectedParmIds)
  const fields = buildEntryFields(visibleParms)
  const { regularFields, tripletFields } = splitEntryFields(fields)

  const activePlayerId =
    draft?.activePlayerId ||
    selectedPlayerIds[0] ||
    ''

  const activePlayer = players.find(player => {
    return player.playerId === activePlayerId
  })

  const row = findPlayerStatsRow({
    draft,
    playerId: activePlayerId,
  }) || { playerId: activePlayerId }

  const savedRow = findPlayerStatsRow({
    draft: savedDraft,
    playerId: activePlayerId,
  })

  const setActivePlayer = playerId => {
    onDraft({ activePlayerId: playerId })
  }

  const progress = getEntryFieldsProgress({
    fields,
    row,
  })

  const resetActivePlayer = () => {
    if (!activePlayerId) return

    onDraft({
      playerStats: resetPlayerStatsRow({
        draft,
        playerId: activePlayerId,
      }),
    })
  }

  const restoreActivePlayer = () => {
    if (!activePlayerId || !savedDraft) return

    const playerStats = savedRow
      ? restorePlayerStatsRow({
          draft,
          savedDraft,
          playerId: activePlayerId,
        })
      : resetPlayerStatsRow({
          draft,
          playerId: activePlayerId,
        })

    onDraft({ playerStats })
  }

  const updateRow = patch => {
    onDraft({
      playerStats: updatePlayerStatsRow({
        draft,
        playerId: activePlayerId,
        patch,
      }),
    })
  }

  if (!selectedPlayerIds.length) {
    return <EmptyPlayersState />
  }

  return (
    <Box sx={sx.stepContent}>
      <Box>
        <Typography level="title-sm">
          מילוי נתונים
        </Typography>

        <Typography level="body-sm" color="neutral">
          בחר שחקן פעיל ומלא רק את הפרמטרים שסומנו בשלב הקודם.
        </Typography>
      </Box>

      <PlayerTabs
        players={players}
        selectedPlayerIds={selectedPlayerIds}
        activePlayerId={activePlayerId}
        onActivePlayer={setActivePlayer}
      />

      <Sheet variant="outlined" sx={sx.entryCard}>
        <PlayerEntryHeader
          activePlayer={activePlayer}
          progress={progress}
          onReset={resetActivePlayer}
          onRestore={restoreActivePlayer}
          canRestore={Boolean(savedDraft && activePlayerId)}
        />

        <RegularFieldsSection
          fields={regularFields}
          row={row}
          onUpdateRow={updateRow}
        />

        <Divider sx={{ mt: 1 }} />

        <TripletFieldsSection
          fields={tripletFields}
          row={row}
          onUpdateRow={updateRow}
        />
      </Sheet>
    </Box>
  )
}
