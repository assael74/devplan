// src/ui/core/layout/nav/SideNav.js

import React, { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
  Tooltip,
  Typography,
} from '@mui/joy'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'

import { iconUi } from '../../icons/iconUi'
import { navSx as sx } from './nav.sx'

function SectionTitle({ children, collapsed }) {
  if (collapsed) return null

  return (
    <Typography level="body-xs" sx={sx.title}>
      {children}
    </Typography>
  )
}

function isItemActive(pathname, itemPath) {
  if (pathname === itemPath) return true
  if (itemPath === '/') return false

  return pathname.startsWith(`${itemPath}/`)
}

function NavItem({ item, active, onClick, collapsed }) {
  const button = (
    <ListItemButton
      disabled={item.disabled}
      onClick={item.disabled ? undefined : onClick}
      {...sx.navItem(active, collapsed)}
    >
      <Box {...sx.navBox(collapsed)}>
        <Box sx={sx.navIcon}>
          {iconUi({ id: item.iconId })}
        </Box>

        {!collapsed && (
          <ListItemContent sx={sx.navContent}>
            <Box sx={sx.navLabelRow}>
              <Typography
                level="body-sm"
                noWrap
                sx={{ minWidth: 0, fontWeight: active ? 700 : 600 }}
              >
                {item.label}
              </Typography>

              {item.badge ? <Chip size="sm">{item.badge}</Chip> : null}
            </Box>
          </ListItemContent>
        )}
      </Box>
    </ListItemButton>
  )

  return (
    <ListItem sx={{ p: 0 }}>
      {collapsed ? (
        <Tooltip title={item.label} placement="right">
          {button}
        </Tooltip>
      ) : button}
    </ListItem>
  )
}

function CollapsibleSection({
  section,
  open,
  collapsed,
  pathname,
  onToggle,
  onNavigate,
}) {
  if (collapsed) {
    return (
      <List sx={{ py: 0 }}>
        {section.items.map(item => (
          <NavItem
            key={item.path}
            item={item}
            collapsed
            active={isItemActive(pathname, item.path)}
            onClick={() => onNavigate(item.path, item.disabled)}
          />
        ))}
      </List>
    )
  }

  const handleKeyDown = event => {
    if (event.key !== 'Enter' && event.key !== ' ') return

    event.preventDefault()
    onToggle()
  }

  return (
    <Box sx={sx.section}>
      <Box
        role="button"
        tabIndex={0}
        aria-expanded={open}
        sx={sx.collapseHeader(open)}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
      >
        <Typography level="body-xs" sx={sx.collapseTitle}>
          {section.title}
        </Typography>

        <Box component="span" aria-hidden sx={sx.collapseIndicator(open)}>
          <KeyboardArrowDownRoundedIcon />
        </Box>
      </Box>

      <Box sx={sx.collapseContent(open)}>
        <Box sx={sx.collapseInner}>
          <List sx={{ pt: 0.5, pb: 0 }}>
            {section.items.map(item => (
              <NavItem
                key={item.path}
                item={item}
                collapsed={false}
                active={isItemActive(pathname, item.path)}
                onClick={() => onNavigate(item.path, item.disabled)}
              />
            ))}
          </List>
        </Box>
      </Box>
    </Box>
  )
}

const SQUAD_SIMULATOR_SECTION = {
  title: 'סימולטור',
  items: [
    {
      label: 'בניית סגל',
      path: '/squad-simulator',
      iconId: 'teams',
      disabled: false,
    },
  ],
}

const FULL_NAV_SECTIONS = [
  {
    title: 'שליטה',
    items: [
      { label: 'שולחן עבודה אישי', path: '/home', iconId: 'workspace' },
      { label: 'מרכז שליטה', path: '/hub', iconId: 'dashboard' },
    ],
  },
  {
    title: 'ניהול',
    items: [
      { label: 'וידאו', path: '/video', iconId: 'video', disabled: false },
      { label: 'מאגר שחקנים', path: '/players-database', iconId: 'playersDatabase', disabled: false },
      { label: 'תשלומים', path: '/payments', iconId: 'payments', disabled: true },
      { label: 'ניהול יומנים', path: '/calendar', iconId: 'meetings', disabled: false },
      { label: 'ניהול תגים', path: '/tags', iconId: 'tags', disabled: false },
    ],
  },
  {
    title: 'מתודולוגיה',
    items: [
      { label: 'מודל חישוב יכולות', path: '/abilities/explainer', iconId: 'abilities', disabled: false },
      { label: 'סימולטור בניית סגל', path: '/squad-simulator', iconId: 'squadSimulator', disabled: false },
    ],
  },
  {
    title: 'מערכת ופיתוח',
    collapsible: true,
    items: [
      { label: 'ניטור שימוש', path: '/admin/firestore-usage', iconId: 'firestoreUsage', disabled: false },
      { label: 'בדיקת דוחות', path: '/dev/reports', iconId: 'insights', disabled: false },
    ],
  },
]

export default function SideNav({
  onNavigate,
  badges,
  collapsed = false,
  navMode = 'full',
}) {
  const navigate = useNavigate()
  const location = useLocation()

  const isSystemRoute =
    location.pathname.startsWith('/admin/') ||
    location.pathname.startsWith('/dev/')

  const [systemOpen, setSystemOpen] = useState(isSystemRoute)

  const sections = useMemo(() => {
    if (navMode === 'squadSimulator') return [SQUAD_SIMULATOR_SECTION]

    return FULL_NAV_SECTIONS.map(section => ({
      ...section,
      items: section.items.map(item => ({
        ...item,
        badge: item.badgeKey ? badges?.[item.badgeKey] : undefined,
      })),
    }))
  }, [badges, navMode])

  const handleNavigate = (path, disabled) => {
    if (disabled) return

    navigate(path)
    onNavigate?.()
  }

  return (
    <Box className="dpScrollThin" sx={sx.root}>
      {sections.map((section, index) => {
        if (section.collapsible) {
          return (
            <Box key={section.title}>
              <CollapsibleSection
                section={section}
                open={systemOpen}
                collapsed={collapsed}
                pathname={location.pathname}
                onToggle={() => setSystemOpen(current => !current)}
                onNavigate={handleNavigate}
              />

              {index < sections.length - 1 && !collapsed ? (
                <Divider sx={sx.divider} />
              ) : null}
            </Box>
          )
        }

        return (
          <Box key={section.title} sx={sx.section}>
            <SectionTitle collapsed={collapsed}>
              {section.title}
            </SectionTitle>

            <List sx={{ py: 0 }}>
              {section.items.map(item => (
                <NavItem
                  key={item.path}
                  item={item}
                  collapsed={collapsed}
                  active={isItemActive(location.pathname, item.path)}
                  onClick={() => handleNavigate(item.path, item.disabled)}
                />
              ))}
            </List>

            {index < sections.length - 1 && !collapsed ? (
              <Divider sx={sx.divider} />
            ) : null}
          </Box>
        )
      })}
    </Box>
  )
}
