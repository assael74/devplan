// src/features/players/modules/info/PlayerInfoModule.js

import React, { useMemo, useCallback } from 'react'
import { Box } from '@mui/joy'

import SectionPanel from '../../../sharedProfile/SectionPanel.js'
import EmptyState from '../../../sharedProfile/EmptyState.js'
import { playerInfoModuleSx as sx } from './playerInfo.module.sx.js'

import PlayerStatusCard from './components/PlayerStatusCard.js'
import ProjectStatusCard from './components/ProjectStatusCard.js'
import PlayerNamesCard from './components/PlayerNamesCard.js'
import PlayerAffiliationCard from './components/PlayerAffiliationCard.js'
import PlayerPhysicalCard from './components/PlayerPhysicalCard.js'
import PlayerBirthCard from './components/PlayerBirthCard.js'

import { usePlayerHubUpdate } from '../../../hooks/players/usePlayerHubUpdate.js'

const toStr = (v) => (v == null ? '' : String(v))

function buildEntityName(player) {
  const first = toStr(player?.playerFirstName).trim()
  const last = toStr(player?.playerLastName).trim()
  const full = [first, last].filter(Boolean).join(' ').trim()
  return full || toStr(player?.playerShortName).trim() || 'שחקן'
}

export default function PlayerInfoModule({ entity, context }) {
  const player = entity || null

  const headerSubtitle = useMemo(() => {
    if (!player) return ''
    const teamName = player?.teamName || ''
    const clubName = player?.clubName || ''
    return `${clubName}${clubName && teamName ? ' · ' : ''}${teamName}`
  }, [player])

  const entityName = useMemo(() => buildEntityName(player), [player])

  const { run, pending } = usePlayerHubUpdate(player)

  const onUpdate = useCallback(
    async (patch, meta = {}) => {
      if (!player?.id) return

      return run(patch, {
        ...meta,
        playerId: player.id,
        entityName,
        createIfMissing: true,
      })
    },
    [run, player, entityName]
  )

  if (!player) {
    return <EmptyState title="אין מידע לשחקן" subtitle={headerSubtitle} />
  }

  return (
    <SectionPanel>
      <Box sx={sx.grid}>
        <PlayerStatusCard player={player} onUpdate={onUpdate} pending={pending} />
        <PlayerNamesCard player={player} onUpdate={onUpdate} pending={pending} />
        <PlayerBirthCard player={player} onUpdate={onUpdate} pending={pending} />
        <PlayerAffiliationCard
          player={player}
          onUpdate={onUpdate}
          pending={pending}
          clubsOptions={context?.clubs}
          teamsOptions={context?.teams}
        />
        <PlayerPhysicalCard player={player} onUpdate={onUpdate} pending={pending} />
        <ProjectStatusCard player={player} onUpdate={onUpdate} pending={pending} />
      </Box>
    </SectionPanel>
  )
}
