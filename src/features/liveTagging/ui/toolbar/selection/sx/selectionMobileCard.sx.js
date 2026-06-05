// src/features/liveTagging/ui/toolbar/selection/sx/selectionMobileCard.sx.js

export const selectionMobileCardSx = {
  selectionMobileCard: ready => ({
    display: {
      xs: 'grid',
      sm: 'none',
    },
    gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, .95fr)',
    alignItems: 'center',
    gap: 0.75,
    bgcolor: ready ? 'primary.softBg' : 'background.surface',
    border: '1px solid',
    borderColor: ready ? 'primary.outlinedBorder' : 'divider',
    borderRadius: 'lg',
    px: 0.85,
    py: 0.7,
    cursor: 'pointer',
    boxShadow: ready ? 'sm' : 'none',
    overflow: 'hidden',
    transition: 'transform .12s ease, box-shadow .12s ease, border-color .12s ease',

    '&:active': {
      transform: 'scale(0.99)',
    },
  }),

  subjectBlock: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.65,
  },

  playerAvatar: {
    width: 34,
    height: 34,
    flexShrink: 0,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.level1',
  },

  subjectIcon: {
    width: 34,
    height: 34,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
    color: 'text.secondary',
    fontSize: 12,
    fontWeight: 700,
  },

  subjectText: {
    minWidth: 0,
    display: 'grid',
    gap: 0.1,
  },

  subjectTitle: {
    fontWeight: 700,
    lineHeight: 1.15,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  gameBlock: {
    minWidth: 0,
    display: 'grid',
    gap: 0.1,
    textAlign: 'right',
  },

  gameTitle: {
    fontWeight: 700,
    lineHeight: 1.15,
    fontSize: 12,
    color: 'primary.600',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  mutedText: {
    color: 'text.tertiary',
    lineHeight: 1.1,
  },
}
