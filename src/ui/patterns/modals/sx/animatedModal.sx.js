import { devPlanColors } from '../../../core/theme/Colors.js'

export const animatedModalSx = {
  root: {
    p: { xs: 1, md: 2 },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(5px)',
  },

  motionWrap: {
    sm: {
      width: 'min(520px, calc(100vw - 24px))',
      maxHeight: 'min(720px, calc(100dvh - 24px))',
    },
    md: {
      width: 'min(680px, calc(100vw - 24px))',
      maxHeight: 'min(820px, calc(100dvh - 24px))',
    },
    lg: {
      width: 'min(960px, calc(100vw - 24px))',
      maxHeight: 'min(900px, calc(100dvh - 24px))',
    },
    xl: {
      width: 'min(1240px, calc(100vw - 24px))',
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
    bgcolor: '#FFFFFF',
    border: '1px solid #D9E2E8',
    boxShadow: '0 26px 80px rgba(16, 43, 64, 0.22)',
  },

  header: {
    minWidth: 0,
    px: { xs: 1.5, md: 2 },
    py: 1.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1.5,
    borderBottom: '1px solid #D9E2E8',
    bgcolor: '#FFFFFF',
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
  },

  titleWrap: { minWidth: 0, display: 'grid', gap: 0.25 },
  title: { color: devPlanColors.primaryDark, fontWeight: 700 },
  description: { color: devPlanColors.secondary },
  closeButton: { flexShrink: 0, color: devPlanColors.primary },

  dialogContent: {
    minHeight: 0,
    p: 0,
    display: 'flex',
    flexDirection: 'column',
  },

  content: {
    minHeight: 0,
    p: { xs: 1.5, md: 2 },
    overflowY: 'auto',
    overflowX: 'hidden',
  },

  footer: {
    px: { xs: 1.5, md: 2 },
    py: 1.25,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 1,
    borderTop: '1px solid #D9E2E8',
    bgcolor: '#FFFFFF',
  },

  confirmButton: {
    minWidth: 154,
    minHeight: 38,
    bgcolor: devPlanColors.primary,
    color: '#FFFFFF',
    '&:hover': { bgcolor: devPlanColors.primaryDark },
  },

  cancelButton: {
    minWidth: 104,
    minHeight: 38,
    bgcolor: '#FFFFFF',
    color: devPlanColors.primary,
    borderColor: devPlanColors.primary,
    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primaryDark,
    },
  },
}
