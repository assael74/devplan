// teamProfile/desktop/modules/players/sections/sx/performance.sx.js

export const performanceSx = {
  root: {
    minWidth: 0,
    display: 'grid',
    gap: 0.3,
    px: 1,
    py: 0.3,
    borderRadius: 'md',
    bgcolor: 'background.level1',
    boxShadow: 'inset 0 0 0 1px var(--joy-palette-divider)',
    overflow: 'hidden',
  },

  top: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
    overflow: 'hidden',
  },

  profileChip: {
    flexShrink: 1,
    minWidth: 0,
    maxWidth: 150,
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

  scoreChip: {
    flexShrink: 0,
    minWidth: 42,
    justifyContent: 'center',
    fontWeight: 700,
    border: '1px solid',
    borderColor: 'divider',
  },

  impactChip: {
    flexShrink: 0,
    minWidth: 46,
    justifyContent: 'center',
    fontWeight: 700,
    border: '1px solid',
    borderColor: 'divider',
  },

  meta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 2,
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
    gap: 0.85,
    minWidth: 0,
    overflow: 'hidden',
  },

  metaSide: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.25,
    flexShrink: 0,
    color: 'text.secondary',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },

  metaItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.25,
    minWidth: 0,
    whiteSpace: 'nowrap',
  },
}
