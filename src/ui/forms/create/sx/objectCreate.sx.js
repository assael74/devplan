// ui/forms/create/objectCreate.sx.js

import { getEntityColors } from '../../../core/theme/Colors'

export function buildCreateModalSx(entityType, domainColor) {
  const c = getEntityColors(entityType)

  return {
    drawerSx: {
      bgcolor: 'transparent',
      p: { xs: 0, sm: 1.5, md: 3 },
      boxShadow: 'none',
      top: 50,
      height: 'calc(80vh - 90px)',
      overflow: 'hidden',
    },

    drawerSheet: {
      borderRadius: { xs: '16px 16px 0 0', sm: 'md' },
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      height: '100%',
      minWidth: 0,
      boxSizing: 'border-box',
      overflow: 'hidden',
      width: { xs: '100%', sm: 560, md: 540 },
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
      boxShadow: 'sm',
      borderRadius: { xs: '16px 16px 0 0', sm: 'sm' },
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
      borderColor: c.accent,
    },

    confirmButtonSx: {
      bgcolor: c.bg,
      color: c.text,
      transition: 'filter .15s ease, transform .12s ease',

      '&:hover': {
        bgcolor: c.bg,
        color: c.text,
        filter: 'brightness(0.96)',
        transform: 'translateY(-1px)',
      },

      '&.Mui-disabled': {
        opacity: 0.55,
      },
    },
  }
}
