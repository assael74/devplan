// features/playersDatabase/ui/pages/searchPage/query/sx/searchQuerySection.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const searchQuerySectionSx = {
  root: {
    minWidth: 0,
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'visible',
    border: '1px solid #d7e2ef',
    borderRadius: 9,
    bgcolor: '#fff',
    boxShadow: '0 3px 10px rgba(23, 59, 87, 0.045)',
  },

  header: {
    position: 'sticky',
    top: 0,
    zIndex: 3,
    minHeight: 38,
    px: 1.15,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    borderBottom: '1px solid #d7e2ef',
    bgcolor: '#f8fafc',
  },

  title: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  step: {
    minWidth: 24,
    color: devPlanColors.tertiary,
    fontWeight: 700,
    letterSpacing: '0.04em',
    textAlign: 'left',
  },

  divider: {
    display: 'none',
  },

  content: {
    minWidth: 0,
    flex: 1,
    p: 1,
  },
}
