// features/hub/clubProfile/mobile/ClubProfileMobile.js

import React, { useMemo, useState } from 'react'
import { Box, Sheet } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import { CLUB_TABS } from '../clubProfile.routes'

import ClubHeader from './components/ClubHeader'

import ClubModules from '../sharedUi/ClubModules.js'
import { mobileClubModulesMap } from './clubModulesMobile.map'

import ClubProfileFab from '../sharedUi/ClubProfileFab'

import NavCardsMobile from '../../sharedProfile/mobile/NavCardsMobile'
import ProfileSectionMobile from './ProfileSectionMobile'

import { profileSx as sx } from './sx/profile.sx'

function ClubSectionsPicker({ tabs, activeTab }) {
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

export default function ClubProfileMobile({
  tab,
  selectedTab,
  entity,
  context,
  taskContext,
  counts,
}) {
  const navigate = useNavigate()

  const [playersInsightsRequest, setPlayersInsightsRequest] = useState(0)
  const [teamsInsightsRequest, setTeamsInsightsRequest] = useState(0)

  const hasActiveSection = Boolean(selectedTab)

  const tabs = CLUB_TABS

  const tabsMeta = useMemo(() => {
    return tabs.map((item) => ({
      value: item.key,
      label: item.label,
      icon: item.iconKey,
      color: item.color,
    }))
  }, [tabs])

  const handleBackToProfile = () => {
    navigate(`/clubs/${entity?.id}`)
  }

  const handleBackToHub = () => {
    navigate('/hub')
  }

  const fabProps = {
    entity,
    context,
    tab: selectedTab,
    taskContext,
    onOpenPlayersInsights: () => setPlayersInsightsRequest((v) => v + 1),
    onOpenTeamsInsights: () => setTeamsInsightsRequest((v) => v + 1),
  }

  if (!hasActiveSection) {
    return (
      <Sheet sx={sx.sheetNotActive}>
        <ClubHeader
          entity={entity}
          context={context}
          tab={selectedTab}
          counts={counts}
          onBack={handleBackToHub}
        />

        <Box className="dpScrollThin" sx={sx.scrollNotActive}>
          <ClubSectionsPicker tabs={tabs} activeTab={selectedTab} />
        </Box>

        <ClubProfileFab {...fabProps} />
      </Sheet>
    )
  }

  return (
    <Sheet sx={sx.sheet}>
      <ClubHeader
        entity={entity}
        context={context}
        tab={tab}
        counts={counts}
        onBack={handleBackToHub}
      />

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ProfileSectionMobile
          mode={selectedTab}
          tabsMeta={tabsMeta}
          onBack={handleBackToProfile}
        >
          <Box className="dpScrollThin" sx={sx.scroll}>
            <ClubModules
              entity={entity}
              context={context}
              mode={selectedTab}
              tab={selectedTab}
              modulesMap={mobileClubModulesMap}
              playersInsightsRequest={playersInsightsRequest}
              teamsInsightsRequest={teamsInsightsRequest}
            />
          </Box>
        </ProfileSectionMobile>
      </Box>

      <ClubProfileFab {...fabProps} />
    </Sheet>
  )
}
