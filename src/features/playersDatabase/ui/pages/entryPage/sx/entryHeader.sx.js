// features/playersDatabase/ui/pages/entryPage/sx/EntryHeader.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const entryHeaderSx = {
  header: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: '520px minmax(0, 1fr)',
    },
    gridTemplateAreas: {
      xs: `
        "content"
        "visual"
      `,
      lg: '"content visual"',
    },
    gap: 2,
    alignItems: 'center',
  },

  headerContent: {
    gridArea: 'content',
    width: '100%',
    minWidth: 0,
    alignItems: 'flex-start',
    justifySelf: 'stretch',
    textAlign: 'left',
  },

  headerVisual: {
    gridArea: 'visual',
    width: '100%',
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  pageTitle: {
    color: devPlanColors.primaryDark,
    fontSize: {
      xs: 40,
      md: 54,
    },
    lineHeight: 1.05,
    fontWeight: 700,
  },

  pageDescription: {
    maxWidth: 680,
    color: devPlanColors.secondary,
    lineHeight: 1.55,
    textAlign: 'left',
  },
}
