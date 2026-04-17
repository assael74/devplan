// features/hub/clubProfile/ClubProfilePage.js

import React from 'react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

import useClubProfilePageModel from './clubProfile.logic'
import ClubProfileDesktop from './desktop/ClubProfileDesktop'
import ClubProfileMobile from './mobile/ClubProfileMobile'

export default function ClubProfilePage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const model = useClubProfilePageModel()

  if (model.state === 'loading') return model.loadingNode
  if (model.state === 'error') return model.errorNode
  if (model.state === 'missing') return model.missingNode

  return isMobile ? (
    <ClubProfileMobile {...model} />
  ) : (
    <ClubProfileDesktop {...model} />
  )
}
