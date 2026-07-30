// features/playersDatabase/ui/pages/searchPage/results/sx/searchResultTeamUrl.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const searchResultTeamUrlSx = {
  root: {
    minWidth: 0,
    width: '100%',
    pt: 0.55,
    px: 0.7,
    pb: 0.35,
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #dbe5f4',
    borderRadius: 7,
    bgcolor: '#f8fbff',
  },

  header: {
    minWidth: 0,
    minHeight: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    mb: 0.45,
  },

  titleWrap: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.65,
  },

  icon: {
    width: 28,
    height: 28,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 7,
    bgcolor: '#e9f1fb',
    color: devPlanColors.primary,
  },

  title: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  editButton: {
    minHeight: 26,
    px: 0.65,
  },

  url: {
    minHeight: 38,
    px: 1,
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #dbe5f4',
    borderRadius: 7,
    bgcolor: '#fff',
    color: devPlanColors.primary,
    direction: 'ltr',
    textAlign: 'left',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },

  empty: {
    minHeight: 38,
    px: 1,
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #dbe5f4',
    borderRadius: 7,
    bgcolor: '#fff',
    color: 'neutral.500',
  },
}
