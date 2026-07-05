// src/features/reports/public/sx/publicReport.sx.js

export const publicReportSx = {
  page: {
    minHeight: '100vh',
    bgcolor: '#F3F6F8',
    direction: 'rtl',
  },

  actions: {
    position: 'fixed',
    top: 16,
    left: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    zIndex: 20,

    '@media print': {
      display: 'none',
    },

    '@media (max-width: 820px)': {
      position: 'sticky',
      top: 0,
      left: 'auto',
      justifyContent: 'flex-start',
      px: 1,
      py: 1,
      bgcolor: 'rgba(243, 246, 248, 0.95)',
      borderBottom: '1px solid',
      borderColor: 'divider',
      backdropFilter: 'blur(8px)',
    },
  },

  statePage: {
    display: 'grid',
    placeItems: 'center',
    minHeight: '100vh',
    px: 2,
    bgcolor: '#F3F6F8',
  },

  stateCard: {
    width: 'min(460px, 100%)',
    p: 3,
    textAlign: 'center',
    borderRadius: 'lg',
  },

  stateTitle: {
    mt: 1.5,
  },

  stateText: {
    mt: 0.75,
    color: 'text.secondary',
  },
}
