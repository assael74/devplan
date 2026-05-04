// teamProfile/modules/games/components/insightsDrawer/sections/sx/local.sx.js

export const localSx = {
  sectionBlock: {
    display: 'grid',
    gap: 1,
  },

  sectionHead: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  sectionTitleWrap: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
  },

  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'background.level1',
    color: 'text.secondary',
    flexShrink: 0,
  },

  sectionTitle: {
    fontWeight: 700,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}
