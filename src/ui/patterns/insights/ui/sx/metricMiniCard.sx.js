// ui/patterns/insights/ui/sx/metricMiniCard.sx.js

export const metricMiniCardSx = {
  root: (color = 'neutral') => ({
    minHeight: 78,
    borderRadius: 12,
    px: 0.85,
    py: {
      xs: 0.2,
      sm: 0.75
    },
    display: 'grid',
    gap: 0.25,
    overflow: 'hidden',
    border: '1px solid',
    borderColor: `${color}.outlinedBorder`,
    bgcolor: `${color}.softBg`,
  }),

  titleRow: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.5,
  },

  title: {
    minWidth: 0,
    color: 'text.secondary',
    fontWeight: 700,
    lineHeight: 1.15,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  value: {
    fontWeight: 700,
    lineHeight: 1,
    color: 'text.primary',
    mt: 0.05,
  },

  sub: {
    color: 'text.secondary',
    lineHeight: 1.15,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: {
      xs: 'right',
      sm: 'left'
    }
  },

  tooltip: {
    border: '1px solid',
    borderColor: 'divider',
    p: 1,
  },
}
