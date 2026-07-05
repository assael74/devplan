// features/playersDatabase/components/profilesPage/sx/page.sx.js

import { alpha } from '@mui/material/styles'

import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'

const palette = {
  bg: alpha(devPlanColors.primaryLight, 0.28),
  panel: '#ffffff',
  line: alpha(devPlanColors.primaryDark, 0.12),
  muted: alpha(devPlanColors.primaryDark, 0.68),
  headerStart: alpha(devPlanColors.primaryDark, 0.98),
  headerMid: alpha('#223a4f', 0.96),
  headerEnd: alpha(devPlanColors.primary, 0.94),
  headerText: '#ffffff',
  headerTextSoft: alpha('#ffffff', 0.78),
}

export const pageSx = {
  root: {
    minHeight: 'calc(100vh - 72px)',
    height: {
      xs: 'auto',
      xl: 'calc(100vh - 72px)',
    },
    p: {
      xs: 1,
      md: 0.5,
    },
    overflow: {
      xs: 'visible',
      xl: 'hidden',
    },
    borderRadius: 'sm',
  },

  shell: {
    height: '100%',
    minHeight: 0,
    bgcolor: palette.panel,
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    boxShadow: `0 12px 32px ${alpha(devPlanColors.primaryDark, 0.07)}`,
    overflow: 'hidden',
    display: 'grid',
    gridTemplateRows: 'auto auto minmax(0, 1fr)',
  },

  header: {
    px: 1.25,
    py: 1,
    borderBottom: `1px solid ${alpha('#ffffff', 0.08)}`,
    backgroundImage: `linear-gradient(90deg, ${palette.headerStart} 0%, ${palette.headerMid} 54%, ${palette.headerEnd} 100%)`,
    color: palette.headerText,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 1,
  },

  headerActions: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: {
      xs: 'flex-start',
      lg: 'flex-end',
    },
    gap: 0.75,
    '& button': {
      minHeight: 34,
      borderRadius: '8px',
      fontWeight: 700,
      backgroundColor: alpha('#ffffff', 0.1),
      color: palette.headerText,
      border: `1px solid ${alpha('#ffffff', 0.12)}`,
      boxShadow: 'none',
      '&:hover': {
        backgroundColor: alpha('#ffffff', 0.18),
      },
    },
  },

  title: {
    fontWeight: 700,
    color: palette.headerText,
  },

  meta: {
    color: palette.headerTextSoft,
    mt: 0.25,
  },

  kpis: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
  },

  kpiChip: {
    bgcolor: alpha('#ffffff', 0.12),
    color: palette.headerText,
    border: `1px solid ${alpha('#ffffff', 0.12)}`,
    fontWeight: 700,
    '& .MuiChip-label': {
      color: 'inherit',
    },
  },

  headerButton: {
    bgcolor: alpha('#ffffff', 0.12),
    color: palette.headerText,
    border: `1px solid ${alpha('#ffffff', 0.12)}`,
    boxShadow: 'none',
    '&:hover': {
      bgcolor: alpha('#ffffff', 0.2),
    },
  },

  body: {
    minHeight: 0,
    overflow: 'hidden',
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      xl: 'minmax(0, 1fr) 360px',
    },
    gap: 0.75,
    p: 0.75,
    bgcolor: palette.bg,
  },
}
