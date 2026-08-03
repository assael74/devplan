// src/features/hub/sharedProfile/NavCards.js
import React, { useMemo } from 'react'
import { Box, Sheet, Typography } from '@mui/joy'
import { useLocation, useNavigate } from 'react-router-dom'

import { buildProfileTabPath } from '../profile.routes'
import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { sheetSx, boxSx } from './nav.sx'
import { getEntityColors } from '../../../../ui/core/theme/Colors.js'

function NavCard({ active, label, iconId, onClick, colorKey }) {
  const c = getEntityColors(colorKey)

  return (
    <Sheet variant="plain" onClick={onClick} sx={sheetSx(active, c)}>
      <Box sx={boxSx(active, c)}>
        {iconUi({ id: iconId || 'dot', size: 'sm' })}
      </Box>

      <Typography level="title-sm" sx={{ color: c?.text || 'text.primary' }}>
        {label}
      </Typography>
    </Sheet>
  )
}

export default function NavCards({
  tabs,
  activeTab,
  defaultTab,
  iconMap,
  activeColor,
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const list = useMemo(() => (Array.isArray(tabs) ? tabs : []), [tabs])

  return (
    <Box sx={{ display: 'grid', gap: 0.9, gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
      {list.map((t) => (
        <NavCard
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
