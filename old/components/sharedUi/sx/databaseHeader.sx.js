// features/playersDatabase/components/sharedUi/sx/databaseHeader.sx.js

import { alpha } from '@mui/material/styles'

import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'

const palette = {
  panel: '#ffffff',
  line: alpha(devPlanColors.primaryDark, 0.12),
  headerStart: alpha(devPlanColors.primaryDark, 0.98),
  headerMid: alpha('#223a4f', 0.96),
  headerEnd: alpha(devPlanColors.primary, 0.94),
  headerText: '#ffffff',
  headerTextSoft: alpha('#ffffff', 0.78),
}

export const databaseHeaderSx = {
  root: {
    px: 1.25,
    py: 0,
    borderBottom: `1px solid ${alpha('#ffffff', 0.08)}`,
    backgroundImage: `linear-gradient(90deg, ${palette.headerStart} 0%, ${palette.headerMid} 54%, ${palette.headerEnd} 100%)`,
    color: palette.headerText,
    display: 'grid',
    gridTemplateRows: 'auto auto',
    gap: 0.75,
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
  },

  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.15,
    minWidth: 0,
    flex: '1 1 auto',
  },

  eyebrow: {
    color: '#9edbd4',
    fontWeight: 700,
    letterSpacing: 0,
    fontSize: 11,
  },

  title: {
    color: palette.headerText,
    fontWeight: 700,
    fontSize: {
      xs: 20,
      md: 24,
    },
    lineHeight: 1.05,
  },

  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    flexWrap: 'wrap',
    minWidth: 0,
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

  kpiGrid: {
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'flex-end',
    gap: 0.4,
    minWidth: 0,
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': {
      width: 0,
      height: 0,
    },
  },

  kpi: {
    minHeight: 38,
    px: 0.8,
    py: 0.55,
    borderRadius: '7px',
    bgcolor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr)',
    gap: 0.65,
    alignItems: 'center',
  },

  kpiText: {
    minWidth: 0,
  },

  kpiLabel: {
    color: 'rgba(255, 255, 255, 0.76)',
    fontSize: 11,
    lineHeight: 1.1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  kpiValue: {
    color: '#fff',
    fontSize: {
      xs: 18,
      md: 20,
    },
    fontWeight: 700,
    lineHeight: 1,
  },

  kpiNote: {
    color: 'rgba(255, 255, 255, 0.54)',
    fontSize: 9.5,
    lineHeight: 1.05,
    mt: 0.1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}
