// src/features/reports/dashboard/components/sidbar/sx/reports.sx.js

export const reportsSx = {
  sectionTitle: {
    px: 0.5,
    mb: 0.65,
    fontWeight: 600,
    color: 'primary.700',
    letterSpacing: '-0.01em',
  },

  reportsSection: {
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },

  reportsSectionHeader: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    px: 1.5,
    pt: 1.0,
    pb: 0.55,
    mt: 0,
  },

  reportsCount: count => ({
    minWidth: 24,
    height: 24,
    display: 'grid',
    placeItems: 'center',
    color: count > 0 ? 'success.900' : 'text.tertiary',
    bgcolor: count > 0 ? 'rgba(220, 252, 231, 0.98)' : 'rgba(232, 240, 245, 0.9)',
    border: '1px solid',
    borderColor: count > 0 ? 'rgba(21, 128, 61, 0.28)' : 'rgba(23, 59, 87, 0.08)',
    borderRadius: 'xl',
    fontWeight: 800,
  }),

  reportList: {
    minHeight: 0,
    overflow: 'visible',
    px: 0.75,
    pb: 1.05,
  },

  reportGroup: (open, disabled) => ({
    mb: 0.45,
    opacity: disabled ? 0.62 : 1,
    bgcolor: open ? 'rgba(232, 240, 245, 0.82)' : 'rgba(255, 255, 255, 0.72)',
    border: '1px solid',
    borderColor: disabled ? 'rgba(23, 59, 87, 0.05)' : open ? 'rgba(23, 59, 87, 0.12)' : 'rgba(23, 59, 87, 0.06)',
    borderRadius: 'md',
    boxShadow: disabled ? 'none' : open ? '0 10px 24px rgba(15, 23, 42, 0.04)' : 'none',
    overflow: 'hidden',
    transition: 'background-color .14s ease, box-shadow .14s ease, border-color .14s ease',
  }),

  reportHead: (open, disabled) => ({
    minHeight: 48,
    px: 0.9,
    py: 0.6,
    cursor: disabled ? 'default' : 'pointer',
    bgcolor: open ? 'rgba(232, 240, 245, 0.88)' : 'transparent',
    transition: 'background-color .14s ease, transform .14s ease',

    '&:hover': {
      bgcolor: disabled ? 'transparent' : open ? 'rgba(232, 240, 245, 0.96)' : 'rgba(255, 255, 255, 0.96)',
      transform: disabled ? 'none' : 'translateX(-1px)',
    },
  }),

  reportTitle: (open, disabled) => ({
    fontWeight: open ? 700 : 600,
    color: disabled ? 'text.tertiary' : open ? 'primary.700' : 'text.primary',
    letterSpacing: '-0.01em',
    opacity: disabled ? 0.82 : 1,

    '& svg': {
      color: disabled ? 'text.disabled' : open ? 'primary.600' : 'text.tertiary',
    },
  }),

  reportCount: (open, disabled, count = 0) => ({
    minWidth: 26,
    height: 26,
    display: 'grid',
    placeItems: 'center',
    fontSize: 12,
    fontWeight: 800,
    color: disabled ? 'text.disabled' : count > 0 ? 'success.900' : open ? 'primary.700' : 'text.tertiary',
    bgcolor: disabled
      ? 'rgba(248, 250, 252, 0.92)'
      : count > 0
        ? 'rgba(220, 252, 231, 0.98)'
        : open
          ? 'rgba(232, 240, 245, 0.96)'
          : 'background.level2',
    border: '1px solid',
    borderColor: disabled
      ? 'rgba(23, 59, 87, 0.06)'
      : count > 0
        ? 'rgba(21, 128, 61, 0.28)'
        : open
          ? 'rgba(23, 59, 87, 0.10)'
          : 'transparent',
    borderRadius: 'xl',
  }),

  reportContent: {
    p: 0,
  },

  reportInner: open => ({
    pt: open ? 0.2 : 0,
    pb: open ? 0.65 : 0,
  }),

  publicationList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.3,
    px: 0.65,
  },

  publicationRow: selected => ({
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: '8px minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: 0.75,
    px: 0.8,
    py: 0.65,
    bgcolor: selected ? 'background.body' : 'transparent',
    borderRadius: 'md',
    border: '1px solid',
    borderColor: selected ? 'rgba(23, 59, 87, 0.10)' : 'transparent',
    cursor: 'pointer',
    outline: 'none',
    boxShadow: selected ? '0 8px 18px rgba(15, 23, 42, 0.04)' : 'none',
    transition: 'background-color .14s ease, box-shadow .14s ease, transform .14s ease, border-color .14s ease',

    '&:hover': {
      bgcolor: selected ? 'background.body' : 'rgba(255, 255, 255, 0.92)',
      transform: 'translateX(-1px)',
      borderColor: selected ? 'rgba(23, 59, 87, 0.12)' : 'rgba(23, 59, 87, 0.08)',
    },

    '&:focus-visible': {
      boxShadow: '0 0 0 2px var(--joy-palette-primary-300)',
    },
  }),

  publicationDot: selected => ({
    width: 8,
    height: 8,
    bgcolor: selected ? 'primary.500' : 'neutral.300',
    borderRadius: '50%',
  }),

  publicationText: {
    minWidth: 0,
  },

  publicationLabel: selected => ({
    fontWeight: selected ? 700 : 600,
    color: selected ? 'primary.700' : 'text.primary',
    letterSpacing: '-0.01em',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),

  publicationDate: selected => ({
    mt: 0.1,
    color: selected ? 'primary.500' : 'text.tertiary',
    opacity: selected ? 1 : 0.92,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),

  reportEmpty: {
    minHeight: 76,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.5,
    color: 'text.tertiary',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(244,247,249,0.95) 100%)',
    border: '1px dashed',
    borderColor: 'rgba(23, 59, 87, 0.12)',
    borderRadius: 'md',
    textAlign: 'center',
    px: 1,
  },

  reportEmptyIcon: {
    opacity: 0.7,
    color: 'primary.500',
  },

  reportEmptyText: {
    color: 'text.tertiary',
    maxWidth: 220,
    lineHeight: 1.45,
  },
}
