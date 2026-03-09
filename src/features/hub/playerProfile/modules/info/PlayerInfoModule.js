// src/features/players/modules/info/PlayerInfoModule.js
import React, { useMemo, useCallback } from 'react'
import { Box } from '@mui/joy'

import SectionPanel from '../../../sharedProfile/SectionPanel.js'
import EmptyState from '../../../sharedProfile/EmptyState.js'
import { playerInfoModuleSx as sx } from './playerInfo.module.sx.js'

import PlayerStatusCard from './components/PlayerStatusCard.js'
import PlayerNamesCard from './components/PlayerNamesCard.js'
import PlayerAffiliationCard from './components/PlayerAffiliationCard.js'
import PlayerPhysicalCard from './components/PlayerPhysicalCard.js'
import PlayerBirthCard from './components/PlayerBirthCard.js'

import { useUpdateAction } from '../../../../../ui/domains/entityActions/updateAction.js'

const toStr = (v) => (v == null ? '' : String(v))

const buildEntityName = (p) => {
  const first = toStr(p?.playerFirstName).trim()
  const last = toStr(p?.playerLastName).trim()
  const full = [first, last].filter(Boolean).join(' ').trim()
  return full || toStr(p?.playerShortName).trim() || 'שחקן'
}

export default function PlayerInfoModule({ entity, context }) {
  const player = entity

  const headerSubtitle = useMemo(() => {
    if (!player) return ''
    const teamName = player?.teamName || ''
    const clubName = player?.clubName || ''
    return `${clubName}${clubName && teamName ? ' · ' : ''}${teamName}`
  }, [player])

  const entityName = useMemo(() => buildEntityName(player), [player])

  const { runUpdate } = useUpdateAction({
    routerEntityType: 'players',
    snackEntityType: 'player',
    id: player?.id,
    entityName,
    requireAnyUpdated: true,
    createIfMissing: false,
  })

  const onUpdate = useCallback(
    async (patch, meta) => {
      return runUpdate(patch, meta)
    },
    [runUpdate]
  )

  if (!player) return <EmptyState title="אין מידע לשחקן" subtitle={headerSubtitle} />

  return (
    <SectionPanel>
      <Box sx={sx.grid}>
        <PlayerStatusCard player={player} onUpdate={onUpdate} />
        <PlayerNamesCard player={player} onUpdate={onUpdate} />
        <PlayerBirthCard player={player} onUpdate={onUpdate} />
        <PlayerAffiliationCard
          player={player}
          onUpdate={onUpdate}
          clubsOptions={context?.clubsList}
          teamsOptions={context?.teamsList}
        />
        <PlayerPhysicalCard player={player} onUpdate={onUpdate} />
      </Box>
    </SectionPanel>
  )
}
