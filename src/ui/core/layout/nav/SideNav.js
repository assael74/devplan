import React, { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Box, Typography, List, ListItem, ListItemButton, ListItemContent, Divider, Chip, Tooltip } from '@mui/joy'
import { iconUi } from '../../icons/iconUi'
import { navItemSx, navBoxSx } from './nav.sx'

// --- כותרת אזור ---
function SectionTitle({ children, collapsed }) {
  if (collapsed) return null
  return (
    <Typography level="body-xs" sx={{ px: 1.25, pt: 1.25, pb: 0.75, color: 'text.tertiary', fontWeight: 700 }}>
      {children}
    </Typography>
  )
}

// --- פריט ניווט ---
function NavItem({ item, active, onClick, collapsed }) {
  const btn = (
    <ListItemButton disabled={item.disabled} onClick={item.disabled ? undefined : onClick} {...navItemSx(active, collapsed)}>
      <Box {...navBoxSx(collapsed)}>
        {!collapsed && (
          <ListItemContent sx={{ minWidth: 0, direction: 'rtl' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography level="body-sm" noWrap sx={{ fontWeight: active ? 700 : 600 }}>
                {item.label}
              </Typography>
              {item.badge && <Chip size="sm">{item.badge}</Chip>}
            </Box>
          </ListItemContent>
        )}
        <Box sx={{ width: 22, height: 22, display: 'grid', placeItems: 'center' }}>
          {iconUi({ id: item.iconId })}
        </Box>
      </Box>
    </ListItemButton>
  )

  return (
    <ListItem sx={{ p: 0 }}>
      {collapsed ? <Tooltip title={item.label}>{btn}</Tooltip> : btn}
    </ListItem>
  )
}

export default function SideNav({ onNavigate, badges, collapsed = false }) {
  const nav = useNavigate()
  const loc = useLocation()

  // --- מבנה ניווט ---
  const sections = useMemo(
    () => [
      {
        title: 'שליטה',
        items: [{ label: 'מרכז שליטה', path: '/hub', iconId: 'dashboard' }],
      },
      {
        title: 'ניהול',
        items: [
          { label: 'וידאו', path: '/video', iconId: 'video', disabled: false },
          { label: 'תשלומים', path: '/payments', iconId: 'payments', disabled: true },
          { label: 'ניהול יומנים', path: '/calendar', iconId: 'meetings', disabled: false },
          { label: 'ניהול תגים', path: '/tags', iconId: 'tags', disabled: false },
          { label: 'חישוב יכולות', path: '/abilities/explainer', iconId: 'abilities', disabled: false },
        ],
      },
    ],
    []
  )

  function go(path, disabled) {
    if (disabled) return
    nav(path)
    onNavigate?.()
  }

  return (
    <Box sx={{ py: 1 }}>
      {sections.map((sec, idx) => (
        <Box key={sec.title}>
          <SectionTitle collapsed={collapsed}>{sec.title}</SectionTitle>
          <List sx={{ py: 0 }}>
            {sec.items.map((it) => (
              <NavItem
                key={it.path}
                item={it}
                collapsed={collapsed}
                active={loc.pathname === it.path}
                onClick={() => go(it.path, it.disabled)}
              />
            ))}
          </List>
          {idx < sections.length - 1 && !collapsed && <Divider sx={{ my: 1, opacity: 0.6 }} />}
        </Box>
      ))}
    </Box>
  )
}
