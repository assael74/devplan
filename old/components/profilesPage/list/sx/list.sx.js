// features/playersDatabase/components/profilesPage/list/sx/list.sx.js

import { alpha } from '@mui/material/styles'

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

const palette = {
  panel: '#ffffff',
  line: alpha(devPlanColors.primaryDark, 0.12),
  lineStrong: alpha(devPlanColors.primary, 0.28),
  red: '#b42318',
  redSoft: alpha('#b42318', 0.12),
}

export const listSx = {
  root: {
    minHeight: 0,
    height: '100%',
    overflow: 'hidden',
    bgcolor: palette.panel,
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
  },

  header: {
    px: 1,
    py: 0.75,
    borderBottom: `1px solid ${palette.line}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 1,
  },

  title: {
    fontWeight: 700,
  },

  content: {
    minHeight: 0,
    flex: '1 1 auto',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 0.5,
    p: 0.75,
  },

  resultsArea: {
    minHeight: 0,
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 0.75,
    alignSelf: 'stretch',
  },

  placeholder: {
    minHeight: '100%',
    height: '100%',
    flex: '1 1 auto',
    border: `1px dashed ${palette.lineStrong}`,
    borderRadius: '10px',
    bgcolor: alpha(devPlanColors.primaryLight, 0.34),
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: 0.4,
    px: 2,
    py: 3,
    textAlign: 'center',
  },

  placeholderTitle: {
    fontWeight: 700,
  },

  placeholderText: {
    color: 'text.secondary',
    maxWidth: 420,
  },

  error: {
    color: palette.red,
    bgcolor: palette.redSoft,
    borderRadius: '8px',
    p: 0.8,
    fontWeight: 700,
  },
}
