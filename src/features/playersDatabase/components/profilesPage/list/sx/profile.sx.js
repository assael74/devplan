// features/playersDatabase/components/profilesPage/list/sx/profile.sx.js

import { alpha } from '@mui/material/styles'

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

const palette = {
  line: alpha(devPlanColors.primaryDark, 0.12),
  muted: alpha(devPlanColors.primaryDark, 0.68),
  blueSoft: alpha(devPlanColors.primary, 0.16),
  red: '#b42318',
  redSoft: alpha('#b42318', 0.12),
}

const fixedChip = {
  flex: '0 0 auto',
  whiteSpace: 'nowrap',
}

export const profileSx = {
  card: {
    display: 'grid',
    gap: 0,
    borderRadius: '8px',
  },

  row: {
    p: 1,
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    bgcolor: '#ffffff',
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: 'minmax(0, 1fr) auto',
    },
    alignItems: 'center',
    gap: 1,
    cursor: 'pointer',
    '&.isSelected': {
      bgcolor: palette.blueSoft,
      borderColor: alpha(devPlanColors.primary, 0.22),
    },
  },

  identity: {
    minWidth: 0,
  },

  title: {
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  meta: {
    color: palette.muted,
    mt: 0.25,
  },

  rowActions: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: {
      xs: 'flex-start',
      lg: 'flex-end',
    },
    gap: 0.5,
  },

  stats: {
    minWidth: 0,
    maxWidth: '100%',
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: {
      xs: 'flex-start',
      lg: 'flex-end',
    },
    gap: 0.45,
    overflowX: 'auto',
    overflowY: 'hidden',
    '& .MuiChip-root': {
      ...fixedChip,
      minHeight: 24,
      maxWidth: '100%',
      fontSize: 11,
      fontWeight: 700,
    },
  },

  body: {
    p: 1,
    bgcolor: alpha(devPlanColors.primaryLight, 0.18),
    display: 'grid',
    gap: 1,
  },

  pickerHeader: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 1,
  },

  picker: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(2, minmax(0, 1fr))',
      xl: 'repeat(3, minmax(0, 1fr))',
    },
    gap: 0.75,
  },

  loadedDocuments: {
    display: 'grid',
    gap: 0.4,
  },

  loadedLabel: {
    fontWeight: 700,
  },

  loadedChips: {
    minWidth: 0,
    display: 'flex',
    flexWrap: 'nowrap',
    gap: 0.45,
    overflowX: 'auto',
    overflowY: 'hidden',
    '& .MuiChip-root': {
      ...fixedChip,
      minHeight: 24,
      maxWidth: '100%',
      fontSize: 11,
      fontWeight: 700,
    },
  },

  results: {
    width: '100%',
    minWidth: 0,
    mt: 0.25,
    display: 'grid',
    gap: 0.35,
  },

  printToolbar: {
    width: '100%',
    minWidth: 0,
    px: 0.85,
    py: 0.6,
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    bgcolor: alpha(devPlanColors.primaryLight, 0.3),
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'minmax(0, 1fr) auto',
    },
    alignItems: 'center',
    gap: 0.75,
  },

  printActions: {
    minWidth: 0,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 0.45,
  },

  printCount: {
    color: palette.muted,
    fontWeight: 700,
  },

  error: {
    color: palette.red,
    bgcolor: palette.redSoft,
    borderRadius: '8px',
    p: 0.8,
    fontWeight: 700,
  },
}
