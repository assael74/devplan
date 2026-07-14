// src/features/reports/dashboard/components/sidbar/sx/category.sx.js

export const categorySx = {
  categorySection: {
    flexShrink: 0,
    px: 1,
    py: 1.15,
    borderBottom: '1px solid',
    borderColor: 'rgba(23, 59, 87, 0.08)',
  },

  sectionTitle: {
    px: 0.5,
    mb: 0.65,
    fontWeight: 700,
    color: 'text.secondary',
  },

  categoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.35,
  },

  categoryRow: selected => ({
    minHeight: 42,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    px: 0.85,
    py: 0.6,
    bgcolor: selected ? 'primary.softBg' : 'transparent',
    borderRadius: 'md',
    border: '1px solid',
    borderColor: selected ? 'rgba(23, 59, 87, 0.10)' : 'transparent',
    boxShadow: selected ? '0 8px 20px rgba(15, 23, 42, 0.04)' : 'none',
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color .14s ease, box-shadow .14s ease, transform .14s ease, border-color .14s ease',

    '&:hover': {
      bgcolor: selected ? 'primary.softHoverBg' : 'rgba(255, 255, 255, 0.95)',
      transform: 'translateX(-1px)',
      borderColor: selected ? 'rgba(23, 59, 87, 0.14)' : 'rgba(23, 59, 87, 0.08)',
    },

    '&:focus-visible': {
      boxShadow: '0 0 0 2px var(--joy-palette-primary-300)',
    },
  }),

  categoryMain: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.8,
  },

  categoryIcon: selected => ({
    width: 28,
    height: 28,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    color: selected ? 'primary.600' : 'text.tertiary',
    bgcolor: selected ? 'rgba(232, 240, 245, 0.9)' : 'background.level2',
    borderRadius: 'md',
  }),

  categoryLabel: selected => ({
    minWidth: 0,
    fontWeight: selected ? 700 : 600,
    color: selected ? 'primary.700' : 'text.primary',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),

  categoryCount: selected => ({
    minWidth: 24,
    height: 24,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    fontSize: 12,
    fontWeight: 700,
    color: selected ? 'primary.700' : 'text.tertiary',
    bgcolor: selected ? 'rgba(232, 240, 245, 0.96)' : 'background.level2',
    border: '1px solid',
    borderColor: selected ? 'rgba(23, 59, 87, 0.10)' : 'transparent',
    borderRadius: 'xl',
  }),
}
