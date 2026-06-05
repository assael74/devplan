// src/features/liveTagging/ui/drawer/flow/sx/qualityStep.sx.js

export const qualityStepSx = {
  wrap: {
    display: 'grid',
    gap: 1.25,
    pb: 1,
  },

  head: {
    display: 'grid',
    gap: 0.35,
    pr: 4,
  },

  zoneHead: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
    pr: 4,
  },

  mutedText: {
    color: 'text.tertiary',
  },

  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
  },

  title: {
    fontWeight: 700,
  },

  zoneTitle: side => ({
    fontWeight: 700,
    color: side === 'negative' ? 'danger.700' : 'success.700',
  }),

  qualityGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 1,
  },

  qualityButton: {
    minHeight: 78,
    borderRadius: 'xl',
    fontWeight: 700,
    fontSize: {
      xs: 18,
      sm: 20,
    },
  },
}
