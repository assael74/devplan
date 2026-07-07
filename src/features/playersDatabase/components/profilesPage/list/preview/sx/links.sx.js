// features/playersDatabase/components/profilesPage/list/preview/sx/links.sx.js

import { alpha } from '@mui/material/styles'

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

const borderColor = alpha(devPlanColors.primaryDark, 0.12)

export const linksSx = {
  linksCollapse: {
    borderRadius: '12px',
    border: `1px solid ${borderColor}`,
    bgcolor: '#ffffff',
    p: 0.85,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.6,
  },

  linksFields: {
    display: 'grid',
    gap: 0.55,
  },

  linksField: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.25,
  },

  linksLabel: {
    color: alpha(devPlanColors.primaryDark, 0.66),
    fontSize: 11,
    fontWeight: 700,
  },

  linksActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
    flexWrap: 'wrap',
    pt: 1,
  },

  linksError: {
    color: '#c62828',
    fontSize: 12,
    fontWeight: 700,
  },

  saveButton: {
    bgcolor: devPlanColors.primary,
    color: '#ffffff',
    fontSize: 11,
    minHeight: 26,
    px: 1,
    py: 0.1,
    borderRadius: 7,
    '--Icon-fontSize': '0.75rem',
    '&:hover': {
      bgcolor: devPlanColors.secondary,
      color: '#ffffff',
    },
  },

  resetButton: {
    border: '1px solid',
    borderColor: 'divider',
    fontSize: 11,
    minHeight: 26,
    px: 1,
    py: 0.1,
    borderRadius: 7,
    '--Icon-fontSize': '0.75rem',
    '&:hover': {
      bgcolor: devPlanColors.secondary,
      color: '#ffffff',
    },
  },
}
