// playerProfile/sharedModules/info/PlayerInfoModuleBase.js

import React, { useState } from 'react'
import { Box, Typography } from '@mui/joy'

import EmptyState from '../../../sharedProfile/EmptyState.js'

import usePlayerInfoModuleModel from './usePlayerInfoModuleModel.js'

const TEXT = {
  noPlayer: '\u05d0\u05d9\u05df \u05de\u05d9\u05d3\u05e2 \u05dc\u05e9\u05d7\u05e7\u05df',
  identity: '\u05d6\u05d4\u05d5\u05ea',
  identitySub: '\u05e9\u05dd, \u05ea\u05d0\u05e8\u05d9\u05da \u05dc\u05d9\u05d3\u05d4 \u05d5\u05e9\u05e0\u05ea\u05d5\u05df',
  source: '\u05e7\u05e9\u05e8 \u05d5\u05de\u05e7\u05d5\u05e8',
  sourceSub: '\u05d8\u05dc\u05e4\u05d5\u05df, \u05e7\u05d9\u05e9\u05d5\u05e8 \u05d4\u05ea\u05d0\u05d7\u05d3\u05d5\u05ea \u05d5\u05ea\u05e4\u05e7\u05d9\u05d3 \u05d1\u05e1\u05d2\u05dc',
  affiliation: '\u05e9\u05d9\u05d5\u05da \u05de\u05e7\u05e6\u05d5\u05e2\u05d9',
  affiliationSub: '\u05de\u05d5\u05e2\u05d3\u05d5\u05df, \u05e7\u05d1\u05d5\u05e6\u05d4 \u05d5\u05de\u05e2\u05de\u05d3 \u05d1\u05e1\u05d2\u05dc',
  professional: '\u05de\u05e6\u05d1 \u05de\u05e7\u05e6\u05d5\u05e2\u05d9',
  professionalSub: '\u05e4\u05e2\u05d9\u05dc\u05d5\u05ea, \u05e4\u05e8\u05d5\u05d9\u05e7\u05d8 \u05d5\u05de\u05d3\u05d3\u05d9\u05dd \u05e4\u05d9\u05d6\u05d9\u05d9\u05dd',
}

const groupSx = {
  display: 'grid',
  gap: 0.85,
  p: 0.9,
  borderRadius: 'md',
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.surface',
  minWidth: 0,
  alignContent: 'start',
}


const detailsLayoutSx = {
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',
    lg: 'minmax(0, 1.35fr) minmax(340px, .82fr)',
  },
  gap: 1,
  alignItems: 'start',
  minWidth: 0,
}

const detailsStackSx = {
  display: 'grid',
  gap: 1,
  minWidth: 0,
  alignContent: 'start',
}

const groupHeaderSx = {
  display: 'grid',
  gap: 0.1,
  pb: 0.65,
  borderBottom: '1px solid',
  borderColor: 'divider',
}

const groupTitleSx = {
  fontWeight: 600,
  lineHeight: 1.2,
}

const groupSubSx = {
  color: 'text.tertiary',
}

function DetailsGroup({ title, subtitle, children }) {
  return (
    <Box sx={groupSx}>
      <Box sx={groupHeaderSx}>
        <Typography level='title-sm' sx={groupTitleSx}>{title}</Typography>
        <Typography level='body-xs' sx={groupSubSx}>{subtitle}</Typography>
      </Box>
      {children}
    </Box>
  )
}

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
    return <EmptyState title={TEXT.noPlayer} />
  }

  const detailsCards = isMobile ? (
    <>
      <PlayerStatusCard draft={draft} setDraft={setDraft} pending={pending} />
      <PlayerNamesCard draft={draft} setDraft={setDraft} pending={pending} />
      <PlayerBirthCard draft={draft} setDraft={setDraft} pending={pending} />
      <PlayerAffiliationCard
        player={player}
        draft={draft}
        setDraft={setDraft}
        pending={pending}
        clubsOptions={context?.clubs}
        teamsOptions={context?.teams}
      />
      <ProjectStatusCard draft={draft} setDraft={setDraft} pending={pending} />
      <PlayerPhysicalCard draft={draft} setDraft={setDraft} pending={pending} />
    </>
  ) : (
    <Box sx={detailsLayoutSx}>
      <Box sx={detailsStackSx}>
        <DetailsGroup title={TEXT.identity} subtitle={TEXT.identitySub}>
          <PlayerNamesCard draft={draft} setDraft={setDraft} pending={pending} />
          <PlayerBirthCard draft={draft} setDraft={setDraft} pending={pending} />
        </DetailsGroup>

        <DetailsGroup title={TEXT.affiliation} subtitle={TEXT.affiliationSub}>
          <PlayerAffiliationCard
            player={player}
            draft={draft}
            setDraft={setDraft}
            pending={pending}
            clubsOptions={context?.clubs}
            teamsOptions={context?.teams}
          />
        </DetailsGroup>
      </Box>

      <Box sx={detailsStackSx}>
        <DetailsGroup title={TEXT.source} subtitle={TEXT.sourceSub}>
          <PlayerStatusCard draft={draft} setDraft={setDraft} pending={pending} />
        </DetailsGroup>

        <DetailsGroup title={TEXT.professional} subtitle={TEXT.professionalSub}>
          <ProjectStatusCard draft={draft} setDraft={setDraft} pending={pending} />
          <PlayerPhysicalCard draft={draft} setDraft={setDraft} pending={pending} />
        </DetailsGroup>
      </Box>
    </Box>
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
      <Box sx={toolbarWrapSx}>
        <PlayerInfoTabs activeTab={activeTab} onTabChange={setActiveTab} />

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
        <Box sx={gridSx}>{detailsCards}</Box>
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
          onOpenPosition={() => {
            const positionTab = playerInfoTabs?.find(tab => tab.id === 'position')
            if (positionTab) setActiveTab(positionTab)
          }}
        />
      ) : null}
    </>
  )

  if (!Section) return body

  const Wrap = Section

  return <Wrap>{body}</Wrap>
}
