// features/hub/teamProfile/mobile/TeamProfileMobile.js

import React, { useMemo, useState } from 'react'
import { Box, Sheet } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import { TEAM_TABS } from '../teamProfile.routes'

import TeamHeader from './components/TeamHeader'

import TeamModules from '../sharedUi/TeamModules'
import { mobileTeamModulesMap } from './teamModulesMobile.map'

import TeamProfileFab from '../sharedUi/TeamProfileFab'

import NavCardsMobile from '../../sharedProfile/mobile/NavCardsMobile'
import ProfileSectionMobile from './ProfileSectionMobile'

import { profileSx as sx } from './sx/profile.sx'

function TeamSectionsPicker({ tabs, activeTab }) {
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

export default function TeamProfileMobile({
  tab,
  selectedTab,
  entity,
  context,
  taskContext,
  counts,
}) {
  const navigate = useNavigate()

  const [playersInsightsRequest, setPlayersInsightsRequest] = useState(0)
  const [gamesInsightsRequest, setGamesInsightsRequest] = useState(0)
  const [performanceInsightsRequest, setPerformanceInsightsRequest] = useState(0)
  const [abilitiesInsightsRequest, setAbilitiesInsightsRequest] = useState(0)
  const [videoInsightsRequest, setVideoInsightsRequest] = useState(0)

  const tabs = TEAM_TABS

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
    navigate(`/teams/${entity?.id}`)
  }

  const handleBackToHub = () => {
    navigate('/hub')
  }

  const fabProps = {
    entity,
    context,
    tab,
    taskContext,
    onOpenPlayersInsights: () => setPlayersInsightsRequest((v) => v + 1),
    onOpenGamesInsights: () => setGamesInsightsRequest((v) => v + 1),
    onOpenPerformanceInsights: () => setPerformanceInsightsRequest((v) => v + 1),
    onOpenAbilitiesInsights: () => setAbilitiesInsightsRequest((v) => v + 1),
    onOpenVideoInsights: () => setVideoInsightsRequest((v) => v + 1),
  }

  if (!hasActiveSection) {
    return (
      <Sheet sx={sx.sheetNotActive}>
        <TeamHeader
          entity={entity}
          context={context}
          tab={tab}
          counts={counts}
          onBack={handleBackToHub}
        />

        <Box className="dpScrollThin" sx={sx.scrollNotActive}>
          <TeamSectionsPicker tabs={tabs} activeTab={selectedTab} />
        </Box>

        <TeamProfileFab {...fabProps} />
      </Sheet>
    )
  }

  return (
    <Sheet sx={sx.sheet}>
      <TeamHeader
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
            <TeamModules
              entity={entity}
              context={context}
              tab={tab}
              modulesMap={mobileTeamModulesMap}
              playersInsightsRequest={playersInsightsRequest}
              gamesInsightsRequest={gamesInsightsRequest}
              performanceInsightsRequest={performanceInsightsRequest}
              abilitiesInsightsRequest={abilitiesInsightsRequest}
              videoInsightsRequest={videoInsightsRequest}
            />
          </Box>
        </ProfileSectionMobile>
      </Box>

      <TeamProfileFab {...fabProps} />
    </Sheet>
  )
}
