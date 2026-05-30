// teamProfile/desktop/modules/games/components/sections/sx/perf.sx.js

const statsIconTone = {
  empty: {
    borderColor: 'neutral.300',
    bgcolor: 'background.surface',
    color: 'neutral.600',
    hoverBg: 'neutral.100',
    shadow: '0 1px 2px rgba(16, 24, 40, 0.08)',
  },

  draft: {
    borderColor: 'danger.300',
    bgcolor: 'danger.50',
    color: 'danger.700',
    hoverBg: 'danger.100',
    shadow: '0 1px 4px rgba(201, 33, 33, 0.18)',
  },

  partial: {
    borderColor: 'warning.300',
    bgcolor: 'warning.50',
    color: 'warning.800',
    hoverBg: 'warning.100',
    shadow: '0 1px 4px rgba(176, 112, 0, 0.18)',
  },

  committed: {
    borderColor: 'success.400',
    bgcolor: 'success.100',
    color: 'success.800',
    hoverBg: 'success.200',
    shadow: '0 1px 5px rgba(23, 126, 62, 0.22)',
  },

  saved: {
    borderColor: 'primary.300',
    bgcolor: 'primary.50',
    color: 'primary.700',
    hoverBg: 'primary.100',
    shadow: '0 1px 4px rgba(12, 102, 228, 0.16)',
  },
}

const getStatsIconTone = status => {
  return statsIconTone[status] || statsIconTone.empty
}

export const perfSx = {
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 0.45,
    minWidth: 0,
    width: '100%',
    pl: 0.25,
    py: 0,
  },

  labelBox: {
    flex: '0 0 45px',
    width: 45,
    minWidth: 0,
    p: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  addStatsIcon: status => {
    const tone = getStatsIconTone(status)

    return {
      '--IconButton-size': '22px',
      '--Icon-fontSize': '15px',
      minWidth: 22,
      width: 22,
      height: 22,
      p: 0,
      ml: 0.5,

      borderRadius: '7px',
      border: '1px solid',
      borderColor: tone.borderColor,
      bgcolor: tone.bgcolor,
      color: tone.color,

      boxShadow: tone.shadow,
      transition: 'all .14s ease',

      '&:hover': {
        bgcolor: tone.hoverBg,
        borderColor: tone.borderColor,
        boxShadow: tone.shadow,
        transform: 'translateY(-1px)',
      },

      '&:active': {
        transform: 'translateY(0)',
        boxShadow: '0 1px 2px rgba(16, 24, 40, 0.10)',
      },
    }
  },

  label: {
    color: 'text.tertiary',
    fontWeight: 700,
    fontSize: 11,
    lineHeight: 1.2,
    minWidth: 0,
    maxWidth: 28,
    textAlign: 'left',
  },

  content: {
    flex: '0 1 auto',
    minWidth: 0,
    display: 'grid',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.25,
  },

  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.7,
    minWidth: 0,
    overflow: 'hidden',
    flexWrap: 'nowrap',
  },

  chipsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.7,
    minWidth: 0,
    overflow: 'hidden',
    flexWrap: 'nowrap',
  },

  metricChip: {
    maxWidth: 78,
    minWidth: 0,
    justifyContent: 'center',
    overflow: 'hidden',
    border: '1px solid',
    borderColor: 'divider',

    '& .MuiChip-label': {
      minWidth: 0,
      overflow: 'hidden',
    },
  },

  metricChipText: {
    display: 'none',
  },

  metricChipValue: {
    fontSize: 12,
    fontWeight: 700,
    flex: '0 0 auto',
    textAlign: 'center',
  },

  playerChip: {
    maxWidth: 112,
    minWidth: 0,
    justifyContent: 'center',
    overflow: 'hidden',
    border: '1px solid',
    borderColor: 'divider',

    '& .MuiChip-label': {
      minWidth: 0,
      overflow: 'hidden',
    },
  },

  chipAvatar: {
    width: 16,
    height: 16,
    flex: '0 0 auto',
  },

  chipValue: {
    fontSize: 12,
    pl: 0.35,
    fontWeight: 700,
    flex: '0 0 auto',
  },

  chipText: {
    fontSize: 12,
    minWidth: 0,
    maxWidth: 64,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'center',
  },
}
