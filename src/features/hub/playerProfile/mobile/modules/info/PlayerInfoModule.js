// playerProfile/mobile/modules/info/PlayerInfoModule.js

import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { Box } from '@mui/joy'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'
import EmptyState from '../../../../sharedProfile/EmptyState.js'
import { profileSx as sx } from './../../sx/profile.sx'

import PlayerStatusCard from './components/PlayerStatusCard.js'
import ProjectStatusCard from './components/ProjectStatusCard.js'
import PlayerNamesCard from './components/PlayerNamesCard.js'
import PlayerAffiliationCard from './components/PlayerAffiliationCard.js'
import PlayerPhysicalCard from './components/PlayerPhysicalCard.js'
import PlayerBirthCard from './components/PlayerBirthCard.js'
import PlayerInfoToolbar from './PlayerInfoToolbar.js'

import { usePlayerHubUpdate } from '../../../../hooks/players/usePlayerHubUpdate.js'

import {
  buildPlayerEditInitial,
  buildPlayerEditPatch,
  buildPlayerName,
  isPlayerEditDirty,
} from '../../../../editLogic/players/index.js'

export default function PlayerInfoModule({ entity, context }) {
  const player = entity || null

  const initial = useMemo(() => buildPlayerEditInitial(player), [player])
  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    setDraft(initial)
  }, [initial])

  const entityName = useMemo(() => buildPlayerName(player || {}), [player])
  const { run, pending } = usePlayerHubUpdate(player)

  const patch = useMemo(() => {
    return buildPlayerEditPatch(draft, initial)
  }, [draft, initial])

  const isDirty = useMemo(() => {
    return isPlayerEditDirty(draft, initial)
  }, [draft, initial])

  const hasPatch = Object.keys(patch).length > 0
  const canSave = Boolean(initial?.id) && isDirty && hasPatch && !pending

  const handleReset = useCallback(() => {
    if (pending) return
    setDraft(initial)
  }, [initial, pending])

  const handleSave = useCallback(async () => {
    if (!canSave) return

    await run(patch, {
      section: 'info',
      source: 'PlayerInfoModule',
      playerId: initial.id,
      entityName,
      createIfMissing: true,
    })
  }, [canSave, run, patch, initial.id, entityName])

  if (!player) {
    return <EmptyState title="אין מידע לשחקן" />
  }

  return (
    <SectionPanelMobile>
      <Box sx={sx.moduleRoot}>
        <PlayerInfoToolbar
          isDirty={isDirty}
          canSave={canSave}
          pending={pending}
          onReset={handleReset}
          onSave={handleSave}
        />

        <PlayerStatusCard draft={draft} setDraft={setDraft} pending={pending} />

        <PlayerNamesCard draft={draft} setDraft={setDraft} pending={pending} />

        <PlayerBirthCard draft={draft} setDraft={setDraft} pending={pending} />

        <PlayerAffiliationCard
          draft={draft}
          setDraft={setDraft}
          pending={pending}
          clubsOptions={context?.clubs}
          teamsOptions={context?.teams}
        />

        <ProjectStatusCard draft={draft} setDraft={setDraft} pending={pending} />

        <PlayerPhysicalCard draft={draft} setDraft={setDraft} pending={pending} />
      </Box>
    </SectionPanelMobile>
  )
}
