// src/features/hub/teamProfile/TeamProfilePage.js

import React from 'react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

import useTeamProfilePageModel from './teamProfile.logic'
import { ProfilePageState } from '../sharedProfile/ui'
import TeamProfileDesktop from './desktop/TeamProfileDesktop'
import TeamProfileMobile from './mobile/TeamProfileMobile'

export default function TeamProfilePage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const model = useTeamProfilePageModel()

  if (model.state !== 'ready') {
    return (
      <ProfilePageState
        state={model.state}
        profileType="team"
      />
    )
  }

  return isMobile ? (
    <TeamProfileMobile {...model} />
  ) : (
    <TeamProfileDesktop {...model} />
  )
}
