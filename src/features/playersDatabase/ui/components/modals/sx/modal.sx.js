// features/playersDatabase/ui/components/modals/sx/modal.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const modalSx = {
  root: {
    p: {
      xs: 1,
      md: 2,
    },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(5px)',
  },

  motionWrap: {
    sm: {
      width: 'min(580px, calc(100vw - 24px))',
      maxHeight: 'min(720px, calc(100dvh - 24px))',
    },

    md: {
      width: 'min(760px, calc(100vw - 24px))',
      maxHeight: 'min(820px, calc(100dvh - 24px))',
    },

    lg: {
      width: 'min(1040px, calc(100vw - 24px))',
      maxHeight: 'min(900px, calc(100dvh - 24px))',
    },

    xl: {
      width: 'min(1280px, calc(100vw - 24px))',
      maxHeight: 'min(920px, calc(100dvh - 24px))',
    },
  },

  dialog: {
    position: 'relative',
    inset: 'auto',
    transform: 'none',
    width: '100%',
    maxWidth: '100%',
    maxHeight: 'inherit',
    minHeight: 0,
    m: 0,
    p: 0,
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr) auto',
    overflow: 'hidden',
    borderRadius: 18,
    bgcolor: '#fff',
    border: '1px solid #dbe5f4',
    boxShadow: '0 26px 80px rgba(16, 43, 64, 0.22)',
  },

  header: {
    minWidth: 0,
    px: {
      xs: 1.5,
      md: 2,
    },
    py: 1.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1.5,
    borderBottom: '1px solid #dbe5f4',
    bgcolor: '#fff',
  },

  headerContent: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
  },

  headerIcon: {
    width: 42,
    height: 42,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    bgcolor: devPlanColors.primaryLight,
    color: devPlanColors.primary,

    '& svg': {
      color: 'inherit',
    },
  },

  titleWrap: {
    minWidth: 0,
    display: 'grid',
    gap: 0.25,
  },

  title: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  description: {
    minWidth: 0,
    color: devPlanColors.secondary,
  },

  closeButton: {
    flexShrink: 0,
    color: devPlanColors.primary,
  },

  dialogContent: {
    minHeight: 0,
    p: 0,
    display: 'flex',
    flexDirection: 'column',
  },

  content: {
    minHeight: 0,
    p: {
      xs: 1.25,
      md: 2,
    },
    overflowY: 'auto',
    overflowX: 'hidden',
  },

  footer: {
    px: {
      xs: 1.5,
      md: 2,
    },
    py: 1.25,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 1,
    borderTop: '1px solid #dbe5f4',
    bgcolor: '#fff',
  },

  confirmButton: {
    minWidth: 150,
    minHeight: 38,
    bgcolor: devPlanColors.primary,
    color: '#fff',

    '&:hover': {
      bgcolor: devPlanColors.primaryDark,
    },
  },

  cancelButton: {
    minWidth: 110,
    minHeight: 38,
    bgcolor: '#fff',
    color: devPlanColors.primary,
    borderColor: devPlanColors.primary,

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primaryDark,
    },
  },
}
