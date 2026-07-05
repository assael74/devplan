// features/playersDatabase/components/profilesPage/preview/toolbar/toolbar.sx.js

import { alpha } from '@mui/material/styles'

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

const palette = {
  line: '#d8e0e7',
  muted: '#64717f',
}

export const previewToolbarSx = {
  root: {
    px: 1,
    pb: 0.75,
    pt: 0.35,
    border: `1px solid ${palette.line}`,
    borderTop: `2px solid ${alpha(devPlanColors.secondary, 0.92)}`,
    borderRight: `1px solid ${alpha(devPlanColors.secondary, 0.92)}`,
    borderRadius: '12px',
    bgcolor: '#f4f8fb',
    display: 'flex',
    flexDirection: 'column',
    gap: 0.35,
    minHeight: 90,
    maxHeight: 90,
    height: 90,
    boxShadow: `0 12px 26px rgba(12, 24, 36, 0.16)`,
  },

  textBlock: {
    flex: '1 1 auto',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.2,
    overflow: 'hidden',
  },

  headerRow: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    overflow: 'hidden',
  },

  badge: {
    flex: '0 0 auto',
    borderRadius: '999px',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },

  title: {
    minWidth: 0,
    fontWeight: 600,
    color: '#17202a',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  stageTitle: {
    minWidth: 0,
    fontWeight: 600,
    fontSize: 15,
    color: '#17202a',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  subtitle: {
    color: palette.muted,
    fontWeight: 600,
    fontSize: 12,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginTop: 'auto',
  },

  subtitleInitial: {
    color: '#c62828',
    fontWeight: 600,
    fontSize: 12,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginTop: 'auto',
  },
}
