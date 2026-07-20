// features/playersDatabase/components/profilesPage/list/preview/sx/preview.sx.js

import { alpha } from '@mui/material/styles'

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

const borderColor = alpha(devPlanColors.primaryDark, 0.12)
const mutedColor = alpha(devPlanColors.primaryDark, 0.66)
const softShadow = alpha(devPlanColors.primaryDark, 0.06)

export const previewSx = {
  root: {
    minWidth: 0,
    minHeight: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },

  avatar: {
    width: 34,
    height: 34,
    border: `1px solid ${borderColor}`,
    boxShadow: `0 4px 10px ${softShadow}`,
    flex: '0 0 auto',
  },

  content: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.2,
  },

  name: {
    minWidth: 0,
    color: devPlanColors.primaryDark,
    fontWeight: 850,
    lineHeight: 1.1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  meta: {
    minWidth: 0,
    color: mutedColor,
    fontWeight: 600,
    lineHeight: 1.2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  previewPlayerSelect: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    width: '100%',
    pt: 1,
  },
}
