// features/playersDatabase/components/profilesPage/list/preview/sx/profile.sx.js

import { alpha } from '@mui/material/styles'

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

const borderColor = alpha(devPlanColors.primaryDark, 0.12)
const softShadow = alpha(devPlanColors.primaryDark, 0.06)
const selectedStart = '#0b5c2f'
const selectedMid = '#179343'
const selectedEnd = '#55d06e'

export const profileSx = {
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

  previewChipRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 0.5,
  },

  previewChipTail: {
    marginInlineStart: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    flexWrap: 'wrap',
  },

  previewMiniChip: {
    flex: '0 0 auto',
    whiteSpace: 'nowrap',
  },

  previewProfileChip: {
    minHeight: 30,
    px: 0.9,
    fontWeight: 700,
    lineHeight: 1.05,
    border: `1px solid ${borderColor}`,
    color: '#ffffff',
    backgroundImage: `linear-gradient(135deg, ${selectedStart} 0%, ${selectedMid} 54%, ${selectedEnd} 100%)`,
    boxShadow: `0 1px 0 ${alpha(devPlanColors.primaryDark, 0.02)}`,
    bgcolor: '#ffffff',
    '--Chip-paddingInline': '1px',
    '&:hover': {
      borderColor: alpha(devPlanColors.primary, 0.32),
      bgcolor: alpha(devPlanColors.primaryLight, 0.6),
      boxShadow: `0 6px 14px ${alpha(devPlanColors.primaryDark, 0.08)}`,
      transform: 'translateY(-1px)',
    },
  },

  previewTooltip: {
    maxWidth: 300,
    p: 0.75,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.45,
  },

  previewTooltipTitle: {
    color: '#17202a',
    fontSize: 13,
    fontWeight: 700,
    lineHeight: 1.15,
  },

  previewTooltipText: {
    color: '#4e5a66',
    fontSize: 11.5,
    lineHeight: 1.35,
  },

  previewTooltipList: {
    m: 0,
    pl: 0,
    display: 'grid',
    gap: 0.2,
  },

  previewPresenceChip: {
    minHeight: 24,
    px: 0.9,
    fontSize: 10.75,
    fontWeight: 700,
    borderRadius: '999px',
    bgcolor: alpha('#8d6e00', 0.08),
    color: '#a07b00',
    border: `1px solid ${alpha('#8d6e00', 0.12)}`,
    boxShadow: `0 2px 6px ${alpha('#8d6e00', 0.1)}`,
  },
}
