// ui/actions/QuickCreateMenu.js
import React, { useMemo, useState } from 'react'
import Dropdown from '@mui/joy/Dropdown'
import Menu from '@mui/joy/Menu'
import MenuButton from '@mui/joy/MenuButton'
import MenuItem from '@mui/joy/MenuItem'
import ListItemDecorator from '@mui/joy/ListItemDecorator'
import Tooltip from '@mui/joy/Tooltip'
import IconButton from '@mui/joy/IconButton'
import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'

import AddRounded from '@mui/icons-material/AddRounded'

import { buildVideoAnalysisSeed } from './videoAnalysis.seed'

import { iconUi } from '../core/icons/iconUi.js'
import { useCreateModal } from '../forms/create/CreateModalProvider'
import { getCreateMeta, resolveCreateIcon } from '../forms/create/createRegistry'
import { getEntityColors } from '../core/theme/Colors'

const CREATE_ACTIONS_BY_ENTITY = {
  player: ({ isProject }) => {
    const actions = [
      { type: 'meeting', label: 'פגישה חדשה', iconKey: 'meeting' },
      { type: 'abilities', label: 'טופס יכולות חדש', iconKey: 'abilities' },
      { type: 'videoAnalysis', label: 'טופס יצירת וידאו', iconKey: 'addVideo' },
    ]

    if (isProject) {
      actions.push({ type: 'payment', label: 'תשלום חדש', iconKey: 'payment' })
    }

    return actions
  },

  team: () => [
    { type: 'meeting', label: 'פגישה קבוצתית', iconKey: 'meeting' },
    { type: 'abilities', label: 'טופס יכולות שחקן', iconKey: 'abilities' },
    { type: 'player', label: 'שחקן חדש', iconKey: 'player' },
  ],

  club: () => [
    { type: 'meeting', label: 'פגישה', iconKey: 'meeting' },
    { type: 'team', label: 'קבוצה חדשה', iconKey: 'team' },
  ],

  role: () => [
    { type: 'role', label: 'איש צוות חדש', iconKey: 'roles' },
  ],

  scout: () => [
    { type: 'scoutPerform', label: 'הוספת משחק לשחקן במעקב', iconKey: 'scouting' },
  ],
}

export default function QuickCreateMenu({
  isProject = false,
  seed = {},
  context,
  allowCreate = true,
  disabled = false,
  tooltip = 'יצירה מהירה',
  iconOnly = false,
  label = 'הוספה',
  entityType = 'player',
  entityColor,
  onAfterCreateClick,
}) {
  const { openCreate } = useCreateModal()
  const [open, setOpen] = useState(false)

  const items = useMemo(() => {
    const factory = CREATE_ACTIONS_BY_ENTITY[entityType]
    if (!factory) return []

    const raw = factory({ isProject })

    return raw.map((it) => ({
      ...it,
      icon: resolveCreateIcon(getCreateMeta(it.type)?.iconKey || it.iconKey),
    }))
  }, [entityType, isProject])

  const canOpen = allowCreate !== false && !disabled

  const ec = getEntityColors(entityType)
  const accent = entityColor || ec?.accent || '#2563EB'
  const bg = ec?.bg || 'transparent'
  const text = ec?.text || '#111827'

  const Arrow = (
    <Box
      sx={{
        display: 'inline-flex',
        transition: 'transform 160ms ease',
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
      }}
    >
      {iconUi({ id: 'arrowDown', size: 'sm' })}
    </Box>
  )

  const handleToggle = (e) => {
    if (!canOpen) return
    e?.preventDefault?.()
    setOpen((v) => !v)
  }

  const handleClose = () => setOpen(false)

  const handlePick = (type) => {
    if (!canOpen) return
    const baseSeed = seed || {}
    const finalSeed = type === 'videoAnalysis' ? buildVideoAnalysisSeed(baseSeed, entityType) : baseSeed

    if (context) {
      openCreate(type, finalSeed, context)
    } else {
      openCreate(type, finalSeed)
    }

    if (typeof onAfterCreateClick === 'function') {
      onAfterCreateClick(type)
    }

    setOpen(false)
  }

  return (
    <Dropdown open={open} onClose={handleClose}>
      {iconOnly ? (
        <Tooltip title={tooltip} variant="soft" disableInteractive>
          <MenuButton
            size="sm"
            variant="plain"
            disabled={!canOpen}
            onClick={handleToggle}
            sx={{
              marginInlineStart: 'auto',
              p: 0,
              border: 0,
              bgcolor: 'transparent',
              '&:hover': { bgcolor: 'transparent' },
            }}
          >
            <IconButton
              size="sm"
              variant="soft"
              sx={{
                borderRadius: 12,
                bgcolor: bg,
                border: '1px solid',
                borderColor: 'divider',
                color: accent,
                boxShadow: 'sm',
              }}
            >
              <AddRounded />
            </IconButton>
          </MenuButton>
        </Tooltip>
      ) : (
        <MenuButton
          size="sm"
          variant="soft"
          onClick={handleToggle}
          startDecorator={<AddRounded />}
          endDecorator={Arrow}
          disabled={!canOpen}
          sx={{
            marginInlineStart: 'auto',
            flexShrink: 0,
            whiteSpace: 'nowrap',
            borderRadius: 12,
            px: 1.25,
            fontFamily: 'var(--joy-fontFamily-body)',
            fontSize: 'var(--joy-fontSize-sm)',
            lineHeight: 'var(--joy-lineHeight-sm)',
            letterSpacing: 'var(--joy-letterSpacing-sm)',
            fontWeight: 'var(--joy-fontWeight-lg)',
            bgcolor: bg,
            border: '1px solid',
            borderColor: 'divider',
            color: text,
            boxShadow: 'md',
            '& svg': { color: accent },
            '&:hover': { filter: 'brightness(0.98)' },
          }}
        >
          {label}
        </MenuButton>
      )}

      <Menu placement="bottom-end" size="sm" variant="outlined" sx={{ minWidth: 210 }}>
        {items.map((it) => (
          <MenuItem key={it.type} onClick={() => handlePick(it.type)}>
            <ListItemDecorator>{it.icon}</ListItemDecorator>
            {it.label}
          </MenuItem>
        ))}
      </Menu>
    </Dropdown>
  )
}
