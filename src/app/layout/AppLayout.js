// src/app/layout/AppLayout.js

import React, { useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Box } from '@mui/joy'
import { useTheme } from '@mui/joy/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import SideNav from '../../ui/core/layout/nav/SideNav'
import SideNavDrawer from '../../ui/core/layout/nav/SideNavDrawer'

import { layoutSx as sx } from './layout.sx.js'

export default function AppLayout({ topbar, sidenav, navBadges, navMode = 'full' }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [isSideOpen, setIsSideOpen] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleMenuClick = () => {
    if (isMobile) {
      setDrawerOpen(true)
      return
    }
    setIsSideOpen((v) => !v)
  }

  const topbarWithHandler = useMemo(() => {
    if (!topbar) return null
    return React.cloneElement(topbar, { onMenuClick: handleMenuClick })
  }, [topbar, isMobile])

  const sideWidth = isSideOpen ? 220 : 72

  if (isMobile) {
    return (
      <Box sx={sx.mobWrap}>
        <Box sx={sx.mobSecondWrap}>
          {topbarWithHandler}
        </Box>

        <SideNavDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          badges={navBadges}
          navMode={navMode}
          anchor="right"
        />

        <Box sx={sx.mobOutWrap}>
          <Box sx={sx.mobSecondOutWrap}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={sx.desRoot}>
      <Box sx={sx.desWrap}>
        {topbarWithHandler}
      </Box>

      <Box sx={sx.desContent}>
        <Box sx={sx.desSeconWrap(sideWidth)}>
          {sidenav ? (
            React.cloneElement(sidenav, {
              collapsed: !isSideOpen,
              badges: navBadges,
              navMode,
            })
          ) : (
            <SideNav collapsed={!isSideOpen} badges={navBadges} navMode={navMode} />
          )}
        </Box>

        <Box component="main" sx={sx.desMain}>
          <Box sx={sx.boxMain}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
