// clubProfile/desktop/modules/teams/components/sections/sx/performance.sx.js

export const performanceSx = {
  root: {
    width: 220,
    minWidth: 0,
    display: 'grid',
    gap: 0.35,
    px: 0.8,
    py: 0.45,
    borderRadius: 9,
    bgcolor: 'background.level1',
    overflow: 'hidden',
    flexShrink: 0,
    border: '1px solid',
    borderColor: 'divider',
  },

  top: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.6,
    minWidth: 0,
    overflow: 'hidden',
  },

  title: {
    fontWeight: 700,
    color: 'text.secondary',
    whiteSpace: 'nowrap',
  },

  profileChip: {
    flexShrink: 1,
    minWidth: 0,
    maxWidth: 104,
    minHeight: 22,
    fontWeight: 700,
    border: '1px solid',
    borderColor: 'divider',

    '& .MuiChip-label': {
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  impactChip: {
    flexShrink: 0,
    minWidth: 48,
    minHeight: 22,
    justifyContent: 'center',
    fontWeight: 800,
    border: '1px solid',
    borderColor: 'divider',
  },

  meta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
    minWidth: 0,
    overflow: 'hidden',
    color: 'text.tertiary',
    fontSize: 11,
    lineHeight: 1,
    whiteSpace: 'nowrap',
  },

  metaMain: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
    overflow: 'hidden',
  },

  metaItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.25,
    minWidth: 0,
    whiteSpace: 'nowrap',
    color: 'text.tertiary',
  },

  emptyTitle: {
    fontWeight: 700,
    color: 'text.secondary',
  },

  emptyText: {
    color: 'text.tertiary',
  },
}
