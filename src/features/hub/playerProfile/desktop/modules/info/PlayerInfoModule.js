// playerProfile/desktop/modules/info/PlayerInfoModule.js

import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { Box } from '@mui/joy'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'
import EmptyState from '../../../../sharedProfile/EmptyState.js'
import { moduleSx as sx } from './module.sx.js'

import PlayerStatusCard from './components/PlayerStatusCard.js'
import ProjectStatusCard from './components/ProjectStatusCard.js'
import PlayerNamesCard from './components/PlayerNamesCard.js'
import PlayerAffiliationCard from './components/PlayerAffiliationCard.js'
import PlayerPhysicalCard from './components/PlayerPhysicalCard.js'
import PlayerBirthCard from './components/PlayerBirthCard.js'
import PlayerPositionCard from './components/PlayerPositionCard.js'
import PlayerTargetsCard from './components/PlayerTargetsCard.js'
import PlayerInfoToolbar from './components/PlayerInfoToolbar.js'
import PlayerInfoTabs, { PLAYER_INFO_TABS } from './components/PlayerInfoTabs.js'

import { usePlayerHubUpdate } from '../../../../hooks/players/usePlayerHubUpdate.js'

import {
  buildPlayerEditInitial,
  buildPlayerEditPatch,
  buildPlayerName,
  isPlayerEditDirty,
} from '../../../../editLogic/players/index.js'

export default function PlayerInfoModule({ entity, context }) {
  const player = entity || null

  const [activeTab, setActiveTab] = useState(PLAYER_INFO_TABS[0])

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
    <SectionPanel>
      <PlayerInfoTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <Box sx={sx.stickyToolbar}>
        <PlayerInfoToolbar
          activeTab={activeTab}
          isDirty={isDirty}
          canSave={canSave}
          pending={pending}
          onReset={handleReset}
          onSave={handleSave}
        />
      </Box>

      {activeTab.id === 'details' && (
        <Box sx={sx.grid}>
          <PlayerStatusCard
            draft={draft}
            setDraft={setDraft}
            pending={pending}
          />

          <PlayerNamesCard
            draft={draft}
            setDraft={setDraft}
            pending={pending}
          />

          <PlayerBirthCard
            draft={draft}
            setDraft={setDraft}
            pending={pending}
          />

          <PlayerAffiliationCard
            draft={draft}
            setDraft={setDraft}
            pending={pending}
            clubsOptions={context?.clubs}
            teamsOptions={context?.teams}
          />

          <PlayerPhysicalCard
            draft={draft}
            setDraft={setDraft}
            pending={pending}
          />

          <ProjectStatusCard
            draft={draft}
            setDraft={setDraft}
            pending={pending}
          />
        </Box>
      )}

      {activeTab.id === 'position' && (
        <Box sx={{ pb: 2 }}>
          <PlayerPositionCard
            player={player}
            team={context?.team}
            draft={draft}
            setDraft={setDraft}
            pending={pending}
          />
        </Box>

      )}

      {activeTab.id === 'targets' && (
        <PlayerTargetsCard
          player={player}
          team={context?.team}
          draft={draft}
        />
      )}
    </SectionPanel>
  )
}
