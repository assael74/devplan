// features/hub/clubProfile/mobile/sx/profile.sx.js

import { getEntityColors } from '../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('clubs')

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
  },

  sheet: {
    height: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  scroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
  },

  boxWraper: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
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
    display: 'flex',
    flexDirection: 'column',
    overflow: 'visible',
    p: 0.5,
    pb: 0,
  },

  moduleRoot: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    display: 'grid',
    gap: 1,
    borderRadius: 12,
    bgcolor: 'background.body',
    mb: 0.5,
    p: 0,
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: `0 6px 18px -12px ${c.accent}40`,
  },
}
