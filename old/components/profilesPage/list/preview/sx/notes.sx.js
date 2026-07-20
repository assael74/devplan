// features/playersDatabase/components/profilesPage/list/preview/sx/notes.sx.js

import { alpha } from '@mui/material/styles'

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

const borderColor = alpha(devPlanColors.primaryDark, 0.12)
const softShadow = alpha(devPlanColors.primaryDark, 0.06)

export const notesSx = {
  previewSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.7,
    p: 0.85,
    border: `1px solid ${borderColor}`,
    borderRadius: '12px',
    bgcolor: '#ffffff',
    boxShadow: `0 1px 2px ${softShadow}`,
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
    '&:hover': {
      borderColor: alpha(devPlanColors.primary, 0.18),
      boxShadow: `0 8px 18px ${alpha(devPlanColors.primaryDark, 0.07)}`,
      transform: 'translateY(-1px)',
    },
  },

  previewSectionHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    flexWrap: 'wrap',
  },

  previewSectionTitle: {
    color: devPlanColors.primaryDark,
    fontSize: 14,
    fontWeight: 700,
  },

  previewSectionHeadActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.45,
    flex: '0 0 auto',
  },

  previewNotesField: {
    minHeight: 82,
    border: `1px solid ${borderColor}`,
    borderRadius: '10px',
    bgcolor: '#ffffff',
    fontSize: 12.5,
    fontWeight: 700,
    boxShadow: `0 1px 2px ${softShadow}`,
    '&:focus-within': {
      borderColor: alpha(devPlanColors.primary, 0.45),
      boxShadow: `0 0 0 1px ${alpha(devPlanColors.primary, 0.16)}, 0 4px 14px ${alpha(devPlanColors.primaryDark, 0.08)}`,
    },
  },

  previewSectionError: {
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
