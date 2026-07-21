// entryPage/features/playersDatabase/ui/entryPage.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const entryPageSx = {
  page: {
    width: '100%',
    maxWidth: 1560,
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    mx: 'auto',
    px: {
      xs: 2,
      md: 2.5,
    },
    py: {
      xs: 1.5,
      md: 1.5,
    },
    display: 'grid',
    gridTemplateRows: 'auto auto minmax(0, 1fr)',
    gap: 2,
    overflow: 'hidden',
  },

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
