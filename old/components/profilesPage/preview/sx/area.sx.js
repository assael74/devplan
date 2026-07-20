// features/playersDatabase/components/profilesPage/preview/sx/area.sx.js

import { alpha } from '@mui/material/styles'

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

const palette = {
  panel: '#ffffff',
  line: alpha(devPlanColors.primaryDark, 0.12),
}

export const areaSx = {
  root: {
    minHeight: 0,
    overflow: 'hidden',
    bgcolor: palette.panel,
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
  },

  toolbarWrap: {
    flex: '0 0 auto',
    position: 'sticky',
    top: 0,
    zIndex: 4,
    backgroundColor: palette.panel,
  },

  content: {
    minHeight: 0,
    flex: '1 1 auto',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 0.7,
    py: 1,
    pl: 1,
    pr: 0.2,
    backgroundColor: 'background.level1'
  },

  clearedState: {
    minHeight: 260,
    flex: '1 1 auto',
  },
}
