// ui/actions/GenericFabMenu.sx.js

import { getEntityColors } from '../core/theme/Colors'

const getSectionColor = (key) => {
  try {
    return key ? getEntityColors(key) : null
  } catch {
    return null
  }
}

export const sxFabMenu = {
  trigger: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },

  fab: (open, palette) => ({
    p: 0,
    m: 0,
    width: 56,
    height: 56,
    borderRadius: 999,
    border: 0,
    bgcolor: palette?.accent || palette?.bg || 'primary.solidBg',
    boxShadow: open ? 'xl' : 'lg',
    transition: 'all 160ms ease',
    '& svg': {
      color: '#fff',
      transition: 'transform 160ms ease',
      fill: 'currentColor',
      fontSize: 30
    },
    '&:hover': {
      bgcolor: palette?.accent || palette?.hover || palette?.bg || 'primary.solidHoverBg',
      transform: 'scale(1.05)',
      boxShadow: 'xl',
    },
    '&:active': { transform: 'scale(0.98)' },
  }),

  label: (palette) => ({
    px: 1,
    py: 0.5,
    borderRadius: 999,
    border: '1px solid',
    borderColor: palette?.accent || palette?.bg || 'divider',
    bgcolor: 'background.surface',
    boxShadow: 'sm',
  }),

  menu: {
    minWidth: 230,
    borderRadius: 'lg',
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'lg',
    p: 0.5,
    '--ListItem-radius': '10px',
    '--ListItemDecorator-size': '28px',
  },

  menuItem: (c) => ({
    borderRadius: '10px',
    px: 1.25,
    py: 0.75,
    bgcolor: 'transparent',
    '&:hover': {
      bgcolor: c?.hover || 'neutral.softHoverBg',
    },
    '&.Mui-disabled': { opacity: 0.55 },
  }),

  divider: {
    my: 0.4,
  },

  section: {
    px: 1,
    pt: 0.4,
    pb: 0.15,
  },

  sectionLabel: (colorKey) => {
    const c = getSectionColor(colorKey)

    return {
      fontWeight: 700,
      letterSpacing: '0.02em',
      color: c?.accent || 'text.tertiary',
      opacity: 0.9,
    }
  },
}
