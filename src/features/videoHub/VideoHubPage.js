// src/features/videoHub/VideoHubPage.js

import React from 'react'
import useMediaQuery from '@mui/material/useMediaQuery'

import VideoHubDesktop from './components/desktop/VideoHubDesktop.js'
import VideoHubMobile from './components/mobile/VideoHubMobile.js'

export default function VideoHubPage() {
  const isMobile = useMediaQuery('(max-width:900px)')

  if (isMobile) {
    return <VideoHubMobile />
  }

  return <VideoHubDesktop />
}
