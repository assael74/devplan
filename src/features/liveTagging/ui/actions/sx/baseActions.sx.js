// src/features/liveTagging/ui/actions/sx/baseActions.sx.js

export const baseActionsSx = {
  actionsPanel: {
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 'lg',
    px: 1,
    py: 0.75,
    display: 'grid',
    gap: 0.75,
  },

  actionsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  mutedText: {
    color: 'text.tertiary',
  },

  actionsMainTitle: {
    fontWeight: 700,
  },

  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(2, minmax(0, 1fr))',
      sm: 'repeat(3, minmax(0, 1fr))',
      md: 'repeat(4, minmax(0, 1fr))',
    },
    gap: {
      xs: 0.75,
      md: 0.65,
    },
  },

  actionCard: selected => ({
    minHeight: {
      xs: 66,
      sm: 72,
      md: 66,
    },
    borderRadius: 'lg',
    px: 0.75,
    py: 0.75,
    border: '1px solid',
    borderColor: selected ? 'primary.outlinedBorder' : 'divider',
    boxShadow: selected ? 'sm' : 'none',
    justifyContent: 'center',
    minWidth: 0,
    overflow: 'hidden',
    transition: 'transform .12s ease, box-shadow .12s ease, border-color .12s ease',

    '&:active': {
      transform: 'scale(0.985)',
    },
  }),

  actionCardInner: {
    minWidth: 0,
    width: '100%',
    display: 'grid',
    placeItems: 'center',
    gap: 0.45,
  },

  actionIcon: selected => ({
    width: 28,
    height: 28,
    borderRadius: '999px',
    display: 'grid',
    placeItems: 'center',
    bgcolor: selected ? 'primary.solidBg' : 'background.surface',
    border: '1px solid',
    borderColor: selected ? 'primary.solidColor' : 'divider',
  }),

  actionTitle: {
    fontWeight: 700,
    textAlign: 'center',
    lineHeight: 1.1,
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: {
      xs: 12,
      sm: 13,
      md: 13,
    },
  },
}
