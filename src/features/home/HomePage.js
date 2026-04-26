// src/features/home/HomePageView.js

import React from 'react'
import { useMediaQuery } from '@mui/material'

import HomePageMobile from './mobile/HomePageMobile.js'
import HomePageDesktop from './desktop/HomePageDesktop.js'
import TaskFab from './TaskFab.js'

export default function HomePage() {
  const isMobile = useMediaQuery('(max-width: 899px)')

  return (
    <>
      {isMobile ? <HomePageMobile /> : <HomePageDesktop />}

      <TaskFab />
    </>
  )
}
