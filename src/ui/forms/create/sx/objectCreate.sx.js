// src/ui/forms/create/sx/objectCreate.sx.js

import { getEntityColors } from '../../../core/theme/Colors'

function resolveDrawerSize(size) {
  if (size === 'lg') return 'lg'
  if (size === 'md') return 'md'
  return 'sm'
}

function getDrawerHeight(size) {
  const normalized = resolveDrawerSize(size)

  if (normalized === 'lg') return '88dvh'
  if (normalized === 'md') return '74dvh'

  return '58dvh'
}

function getDrawerWidth(size) {
  const normalized = resolveDrawerSize(size)

  if (normalized === 'lg') {
    return {
      xs: '100%',
      sm: 680,
      md: 760,
    }
  }

  if (normalized === 'md') {
    return {
      xs: '100%',
      sm: 600,
      md: 660,
    }
  }

  return {
    xs: '100%',
    sm: 520,
    md: 560,
  }
}

export function buildCreateModalSx(entityType, domainColor, size = 'sm') {
  const c = getEntityColors(entityType)
  const drawerHeight = getDrawerHeight(size)
  const drawerWidth = getDrawerWidth(size)

  return {
    drawerSx: {
      bgcolor: 'transparent',
      p: { xs: 0, sm: 1.5, md: 3 },
      boxShadow: 'none',
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },

    drawerSheet: {
      borderRadius: { xs: '16px 16px 0 0', sm: 'md' },
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      height: drawerHeight,
      maxHeight: drawerHeight,
      minHeight: 0,
      minWidth: 0,
      boxSizing: 'border-box',
      overflow: 'hidden',
      width: drawerWidth,
      mx: 'auto',
      bgcolor: 'background.body',
      boxShadow: 'lg',
    },

    headerSx: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1,
      p: 1.5,
      borderBottom: '1px solid',
      borderColor: 'divider',
      flexShrink: 0,
    },

    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      minWidth: 0,
    },

    headerIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      display: 'grid',
      placeItems: 'center',
      bgcolor: domainColor || c.surface,
      color: c.text,
      border: '1px solid',
      borderColor: domainColor
        ? `color-mix(in srgb, ${domainColor} 28%, divider)`
        : 'divider',
      flexShrink: 0,

      '& svg': {
        fill: 'currentColor',
        color: 'currentColor',
      },

      '& svg *': {
        fill: 'currentColor',
        stroke: 'currentColor',
      },

      '& svg [fill="none"]': {
        fill: 'none',
      },
    },

    title: {
      fontWeight: 700,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },

    dialogContentSx: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      p: 0,
      gap: 0,
    },

    content: {
      display: 'grid',
      gap: 1.25,
      p: 2,
      px: { xs: 2, sm: 3 },
      overflowY: 'auto',
      minHeight: 0,
      flex: 1,
    },

    footerSx: {
      pt: 1,
      mt: 'auto',
      px: 2,
      pb: 1,
      borderTop: '1px solid',
      borderColor: 'divider',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1,
      flexWrap: 'wrap',
      flexShrink: 0,
    },

    footerActionsSx: {
      display: 'flex',
      alignItems: 'center',
      gap: 0.75,
      flexWrap: 'wrap',
    },

    icoRes: {
      height: 36,
      width: 36,
      flexShrink: 0,
      border: '1px solid',
      borderColor: 'divider',
    },

    confirmButtonSx: {
      bgcolor: c.accent,
      color: c.textAcc,
      transition: 'filter .15s ease, transform .12s ease',
      border: '1px solid',
      borderColor: 'divider',

      '&:hover': {
        bgcolor: c.accent,
        color: c.textAcc,
        filter: 'brightness(0.96)',
        transform: 'translateY(-1px)',
      },

      '&.Mui-disabled': {
        opacity: 0.55,
      },
    },
  }
}
