// src/features/calendar/CalendarHubPage.js

import React from 'react'
import { useMediaQuery } from '@mui/material'

import CalendarHubDesktop from './components/desktop/CalendarHubDesktop.js'
import CalendarHubMobile from './components/Mobile/CalendarHubMobile.js'

export default function CalendarHubPage() {
  const isMobile = useMediaQuery('(max-width: 899px)')

  if (isMobile) {
    return <CalendarHubMobile />
  }

  return <CalendarHubDesktop />
}
