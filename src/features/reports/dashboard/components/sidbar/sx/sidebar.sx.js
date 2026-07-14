// src/features/reports/dashboard/components/sidbar/sx/sidebar.sx.js

export const sidebarSx = {
  sidebar: {
    gridArea: 'sidebar',
    minWidth: 0,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    overscrollBehavior: 'contain',
    scrollbarGutter: 'stable',
    bgcolor: 'background.level1',
    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(244, 247, 249, 0.98) 100%)',
    border: '1px solid',
    borderColor: 'rgba(23, 59, 87, 0.10)',
    borderRadius: 'lg',
    boxShadow: '0 18px 42px rgba(15, 23, 42, 0.06)',

    '@media (max-width: 820px)': {
      minHeight: 420,
      maxHeight: 520,
      boxShadow: '0 12px 28px rgba(15, 23, 42, 0.05)',
    },
  },

  sidebarHeader: {
    flexShrink: 0,
    px: 1.5,
    pt: 1.45,
    pb: 1.25,
    borderBottom: '1px solid',
    borderColor: 'rgba(23, 59, 87, 0.08)',
  },

  sidebarHeading: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1.25,
  },

  sidebarHeadingText: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.15,
  },

  sidebarIcon: {
    width: 38,
    height: 38,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    color: 'primary.600',
    bgcolor: 'rgba(232, 240, 245, 0.96)',
    border: '1px solid',
    borderColor: 'rgba(23, 59, 87, 0.08)',
    borderRadius: 'lg',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.7)',
  },

  sidebarTitle: {
    m: 0,
    fontWeight: 700,
    lineHeight: 1.1,
    fontSize: 18,
    color: 'text.primary',
  },

  sidebarSubtitle: {
    mt: 0.1,
    color: 'text.secondary',
    lineHeight: 1.4,
  },

  reportsShell: {
    mt: 0.75,
    pt: 0.35,
    pb: 0.15,
    background: 'linear-gradient(180deg, rgba(232, 240, 245, 0.28) 0%, rgba(244, 247, 249, 0.12) 100%)',
    borderTop: '1px solid',
    borderTopColor: 'rgba(23, 59, 87, 0.08)',
  },
}
