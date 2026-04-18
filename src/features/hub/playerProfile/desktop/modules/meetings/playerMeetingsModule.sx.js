// features/hub/playerProfile/modules/meetings/playerMeetingsModule.sx.js

export const moduleSx = {
  root: {
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    gap: 1.5,
    width: '100%',
    minWidth: 0,
  },

  paneWrapRight: {
    width: { xs: '100%', sm: '34%' },
    height: '100%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    minWidth: 0,
  },

  paneWrapLeft: {
    flex: 1,
    height: '100%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    minWidth: 0,
  },
}
