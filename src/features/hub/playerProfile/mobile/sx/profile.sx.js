// features/hub/playerProfile/mobile/sx/profile.sx.js

export const profileSx = {
  sheetNotActive: {
    height: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    bgcolor: 'background.body',
  },

  scrollNotActive: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    pb: 10,
  },

  sheet: {
    height: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    bgcolor: 'background.body',
  },

  scroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
  },

  boxWraper: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  boxScreen: {
    px: 1.25,
    pt: 0.75,
    pb: 0.75,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flex: '0 0 auto',
    borderBottom: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.body',
  },

  sectionHeader: {
    px: 1,
    py: 0.75,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    flex: '0 0 auto',
    borderBottom: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.body',
  },

  sectionHeaderMain: {
    minWidth: 0,
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
  },

  box: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    px: 1,
    pt: 1,
    pb: 0,
  },
}
