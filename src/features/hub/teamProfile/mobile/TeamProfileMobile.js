// features/hub/teamProfile/mobile/TeamProfileMobile.js

import React, { useMemo } from 'react'
import { Box, Sheet } from '@mui/joy'
import { useSearchParams } from 'react-router-dom'

import { TEAM_TABS } from '../teamProfile.routes'

import TeamHeader from './components/TeamHeader'
import TeamModules from './components/TeamModules'
import TeamProfileFab from './components/TeamProfileFab'

import NavCardsMobile from '../../sharedProfile/mobile/NavCardsMobile'
import ProfileSectionMobile from './ProfileSectionMobile'

import { profileSx as sx } from './sx/profile.sx'

function TeamSectionsPicker({ activeTab }) {
  return (
    <Box sx={{ px: 1.25, pt: 1, pb: 1.25 }}>
      <NavCardsMobile
        tabs={TEAM_TABS}
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
  const [sp, setSp] = useSearchParams()

  const tabsMeta = useMemo(() => {
    return TEAM_TABS.map((item) => ({
      value: item.key,
      label: item.label,
      icon: null,
    }))
  }, [])

  const hasActiveSection = Boolean(selectedTab)

  const handleBack = () => {
    const next = new URLSearchParams(sp)
    next.delete('tab')
    setSp(next)
  }

  if (!hasActiveSection) {
    return (
      <Sheet sx={sx.sheetNotActive}>
        <TeamHeader entity={entity} context={context} tab={tab} counts={counts} />

        <Box className="dpScrollThin" sx={sx.scrollNotActive}>
          <TeamSectionsPicker activeTab={selectedTab} />
        </Box>

        <TeamProfileFab
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
      <TeamHeader entity={entity} context={context} tab={tab} counts={counts} />

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ProfileSectionMobile
          mode={tab}
          tabsMeta={tabsMeta}
          onBack={handleBack}
        >
          <Box className="dpScrollThin" sx={sx.scroll}>
            <TeamModules entity={entity} context={context} tab={tab} />
          </Box>
        </ProfileSectionMobile>
      </Box>

      <TeamProfileFab
        entity={entity}
        context={context}
        tab={tab}
        taskContext={taskContext}
      />
    </Sheet>
  )
}
