// src/features/hub/playerProfile/PlayerProfilePage.js

import React from 'react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

import usePlayerProfilePageModel from './playerProfile.logic'
import { ProfilePageState } from '../sharedProfile/ui'
import PlayerProfileDesktop from './desktop/PlayerProfileDesktop'
import PlayerProfileMobile from './mobile/PlayerProfileMobile'

export default function PlayerProfilePage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const model = usePlayerProfilePageModel()
  
  if (model.state !== 'ready') {
    return (
      <ProfilePageState
        state={model.state}
        profileType="player"
      />
    )
  }

  return isMobile ? (
    <PlayerProfileMobile {...model} />
  ) : (
    <PlayerProfileDesktop {...model} />
  )
}
