// playerProfile/sharedModules/info/PlayerInfoModuleBase.js

import React, { useState } from 'react'
import { Box } from '@mui/joy'

import EmptyState from '../../../sharedProfile/EmptyState.js'

import usePlayerInfoModuleModel from './usePlayerInfoModuleModel.js'

export default function PlayerInfoModuleBase({
  entity,
  context,

  Section,
  isMobile = false,
  source = 'PlayerInfoModule',

  rootSx,
  toolbarWrapSx,
  gridSx,

  PlayerInfoToolbar,
  PlayerInfoTabs,
  playerInfoTabs,

  PlayerStatusCard,
  ProjectStatusCard,
  PlayerNamesCard,
  PlayerAffiliationCard,
  PlayerPhysicalCard,
  PlayerBirthCard,
  PlayerPositionCard,
  PlayerTargetsCard,
}) {
  const model = usePlayerInfoModuleModel({
    entity,
    source,
  })

  const {
    player,
    draft,
    pending,
    isDirty,
    canSave,

    setDraft,
    handleReset,
    handleSave,
  } = model

  const [activeTab, setActiveTab] = useState(playerInfoTabs?.[0] || null)

  if (!player) {
    return <EmptyState title="אין מידע לשחקן" />
  }

  const detailsCards = (
    <>
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

      {isMobile ? (
        <ProjectStatusCard
          draft={draft}
          setDraft={setDraft}
          pending={pending}
        />
      ) : (
        <>
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
        </>
      )}

      {isMobile ? (
        <PlayerPhysicalCard
          draft={draft}
          setDraft={setDraft}
          pending={pending}
        />
      ) : null}
    </>
  )

  const body = isMobile ? (
    <Box sx={rootSx}>
      <PlayerInfoToolbar
        activeTab={null}
        player={player}
        team={context?.team}
        draft={draft}
        isDirty={isDirty}
        canSave={canSave}
        pending={pending}
        onReset={handleReset}
        onSave={handleSave}
       />

      {detailsCards}
    </Box>
  ) : (
    <>
      <PlayerInfoTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <Box sx={toolbarWrapSx}>
        <PlayerInfoToolbar
          activeTab={activeTab}
          player={player}
          team={context?.team}
          draft={draft}
          isDirty={isDirty}
          canSave={canSave}
          pending={pending}
          onReset={handleReset}
          onSave={handleSave}
        />
      </Box>

      {activeTab?.id === 'details' && (
        <Box sx={gridSx}>
          {detailsCards}
        </Box>
      )}

      {activeTab?.id === 'position' && PlayerPositionCard ? (
        <Box sx={{ pb: 2 }}>
          <PlayerPositionCard
            player={player}
            team={context?.team}
            draft={draft}
            setDraft={setDraft}
            pending={pending}
          />
        </Box>
      ) : null}

      {activeTab?.id === 'targets' && PlayerTargetsCard ? (
        <PlayerTargetsCard
          player={player}
          team={context?.team}
          draft={draft}
          setDraft={setDraft}
          pending={pending}
        />
      ) : null}
    </>
  )

  if (!Section) return body

  const Wrap = Section

  return <Wrap>{body}</Wrap>
}
