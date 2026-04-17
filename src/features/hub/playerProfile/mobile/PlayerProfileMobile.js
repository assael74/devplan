// features/hub/playerProfile/mobile/PlayerProfileMobile.js

import React, { useMemo } from 'react'
import { Box, Sheet } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import {
  PLAYER_TABS,
  PLAYER_PROJECT_TABS,
} from '../playerProfile.routes'

import PlayerHeader from './components/PlayerHeader'
import PlayerModules from './components/PlayerModules'
import PlayerProfileFab from './components/PlayerProfileFab'

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
  isProject,
  entity,
  context,
  taskContext,
  counts,
}) {
  const navigate = useNavigate()

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
            <PlayerModules entity={entity} context={context} tab={tab} />
          </Box>
        </ProfileSectionMobile>
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
