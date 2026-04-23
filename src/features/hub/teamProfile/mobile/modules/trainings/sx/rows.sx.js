
import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const trainingColors = getEntityColors('training')

export const rowsSx = {
  rows: (mode = 'profile') => ({
    display: 'grid',
    gap: mode === 'modal' ? 0.45 : 0.6,
    minWidth: 0,
  }),

  row: (mode = 'profile') => ({
    p: mode === 'modal' ? 0.65 : 0.55,
    px: 1,
    borderRadius: 'lg',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
    minWidth: 0,
    border: '1px solid',
    borderColor: 'rgba(15,23,42,0.06)',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(241,245,249,0.9) 100%)',
    boxShadow: 'xs',
    transition: 'transform .15s ease, box-shadow .15s ease, border-color .15s ease',
    '&:hover': {
      transform: mode === 'modal' ? 'none' : 'translateY(-1px)',
      boxShadow: mode === 'modal' ? 'xs' : 'sm',
      borderColor: 'rgba(76,110,245,0.18)',
    },
  }),

  rowMain: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.7,
    minWidth: 0,
    flex: 1,
  },

  rowText: {
    minWidth: 0,
    display: 'grid',
    gap: 0.1,
    flex: 1,
  },

  rowPrimary: (mode = 'profile') => ({
    fontWeight: 700,
    color: 'neutral.800',
    letterSpacing: '0.02em',
    ...(mode === 'modal'
      ? {
          fontSize: '0.84rem',
          lineHeight: 1.15,
        }
      : {}),
  }),

  rowSecondary: (mode = 'profile') => ({
    opacity: 0.9,
    color: 'neutral.600',
    ...(mode === 'modal'
      ? {
          fontSize: '0.73rem',
          lineHeight: 1.1,
        }
      : {}),
  }),

  dayChip: {
    display: 'flex',
    fontWeight: 600,
    letterSpacing: '0.01em',
    boxShadow: 'sm',
    fontSize: 12,
    borderRadius: 8,
    color: trainingColors.text,
    bgcolor: trainingColors.bg,
    pb: 0.1,
    px: 0.4,
  },

  statusChip: (mode = 'profile') => ({
    fontWeight: 700,
    boxShadow: 'xs',
    ...(mode === 'modal'
      ? {
          height: 22,
          fontSize: 11,
          px: 0.6,
        }
      : {}),
  }),

  emptyWrap: (mode = 'profile') => ({
    borderRadius: 'lg',
    p: mode === 'modal' ? 0.75 : 1,
    bgcolor: 'neutral.softBg',
    border: '1px dashed',
    borderColor: 'divider',
  }),

  empty: {
    opacity: 0.72,
  },

  emptyRow: (mode = 'profile') => ({
    p: mode === 'modal' ? 0.6 : 0.8,
    borderRadius: 'lg',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
    minWidth: 0,
    border: '1px dashed',
    borderColor: 'divider',
    bgcolor: 'background.level2',
  }),

  dayChipEmpty: (mode = 'profile') => ({
    fontWeight: 700,
    ...(mode === 'modal'
      ? {
          height: 22,
          fontSize: 11,
          px: 0.55,
        }
      : {}),
  }),

  emptyRowPrimary: (mode = 'profile') => ({
    fontWeight: 700,
    color: 'neutral.700',
    ...(mode === 'modal'
      ? {
          fontSize: '0.82rem',
          lineHeight: 1.1,
        }
      : {}),
  }),

  emptyRowSecondary: (mode = 'profile') => ({
    color: 'neutral.500',
    ...(mode === 'modal'
      ? {
          fontSize: '0.72rem',
          lineHeight: 1.1,
        }
      : {}),
  }),
}
