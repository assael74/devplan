// src/ui/domains/roles/ui/roles.sx.js

import { alpha } from '@mui/material/styles'
import { devPlanColors, getEntityColors } from '../../../core/theme/Colors.js'

const c = getEntityColors('roles')

export const rolesSx = {
  card: (compact = false) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: compact ? 0.75 : 1.25,
    minWidth: 0,
    minHeight: 0,
    height: compact ? 200 : '100%',
    p: compact ? 0.75 : 1.25,
    borderRadius: 'md',
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: compact ? 'divider' : devPlanColors.border,
    boxShadow: compact ? 'none' : `0 8px 20px ${alpha(devPlanColors.primaryDark, 0.05)}`,
    overflow: 'hidden',
  }),

  toolbar: (compact = false) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: compact ? 0.75 : 1,
    p: 0,
    borderRadius: 'md',
    bgcolor: 'transparent',
    border: 'none',
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
    bgcolor: 'background.level1',
    color: 'text.secondary',
    boxShadow: 'inset 0 0 0 1px var(--joy-palette-divider)',
  }),

  toolbarText: {
    minWidth: 0,
    flex: 1,
  },

  title: (compact = false) => ({
    color: 'text.primary',
    whiteSpace: 'nowrap',
    fontWeight: 600,
    fontSize: compact ? 14 : undefined,
    lineHeight: compact ? 1.1 : undefined,
  }),

  subtitle: (compact = false) => ({
    color: 'text.tertiary',
    whiteSpace: 'nowrap',
    fontSize: compact ? 11 : undefined,
    mt: 0.15,
  }),

  countChip: (compact = false) => ({
    height: compact ? 22 : undefined,
    px: compact ? 0.7 : undefined,
    fontSize: compact ? 11 : undefined,
    bgcolor: 'background.level1',
    color: 'text.secondary',
    fontWeight: 700,
    border: '1px solid',
    borderColor: 'divider',
  }),

  summary: (pageMode = false) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexWrap: 'wrap',
    px: pageMode ? 0.25 : 0,
  }),

  filters: (pageMode = false) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: 0.75,
    p: pageMode ? 0.75 : 0,
    borderRadius: pageMode ? 'md' : 0,
    bgcolor: pageMode ? 'background.level1' : 'transparent',
    border: pageMode ? '1px solid' : 'none',
    borderColor: 'divider',
  }),

  filtersRow: {
    display: 'flex',
    gap: 0.75,
    flexWrap: 'wrap',
    alignItems: 'center',
    minWidth: 0,
  },

  searchInput: {
    minWidth: 260,
    flex: 1,
    bgcolor: 'background.surface',
  },

  filterSelect: width => ({
    minWidth: width,
    bgcolor: 'background.surface',
    flexShrink: 0,
  }),

  resultChip: {
    flexShrink: 0,
    fontWeight: 700,
    border: '1px solid',
    borderColor: 'divider',
  },

  addBtn: (compact = false) => ({
    minHeight: compact ? 28 : 25,
    height: compact ? 28 : undefined,
    borderRadius: compact ? 7 : 8,
    px: compact ? 0.9 : 1.1,
    fontSize: compact ? 11 : 10,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    bgcolor: devPlanColors.primary,
    color: '#fff',
    '&:hover': {
      bgcolor: devPlanColors.primaryDark,
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

  list: (compact = false, pageMode = false) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: compact ? 0.45 : pageMode ? 0.65 : 0.75,
    minWidth: 0,
    borderRadius: 'md',
  }),

  row: (compact = false, pageMode = false, selected = false) => ({
    position: 'relative',
    display: pageMode && !compact ? 'grid' : 'flex',
    gridTemplateColumns: pageMode && !compact
      ? {
          xs: 'minmax(0, 1fr) auto',
          lg: 'minmax(240px, 1.2fr) minmax(220px, .9fr) minmax(280px, 1.15fr) auto',
        }
      : undefined,
    alignItems: 'center',
    gap: compact ? 0.65 : pageMode ? 1.1 : 1,
    minWidth: 0,
    p: compact ? 0.65 : pageMode ? 0.85 : 1,
    pr: compact ? 0.85 : 1,
    borderRadius: compact ? 10 : 'md',
    bgcolor: selected ? devPlanColors.tertiaryLight : '#FFFFFF',
    border: '1px solid',
    borderColor: selected ? devPlanColors.tertiary : pageMode ? devPlanColors.border : 'divider',
    transition: 'background-color .18s ease, border-color .18s ease, box-shadow .18s ease',
    boxShadow: compact ? 'none' : `0 3px 10px ${alpha(devPlanColors.primaryDark, 0.045)}`,
    '&:hover': {
      bgcolor: selected ? devPlanColors.tertiaryLight : devPlanColors.tertiaryLight,
      borderColor: selected ? devPlanColors.tertiary : devPlanColors.border,
      boxShadow: compact ? 'none' : `0 6px 16px ${alpha(devPlanColors.primaryDark, 0.08)}`,
    },
    ...(pageMode && !compact
      ? {
          '& > :nth-of-type(1)': {
            gridColumn: { xs: '1 / 2', lg: 'auto' },
          },
          '& > :nth-of-type(2)': {
            gridColumn: { xs: '1 / -1', lg: 'auto' },
          },
          '& > :nth-of-type(3)': {
            gridColumn: { xs: '1 / -1', lg: 'auto' },
          },
          '& > :nth-of-type(4)': {
            gridColumn: { xs: '2 / 3', lg: 'auto' },
            gridRow: { xs: '1', lg: 'auto' },
          },
        }
      : {}),
  }),

  identityCell: (compact = false) => ({
    display: 'flex',
    alignItems: 'center',
    gap: compact ? 0.65 : 0.85,
    minWidth: 0,
    overflow: 'hidden',
  }),

  identityText: {
    display: 'grid',
    gap: 0.35,
    minWidth: 0,
    justifyItems: 'start',
  },

  avatar: (compact = false) => ({
    width: compact ? 34 : 42,
    height: compact ? 34 : 42,
    borderRadius: '50%',
    flexShrink: 0,
    boxShadow: '0 0 0 2px var(--joy-palette-background-level1)',
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
    fontWeight: 700,
    color: 'text.primary',
    minWidth: 0,
    fontSize: compact ? 13 : undefined,
    lineHeight: compact ? 1.1 : undefined,
  }),

  roleChip: (compact = false) => ({
    maxWidth: '100%',
    height: compact ? 20 : undefined,
    px: compact ? 0.5 : undefined,
    fontSize: compact ? 10 : undefined,
    bgcolor: 'background.level1',
    color: devPlanColors.secondary,
    border: '1px solid',
    borderColor: 'divider',
    fontWeight: 600,
  }),

  contactRow: (compact = false) => ({
    display: 'flex',
    alignItems: 'center',
    gap: compact ? 0.75 : 1.25,
    flexWrap: 'wrap',
    color: 'text.tertiary',
  }),

  contactCell: (compact = false) => ({
    display: 'flex',
    alignItems: compact ? 'center' : 'flex-start',
    justifyContent: 'center',
    flexDirection: compact ? 'row' : 'column',
    gap: compact ? 0.75 : 0.35,
    minWidth: 0,
    overflow: 'hidden',
    color: devPlanColors.secondary,
  }),

  contactItem: (compact = false) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: compact ? 0.35 : 0.45,
    minWidth: 0,
  }),

  contactText: (compact = false) => ({
    color: devPlanColors.secondary,
    fontSize: compact ? 11 : 12.5,
    direction: 'ltr',
  }),

  assignmentCell: {
    display: 'grid',
    gap: 0.25,
    minWidth: 0,
    overflow: 'hidden',
  },

  assignmentLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.45,
    minWidth: 0,
    color: devPlanColors.secondary,
  },

  assignmentText: {
    color: devPlanColors.secondary,
    fontWeight: 600,
    minWidth: 0,
  },

  assignmentMoreChip: {
    justifySelf: 'start',
    minHeight: 20,
    fontSize: 11,
    fontWeight: 700,
    border: '1px solid',
    borderColor: 'divider',
  },

  statusChip: {
    justifySelf: 'start',
    minHeight: 22,
    fontWeight: 700,
    border: '1px solid',
    borderColor: 'divider',
  },

  actions: (compact = false) => ({
    display: 'flex',
    alignItems: 'center',
    gap: compact ? 0.25 : 0.5,
    flexShrink: 0,
    pl: compact ? 0.15 : 0.5,
  }),

  actionBtn: {
    color: devPlanColors.secondary,
    '&:hover': {
      color: devPlanColors.tertiary,
      bgcolor: 'transparent',
    },
  },

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
    bgcolor: 'background.level1',
    border: '1px dashed',
    borderColor: 'divider',
    color: 'text.tertiary',
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
