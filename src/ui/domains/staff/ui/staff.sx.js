// C:\projects\devplan\src\ui\domains\staff\ui\staff.sx.js

import { alpha } from '@mui/material/styles'
import { getEntityColors } from '../../../core/theme/Colors.js'

const c = getEntityColors('roles')

export const staffSx = {
  card: (compact = false) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: compact ? 0.75 : 1.25,
    minWidth: 0,
    minHeight: 0,
    height: compact ? 200 : '100%',
    p: compact ? 0.75 : 1.25,
    borderRadius: compact ? 'md' : 'lg',
    bgcolor: c.bg,
    border: '1px solid',
    borderColor: alpha(c.accent, 0.16),
    boxShadow: 'sm',
    overflow: 'hidden',
  }),

  toolbar: (compact = false) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: compact ? 0.75 : 1,
    p: compact ? 0.65 : 1,
    borderRadius: 'md',
    bgcolor: alpha(c.surface, 0.82),
    border: '1px solid',
    borderColor: alpha(c.accent, 0.12),
    backdropFilter: 'blur(6px)',
    flexShrink: 0,
  }),

  toolbarInfo: (compact = false) => ({
    display: 'flex',
    alignItems: 'center',
    gap: compact ? 0.65 : 1,
    minWidth: 0,
    flex: 1,
  }),

  toolbarIconBox: (compact = false) => ({
    width: compact ? 30 : 36,
    height: compact ? 30 : 36,
    minWidth: compact ? 30 : 36,
    borderRadius: compact ? 10 : 12,
    display: 'grid',
    placeItems: 'center',
    bgcolor: alpha(c.accent, 0.12),
    color: c.accent,
    boxShadow: `inset 0 0 0 1px ${alpha(c.accent, 0.12)}`,
  }),

  toolbarText: {
    minWidth: 0,
    flex: 1,
  },

  title: (compact = false) => ({
    color: c.text,
    whiteSpace: 'nowrap',
    fontWeight: 600,
    fontSize: compact ? 14 : undefined,
    lineHeight: compact ? 1.1 : undefined,
  }),

  subtitle: (compact = false) => ({
    color: alpha(c.text, 0.72),
    whiteSpace: 'nowrap',
    fontSize: compact ? 11 : undefined,
    mt: 0.15,
  }),

  countChip: (compact = false) => ({
    height: compact ? 22 : undefined,
    px: compact ? 0.7 : undefined,
    fontSize: compact ? 11 : undefined,
    bgcolor: alpha(c.accent, 0.12),
    color: c.accent,
    fontWeight: 700,
    border: '1px solid',
    borderColor: alpha(c.accent, 0.16),
  }),

  addBtn: (compact = false) => ({
    minHeight: compact ? 28 : 25,
    height: compact ? 28 : undefined,
    borderRadius: compact ? 7 : 8,
    px: compact ? 0.9 : 1.1,
    fontSize: compact ? 11 : 10,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    bgcolor: c.accent,
    color: '#fff',
    '&:hover': {
      bgcolor: c.accent,
      filter: 'brightness(0.96)',
    },
    '&:disabled': {
      opacity: 0.45,
    },
  }),

  listShell: (compact = false) => ({
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
    px: compact ? 0 : 0.25,
    pb: compact ? 0 : 0.25,
    borderRadius: 'md',
    bgcolor: 'transparent',
  }),

  list: (compact = false) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: compact ? 0.45 : 0.75,
    minWidth: 0,
    borderRadius: 'md',
  }),

  row: (compact = false) => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: compact ? 0.65 : 1,
    minWidth: 0,
    p: compact ? 0.65 : 1,
    pr: compact ? 0.85 : 1,
    borderRadius: compact ? 10 : 'md',
    bgcolor: alpha(c.surface, 0.92),
    border: '1px solid',
    borderColor: alpha(c.accent, 0.08),
    transition: 'all .18s ease',
    boxShadow: `0 2px 10px ${alpha(c.accent, 0.04)}`,
    '&::before': {
      content: '""',
      position: 'absolute',
      right: 0,
      top: compact ? 6 : 8,
      bottom: compact ? 6 : 8,
      width: compact ? 3 : 4,
      borderRadius: 999,
      bgcolor: alpha(c.accent, 0.7),
    },
    '&:hover': {
      transform: compact ? 'none' : 'translateY(-1px)',
      boxShadow: compact
        ? `0 4px 10px ${alpha(c.accent, 0.06)}`
        : `0 8px 18px ${alpha(c.accent, 0.08)}`,
      borderColor: alpha(c.accent, 0.16),
    },
  }),

  avatar: (compact = false) => ({
    width: compact ? 34 : 42,
    height: compact ? 34 : 42,
    borderRadius: '50%',
    flexShrink: 0,
    boxShadow: `0 0 0 2px ${alpha(c.accent, 0.08)}`,
  }),

  rowMain: (compact = false) => ({
    minWidth: 0,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: compact ? 0.2 : 0.45,
  }),

  nameRow: (compact = false) => ({
    display: 'flex',
    alignItems: 'center',
    gap: compact ? 0.5 : 0.75,
    minWidth: 0,
    flexWrap: 'wrap',
  }),

  name: (compact = false) => ({
    fontWeight: 600,
    color: c.text,
    minWidth: 0,
    fontSize: compact ? 13 : undefined,
    lineHeight: compact ? 1.1 : undefined,
  }),

  roleChip: (compact = false) => ({
    maxWidth: '100%',
    height: compact ? 20 : undefined,
    px: compact ? 0.5 : undefined,
    fontSize: compact ? 10 : undefined,
    bgcolor: alpha(c.accent, 0.12),
    color: c.accent,
    border: '1px solid',
    borderColor: alpha(c.accent, 0.14),
    fontWeight: 600,
  }),

  contactRow: (compact = false) => ({
    display: 'flex',
    alignItems: 'center',
    gap: compact ? 0.75 : 1.25,
    flexWrap: 'wrap',
    color: alpha(c.text, 0.74),
  }),

  contactItem: (compact = false) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: compact ? 0.35 : 0.45,
    minWidth: 0,
  }),

  contactText: (compact = false) => ({
    color: alpha(c.text, 0.74),
    fontSize: compact ? 11 : 12,
    direction: 'ltr',
  }),

  actions: (compact = false) => ({
    display: 'flex',
    alignItems: 'center',
    gap: compact ? 0.25 : 0.5,
    flexShrink: 0,
    pl: compact ? 0.15 : 0.5,
  }),

  removeBtn: (compact = false) => ({
    width: compact ? 28 : undefined,
    height: compact ? 28 : undefined,
    borderRadius: compact ? 8 : 10,
    color: alpha(c.text, 0.72),
    '&:hover': {
      color: '#b42318',
      bgcolor: 'rgba(180, 35, 24, 0.08)',
    },
  }),

  empty: (compact = false) => ({
    minHeight: compact ? 84 : 132,
    display: 'grid',
    placeItems: 'center',
    textAlign: 'center',
    p: compact ? 1.25 : 2,
    borderRadius: 'md',
    bgcolor: alpha(c.surface, 0.8),
    border: '1px dashed',
    borderColor: alpha(c.accent, 0.2),
    color: alpha(c.text, 0.7),
  }),

  drawerContent: {
    bgcolor: 'transparent',
    p: { xs: 0, md: 1.5 },
    boxShadow: 'none',
    overflow: 'hidden',
  },

  drawerPanel: {
    width: 420,
    maxWidth: '100vw',
    height: '100%',
    p: 1.5,
    borderRadius: { xs: 0, md: 'md' },
    display: 'flex',
    flexDirection: 'column',
    gap: 1.25,
    overflow: 'hidden',
    boxSizing: 'border-box',
    bgcolor: c.surface,
    border: '1px solid',
    borderColor: alpha(c.accent, 0.12),
    boxShadow: `0 16px 40px ${alpha(c.accent, 0.12)}`,
  },

  modalTitleWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    minWidth: 0,
    px: 0.25,
    py: 0.25,
  },

  modalTitle: {
    fontWeight: 700,
    color: c.text,
  },

  modalSubTitle: {
    color: alpha(c.text, 0.7),
    mt: 0.25,
  },

  modalCountChip: {
    bgcolor: alpha(c.accent, 0.12),
    color: c.accent,
    border: '1px solid',
    borderColor: alpha(c.accent, 0.14),
    fontWeight: 700,
    flexShrink: 0,
  },

  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    minWidth: 0,
    minHeight: 0,
    flex: 1,
    overflow: 'hidden',
    px: 0,
    py: 0.5,
  },

  modalSearch: {
    minWidth: 0,
    flexShrink: 0,
  },

  modalList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.75,
    minWidth: 0,
    minHeight: 0,
    flex: 1,
    overflow: 'auto',
    overflowX: 'hidden',
    pr: 0.25,
  },

  modalRow: (selected = false) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
    p: 0.85,
    borderRadius: 12,
    cursor: 'pointer',
    bgcolor: selected ? alpha(c.accent, 0.10) : alpha(c.surface, 0.9),
    border: '1px solid',
    borderColor: selected ? alpha(c.accent, 0.22) : alpha(c.accent, 0.08),
    transition: 'all .16s ease',
    '&:hover': {
      bgcolor: alpha(c.accent, 0.08),
      borderColor: alpha(c.accent, 0.16),
    },
  }),

  modalAvatar: {
    width: 38,
    height: 38,
    flexShrink: 0,
    boxShadow: `0 0 0 2px ${alpha(c.accent, 0.08)}`,
  },

  modalRowMain: {
    minWidth: 0,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.25,
  },

  modalRowTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    minWidth: 0,
    flexWrap: 'wrap',
  },

  modalRowName: {
    fontWeight: 700,
    color: c.text,
    minWidth: 0,
  },

  modalRoleChip: {
    bgcolor: alpha(c.accent, 0.12),
    color: c.accent,
    border: '1px solid',
    borderColor: alpha(c.accent, 0.14),
    fontWeight: 700,
  },

  modalRowMeta: {
    color: alpha(c.text, 0.72),
  },

  modalRowCheck: {
    width: 20,
    minWidth: 20,
    display: 'grid',
    placeItems: 'center',
    color: c.accent,
  },

  modalEmpty: {
    minHeight: 120,
    display: 'grid',
    placeItems: 'center',
    textAlign: 'center',
    color: alpha(c.text, 0.68),
    border: '1px dashed',
    borderColor: alpha(c.accent, 0.18),
    borderRadius: 12,
    bgcolor: alpha(c.surface, 0.75),
    px: 2,
    py: 3,
  },

  modalActions: {
    px: 0,
    pt: 1,
    pb: 0,
    display: 'flex',
    justifyContent: 'space-between',
    gap: 1,
    flexShrink: 0,
  },

  closeBtn: {
    minWidth: 96,
  },

  conBtn: {
    bgcolor: c.bg,
    color: c.text,
    transition: 'all .15s ease',
    '&:hover': {
      bgcolor: c.bg,
      color: c.text,
      filter: 'brightness(0.94)',
      transform: 'translateY(-1px)',
    },
  },
}
