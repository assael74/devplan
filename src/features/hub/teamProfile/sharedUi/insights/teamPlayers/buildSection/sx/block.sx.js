// TEAMPROFILE/sharedUi/insights/teamPlayers/buildSection/sx/block.sx.js

export const blockSx = {
  buildAspect: {
    display: 'grid',
    gap: 2,
    p: 1,
    borderRadius: 'md',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
  },

  buildAspectHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    minWidth: 0,
  },

  buildAspectTitleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
  },

  buildAspectIcon: {
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

  buildAspectTitle: {
    fontSize: 15,
    fontWeight: 700,
    lineHeight: 1.25,
    color: 'text.primary',
  },

  buildAspectStatus: {
    flex: '0 0 auto',
    maxWidth: '45%',
  },

  buildRows: {
    display: 'grid',
    gap: 0.65,
  },
}
