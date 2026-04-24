// features/hub/playerProfile/mobile/PlayerProfileMobile.js

import React, { useMemo, useState } from 'react'
import { Box, Sheet } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import {
  PLAYER_TABS,
  PLAYER_PROJECT_TABS,
} from '../playerProfile.routes'

import PlayerHeader from './components/PlayerHeader'

import PlayerModules from '../sharedUi/PlayerModules.js'
import PlayerProfileFab from '../sharedUi/PlayerProfileFab'

import { mobilePlayerModulesMap, mobileProjectPlayerModulesMap } from './playerModulesMobile.map'

import NavCardsMobile from '../../sharedProfile/mobile/NavCardsMobile'
import ProfileSectionMobile from './ProfileSectionMobile'

import { profileSx as sx } from './sx/profile.sx'

function PlayerSectionsPicker({ tabs, activeTab }) {
  return (
    <Box sx={{ px: 1.25, pt: 1, pb: 1.25 }}>
      <NavCardsMobile
        tabs={tabs}
        activeTab={activeTab}
        defaultTab={null}
      />
    </Box>
  )
}

export default function PlayerProfileMobile({
  tab,
  selectedTab,
  entity,
  context,
  taskContext,
  counts,
}) {
  const navigate = useNavigate()
  
  const [gamesInsightsRequest, setGamesInsightsRequest] = useState(0)
  const [performanceInsightsRequest, setPerformanceInsightsRequest] = useState(0)
  const [abilitiesInsightsRequest, setAbilitiesInsightsRequest] = useState(0)
  const [videoInsightsRequest, setVideoInsightsRequest] = useState(0)

  const isProject = entity?.project === 'project'
  const modulesMap = isProject ? mobilePlayerModulesMap : mobileProjectPlayerModulesMap

  const tabs = useMemo(() => {
    return isProject ? PLAYER_PROJECT_TABS : PLAYER_TABS
  }, [isProject])

  const tabsMeta = useMemo(() => {
    return tabs.map((item) => ({
      value: item.key,
      label: item.label,
      icon: item.iconKey,
      color: item.color,
    }))
  }, [tabs])

  const hasActiveSection = Boolean(selectedTab)

  const handleBackToProfile = () => {
    navigate(`/players/${entity?.id}`)
  }

  const handleBackToHub = () => {
    navigate('/hub')
  }

  const fabProps = {
    entity,
    context,
    tab,
    taskContext,
    onOpenGamesInsights: () => setGamesInsightsRequest((v) => v + 1),
    onOpenPerformanceInsights: () => setPerformanceInsightsRequest((v) => v + 1),
    onOpenAbilitiesInsights: () => setAbilitiesInsightsRequest((v) => v + 1),
    onOpenVideoInsights: () => setVideoInsightsRequest((v) => v + 1),
  }

  if (!hasActiveSection) {
    return (
      <Sheet sx={sx.sheetNotActive}>
        <PlayerHeader
          entity={entity}
          context={context}
          tab={tab}
          counts={counts}
          onBack={handleBackToHub}
        />

        <Box className="dpScrollThin" sx={sx.scrollNotActive}>
          <PlayerSectionsPicker tabs={tabs} activeTab={selectedTab} />
        </Box>

        <PlayerProfileFab
          entity={entity}
          context={context}
          tab={tab}
          taskContext={taskContext}
        />
      </Sheet>
    )
  }

  return (
    <Sheet sx={sx.sheet}>
      <PlayerHeader
        entity={entity}
        context={context}
        tab={tab}
        counts={counts}
        onBack={handleBackToHub}
      />

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ProfileSectionMobile
          mode={tab}
          tabsMeta={tabsMeta}
          onBack={handleBackToProfile}
        >
          <Box className="dpScrollThin" sx={sx.scroll}>
            <PlayerModules
              entity={entity}
              context={context}
              tab={tab}
              modulesMap={modulesMap}
              gamesInsightsRequest={gamesInsightsRequest}
              performanceInsightsRequest={performanceInsightsRequest}
              abilitiesInsightsRequest={abilitiesInsightsRequest}
              videoInsightsRequest={videoInsightsRequest}
            />
          </Box>
        </ProfileSectionMobile>
      </Box>

      <PlayerProfileFab {...fabProps} />
    </Sheet>
  )
}
