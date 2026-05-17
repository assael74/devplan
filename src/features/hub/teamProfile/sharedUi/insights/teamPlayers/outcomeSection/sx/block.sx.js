// TEAMPROFILE/sharedUi/insights/teamPlayers/outcomeSection/sx/block.sx.js

export const blockSx = {
  block: separated => ({
    display: 'grid',
    gap: 1,
    p: 1,
    borderRadius: 'lg',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.level1',
    boxShadow: 'xs',
    mt: separated ? 1.25 : 0,
    pt: separated ? 1.25 : 1,
  }),

  blockHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    p: 0.75,
  },

  blockTitleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
  },

  blockIcon: {
    width: 24,
    height: 24,
    borderRadius: 'md',
    display: 'grid',
    placeItems: 'center',
    flex: '0 0 auto',
    border: '2px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    color: 'text.secondary',
  },

  blockText: {
    minWidth: 0,
    display: 'grid',
    gap: 0.15,
  },

  blockTitle: {
    fontSize: 15,
    fontWeight: 700,
    lineHeight: 1.25,
    color: 'text.primary',
  },

  blockSub: {
    color: 'text.tertiary',
    lineHeight: 1.25,
  },

  statusChip: {
    fontWeight: 700,
    flex: '0 0 auto',
  },

  infoGroups: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
    px: 0.35,
  },

  infoChip: {
    fontWeight: 700,
    maxWidth: '100%',

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  blockBody: {
    display: 'grid',
    gap: 1,
  },
}
