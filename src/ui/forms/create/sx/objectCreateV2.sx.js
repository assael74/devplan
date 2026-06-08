// ui/forms/create/sx/objectCreateV2.sx.js

import { getEntityColors } from '../../../core/theme/Colors'

function resolveSize(size) {
  if (size === 'lg') return 'lg'
  if (size === 'md') return 'md'
  return 'sm'
}

function getModalWidth(size) {
  const normalized = resolveSize(size)

  if (normalized === 'lg') {
    return 'min(860px, calc(100vw - 32px))'
  }

  if (normalized === 'md') {
    return 'min(720px, calc(100vw - 32px))'
  }

  return 'min(580px, calc(100vw - 32px))'
}

function getModalHeight(size) {
  const normalized = resolveSize(size)

  if (normalized === 'lg') {
    return 'min(92dvh, 860px)'
  }

  if (normalized === 'md') {
    return 'min(78dvh, 720px)'
  }

  return 'min(68dvh, 620px)'
}

export function buildCreateModalV2Sx(entityType, domainColor, size = 'sm') {
  const c = getEntityColors(entityType)
  const width = getModalWidth(size)
  const maxHeight = getModalHeight(size)

  return {
    root: {
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: { xs: 1.5, sm: 2 },
    },

    motionWrap: {
      width,
      maxHeight,
      minHeight: 0,
      display: 'grid',
    },

    dialog: {
      position: 'relative',
      inset: 'auto',
      transform: 'none',
      m: 0,
      p: 0,
      width: '100%',
      maxWidth: '100%',
      maxHeight: 'inherit',
      minHeight: 0,
      overflow: 'hidden',
      borderRadius: { xs: 22, md: 28 },
      bgcolor: 'background.body',
      boxShadow: 'lg',
      display: 'grid',
      gridTemplateRows: 'auto minmax(0, 1fr) auto',
      gap: 0,
    },

    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1,
      p: 1.15,
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
      width: 36,
      height: 36,
      borderRadius: 12,
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

    titleWrap: {
      minWidth: 0,
      display: 'grid',
      gap: 0.15,
    },

    kicker: {
      color: 'text.tertiary',
      fontWeight: 700,
      lineHeight: 1.1,
    },

    title: {
      fontWeight: 700,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      lineHeight: 1.2,
    },

    dialogContent: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      p: 0,
      gap: 0,
    },

    content: {
      display: 'grid',
      gap: 0.9,
      p: 1.25,
      px: { xs: 1.25, sm: 1.75 },
      overflowY: 'auto',
      overflowX: 'hidden',
      minHeight: 0,
    },

    footer: {
      pt: 0.75,
      px: 1.5,
      pb: 0.75,
      borderTop: '1px solid',
      borderColor: 'divider',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1,
      flexWrap: 'wrap',
      flexShrink: 0,
    },

    footerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: 0.75,
      flexWrap: 'wrap',
    },

    resetButton: {
      height: 36,
      width: 36,
      flexShrink: 0,
      border: '1px solid',
      borderColor: 'divider',
    },

    confirmButton: {
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
