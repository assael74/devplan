// src/features/hub/sharedProfile/mobile/NavCardsMobile.js

import React, { useMemo } from 'react'
import { Box, Sheet, Typography } from '@mui/joy'
import { useLocation, useNavigate } from 'react-router-dom'

import { buildProfileTabPath } from '../profile.routes'
import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { getEntityColors } from '../../../../ui/core/theme/Colors.js'

import { sharedSx as sx } from './shared.sx'

function NavCardMobile({
  active,
  label,
  iconId,
  onClick,
  colorKey,
}) {
  const colors = getEntityColors(colorKey)

  return (
    <Sheet variant="plain" onClick={onClick} sx={sx.nav(active, colors)}>
      <Box sx={sx.navIcon(active, colors)}>
        {iconUi({id: iconId || 'dot',sx: { fontSize: 18, color: 'inherit' } })}
      </Box>

      <Box sx={sx.navWrap}>
        <Typography
          level="title-sm"
          noWrap
          sx={sx.navLabel(active, colors)}
        >
          {label}
        </Typography>
      </Box>
    </Sheet>
  )
}

export default function NavCardsMobile({
  tabs,
  activeTab,
  defaultTab,
  iconMap,
  activeColor,
  columns = 2,
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const list = useMemo(() => (Array.isArray(tabs) ? tabs : []), [tabs])

  return (
    <Box sx={{display: 'grid', gap: 0.75, gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`}}>
      {list.map((t) => (
        <NavCardMobile
          key={t.key}
          label={t.label}
          iconId={(iconMap && iconMap[t.key]) || t.iconKey || t.key}
          active={String(t.key) === String(activeTab)}
          colorKey={activeColor || t.color}
          onClick={() => {
            const pathname = buildProfileTabPath({
              pathname: location.pathname,
              tabs: list,
              defaultTab,
              tabKey: t.key,
            })
            const search = new URLSearchParams(location.search)
            search.delete('tab')

            navigate({
              pathname,
              search: search.toString() ? `?${search.toString()}` : '',
            })
          }}
        />
      ))}
    </Box>
  )
}
