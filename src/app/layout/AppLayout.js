// src/app/layout/AppLayout.js
import React, { useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Box } from '@mui/joy'
import { useTheme } from '@mui/joy/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import SideNav from '../../ui/core/layout/nav/SideNav'
import SideNavDrawer from '../../ui/core/layout/nav/SideNavDrawer'

export default function AppLayout({ topbar, sidenav, navBadges }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [isSideOpen, setIsSideOpen] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleMenuClick = () => {
    if (isMobile) setDrawerOpen(true)
    else setIsSideOpen((v) => !v)
  }

  const topbarWithHandler = useMemo(() => {
    if (!topbar) return null
    return React.cloneElement(topbar, { onMenuClick: handleMenuClick })
  }, [topbar, isMobile])

  const sideWidth = isSideOpen ? 220 : 72

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.body' }}>
      {/* TopBar */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1200,
          width: '100%',
          bgcolor: 'background.body',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {topbarWithHandler}
      </Box>

      {/* Mobile Drawer – שמאל אמיתי */}
      {isMobile ? (
        <SideNavDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          badges={navBadges}
          anchor="left"
        />
      ) : null}

      {/* BODY – מכריח LTR כדי שהשמאל יהיה שמאל */}
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          flexDirection: 'row-reverse',
        }}
      >
        {/* SideNav – שמאל */}
        {!isMobile ? (
          <Box
            sx={{
              width: sideWidth,
              flex: `0 0 ${sideWidth}px`,
              transition: 'width 180ms ease',
              borderRight: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.body',
              overflow: 'hidden',
              boxShadow: 'sm',
            }}
          >
            {sidenav ? (
              React.cloneElement(sidenav, {
                collapsed: !isSideOpen,
                badges: navBadges,
              })
            ) : (
              <SideNav collapsed={!isSideOpen} badges={navBadges} />
            )}
          </Box>
        ) : null}

        {/* תוכן – חוזר ל-RTL */}
        <Box component="main" sx={{ flex: 1, minWidth: 0, p: { xs: 1, sm: 1 }, bgcolor: 'background.level1' }} >
          <Box
            sx={{
              bgcolor: 'background.body',
              borderRadius: 'lg',
              border: '1px solid',
              borderColor: 'divider',
              minHeight: 'calc(100vh - 88px)',
              p: { xs: 1, sm: 1 },
            }}
          >
          <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
