
import { alpha } from '@mui/system'
import { getEntityColors } from '../../../../../ui/core/theme/Colors.js'

const c = (entity) => getEntityColors(entity)

const borderSx = {
  border: '1px solid',
  borderColor: 'divider',
}

export const cardSx = {
  card: (hasTasks) => ({
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    p: 1.35,
    mt: 2,
    borderRadius: 18,
    bgcolor: hasTasks ? 'warning.softBg' : 'background.surface',
    borderColor: hasTasks ? 'warning.outlinedBorder' : 'divider',
    borderStyle: hasTasks ? 'solid' : 'dashed',
    boxShadow: 'md',
    transition: 'transform .14s ease, box-shadow .18s ease, border-color .18s ease',
    '&:active': {
      transform: 'scale(0.985)',
    },
    '&:before': {
      content: '""',
      position: 'absolute',
      insetInlineStart: 0,
      top: 0,
      bottom: 0,
      width: 5,
      bgcolor: '#6aa84f',
    },
  }),

  cardMob: (entity) => ({
    p: 0.5,
    px: 1,
    gap: 0.9,
    bgcolor: c(entity).bg,
    border: '1px solid',
    borderColor: 'divider',
    cursor: 'pointer',
    transition: 'box-shadow .18s ease, transform .14s ease, border-color .18s ease',
    '&:active': {
      transform: 'scale(0.985)',
    },
  }),

  cardAction: (entity) => ({
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    p: 1.35,
    borderRadius: 18,
    bgcolor: 'background.surface',
    borderColor: 'divider',
    boxShadow: 'md',
    transition: 'transform .14s ease, box-shadow .18s ease, border-color .18s ease',
    '&:active': {
      transform: 'scale(0.985)',
    },
    '&:before': {
      content: '""',
      position: 'absolute',
      insetInlineStart: 0,
      top: 0,
      bottom: 0,
      width: 5,
      bgcolor: c(entity).accent,
    },
  }),

  inProgressEntryCard: (hasTasks) => ({
    position: 'relative',
    minHeight: 124,
    overflow: 'hidden',
    cursor: 'pointer',
    p: 1.65,
    mt: 1.5,
    borderRadius: 22,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    border: '1px solid',
    borderColor: hasTasks ? 'warning.outlinedBorder' : 'divider',
    borderStyle: hasTasks ? 'solid' : 'dashed',
    bgcolor: hasTasks
      ? 'linear-gradient(135deg, rgba(255,193,7,0.18) 0%, rgba(255,255,255,0.94) 72%)'
      : 'background.surface',
    boxShadow: hasTasks
      ? '0 12px 28px rgba(217,119,6,0.14)'
      : '0 8px 18px rgba(15,23,42,0.06)',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    transition: 'transform .14s ease, box-shadow .18s ease, border-color .18s ease',

    '&:active': {
      transform: 'scale(0.985)',
    },

    '&:before': {
      content: '""',
      position: 'absolute',
      insetInlineStart: 0,
      top: 0,
      bottom: 0,
      width: 5,
      bgcolor: hasTasks ? '#6aa84f' : 'divider',
    },

    '&:after': {
      content: '""',
      position: 'absolute',
      insetInlineEnd: -32,
      top: -40,
      width: 112,
      height: 112,
      borderRadius: '50%',
      bgcolor: hasTasks ? 'rgba(106,168,79,0.12)' : 'rgba(15,23,42,0.035)',
    },
  }),

  inProgressTopRow: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 1.1,
    minWidth: 0,
  },

  inProgressIconWrap: (hasTasks) => ({
    width: 44,
    height: 44,
    borderRadius: 16,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    bgcolor: hasTasks ? '#6aa84f' : 'neutral.softBg',
    border: '1px solid',
    borderColor: hasTasks ? 'rgba(106,168,79,0.28)' : 'divider',
    boxShadow: hasTasks ? '0 8px 18px rgba(106,168,79,0.22)' : 'none',
  }),

  inProgressTitle: {
    fontWeight: 950,
    lineHeight: 1.1,
  },

  inProgressSubtitle: {
    mt: 0.35,
    color: 'text.secondary',
    fontSize: '0.8rem',
    lineHeight: 1.35,
  },

  inProgressArrowWrap: (hasTasks) => ({
    width: 32,
    height: 32,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    bgcolor: 'rgba(255,255,255,0.75)',
    color: hasTasks ? '#6aa84f' : 'text.secondary',
    boxShadow: '0 6px 14px rgba(15,23,42,0.08)',
  }),

  inProgressChipsRow: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.65,
    mt: 1.25,
  },

  inProgressChip: {
    height: 26,
    borderRadius: 999,
    fontSize: '0.75rem',
    fontWeight: 800,
    px: 1,
  },

  cardContent: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },

  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
  },

  icoEdit: (entity) => ({
    bgcolor: c(entity).accent,
    color: c(entity).textAcc,
    transition: 'filter .15s ease, transform .12s ease',
    mt: 0.5,

    '&:hover': {
      bgcolor: c(entity).accent,
      color: c(entity).textAcc,
      filter: 'brightness(0.96)',
      transform: 'translateY(-1px)',
    },
  }),

  chipsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.75,
    marginTop: 'auto',
  },

  chip: {
    '--Chip-minHeight': '22px',
    fontSize: '12px',
    fontWeight: 500,
    px: 0.75,
    borderRadius: '999px',
    ...borderSx,
  },

  chipProgres: {
    '--Chip-minHeight': '22px',
    fontSize: '12px',
    fontWeight: 500,
    px: 0.75,
    borderRadius: '999px',
    bgcolor: '#6fa8dc',
    ...borderSx,
  },

  typoChip: (color) => ({
    display: 'inline-flex',
    fontWeight: 700,
    color,
    ml: 0.5,
  }),

  linkButton: {
    p: 0,
    minHeight: 'unset',
    fontWeight: 600,
    fontSize: 12,
    textDecoration: 'none',
    transition: 'color 0.2s ease, opacity 0.2s ease, transform 0.2s ease',
    '&:hover': {
      textDecoration: 'underline',
      opacity: 0.9,
    },
  },

  iconWrap: (bgcolor) => ({
    width: 35,
    height: 35,
    borderRadius: '50%',
    display: 'grid',
    border: '1px solid',
    borderColor: 'divider',
    placeItems: 'center',
    bgcolor,
    flexShrink: 0,
  }),

  // ----- MOBILE ENTRY CARDS -----

  entryActionCard: (entity) => {
    const colors = c(entity)
    const accent = colors?.accent || '#3B82F6'
    const bg = colors?.bg || '#FFFFFF'

    return {
      position: 'relative',
      minHeight: 168,
      borderRadius: 24,
      overflow: 'hidden',
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      border: '1px solid',
      borderColor: alpha(accent, 0.22),
      bgcolor: `linear-gradient(135deg, ${alpha(accent, 0.14)} 0%, ${alpha(bg, 0.88)} 48%, rgba(255,255,255,0.96) 100%)`,
      boxShadow: `0 14px 32px ${alpha(accent, 0.14)}`,
      cursor: 'pointer',
      userSelect: 'none',
      WebkitTapHighlightColor: 'transparent',
      transition: 'transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease',

      '&:active': {
        transform: 'scale(0.985)',
        boxShadow: `0 8px 22px ${alpha(accent, 0.18)}`,
      },

      '&:before': {
        content: '""',
        position: 'absolute',
        insetInlineEnd: -30,
        top: -36,
        width: 128,
        height: 128,
        borderRadius: '50%',
        bgcolor: alpha(accent, 0.12),
      },

      '&:after': {
        content: '""',
        position: 'absolute',
        insetInlineStart: -40,
        bottom: -52,
        width: 150,
        height: 150,
        borderRadius: '50%',
        bgcolor: alpha(accent, 0.07),
      },
    }
  },

  entryCardContent: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 1.25,
  },

  entryTopRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
  },

  entryIconWrap: (entity) => {
    const colors = c(entity)
    const accent = colors?.accent || '#3B82F6'

    return {
      width: 48,
      height: 48,
      borderRadius: 17,
      display: 'grid',
      placeItems: 'center',
      bgcolor: alpha(accent, 0.15),
      color: accent,
      flexShrink: 0,
    }
  },

  entryArrowWrap: (entity) => {
    const colors = c(entity)
    const accent = colors?.accent || '#3B82F6'

    return {
      width: 34,
      height: 34,
      borderRadius: 999,
      display: 'grid',
      placeItems: 'center',
      bgcolor: 'rgba(255,255,255,0.7)',
      color: accent,
      boxShadow: '0 6px 16px rgba(15,23,42,0.08)',
      flexShrink: 0,
    }
  },

  entryTitle: {
    fontWeight: 900,
    fontSize: '1.05rem',
    lineHeight: 1.1,
  },

  entrySubtitle: {
    mt: 0.5,
    color: 'text.secondary',
    fontSize: '0.82rem',
    lineHeight: 1.45,
    maxWidth: 280,
  },

  entryMetricsRow: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexWrap: 'wrap',
    mt: 1,
  },

  entryMetricChip: (entity) => {
    const colors = c(entity)
    const accent = colors?.accent || '#3B82F6'

    return {
      height: 28,
      borderRadius: 999,
      px: 1.1,
      bgcolor: alpha(accent, 0.12),
      color: accent,
      fontWeight: 900,
      fontSize: '0.78rem',
      border: '1px solid',
      borderColor: alpha(accent, 0.18),
    }
  },

  entrySecondaryChip: {
    height: 28,
    borderRadius: 999,
    px: 1.1,
    bgcolor: 'rgba(255,255,255,0.72)',
    color: 'text.secondary',
    fontWeight: 700,
    fontSize: '0.76rem',
    border: '1px solid rgba(15,23,42,0.08)',
  },
}
