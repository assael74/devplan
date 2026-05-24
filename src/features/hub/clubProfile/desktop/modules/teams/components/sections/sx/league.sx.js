// clubProfile/desktop/modules/teams/components/sections/sx/league.sx.js

export const leagueSx = {
  root: {
    width: 260,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 0.45,
    overflow: 'hidden',
    flexShrink: 0,
  },

  chip: {
    flexShrink: 0,
    minHeight: 24,
    fontWeight: 700,
    border: '1px solid',
    borderColor: 'divider',
    whiteSpace: 'nowrap',

    '& .MuiChip-label': {
      whiteSpace: 'nowrap',
    },
  },
}
