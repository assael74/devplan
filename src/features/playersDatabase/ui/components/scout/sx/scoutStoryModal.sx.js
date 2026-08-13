// src/features/playersDatabase/ui/components/scout/sx/scoutStoryModal.sx.js

export const scoutStoryModalSx = {
  modalContent: {
    width: 'min(680px, 94vw)',
    maxWidth: 680,
  },

  content: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 1.5,
  },

  profileHeader: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: 1.25,
  },

  profileIcon: {
    width: 42,
    height: 42,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: 12,
    color: 'primary.600',
    bgcolor: 'primary.50',
    border: '1px solid',
    borderColor: 'primary.100',
  },

  profileHeading: {
    minWidth: 0,
  },

  profileTitle: {
    minWidth: 0,
    fontWeight: 700,
    lineHeight: 1.2,
  },

  profileDescription: {
    mt: 0.35,
    color: 'text.secondary',
    lineHeight: 1.5,
  },

  divider: {
    my: 0.25,
  },

  sections: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },

  section: ({ emphasis }) => ({
    minWidth: 0,
    p: 1.25,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.9,
    borderRadius: 12,
    border: '1px solid',
    borderColor: emphasis
      ? 'primary.200'
      : 'neutral.200',
    bgcolor: emphasis
      ? 'primary.50'
      : 'background.surface',
  }),

  sectionHeader: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 0.75,
  },

  sectionIcon: {
    pt: 0.1,
    flexShrink: 0,
    color: 'primary.600',
  },

  sectionHeading: {
    minWidth: 0,
  },

  sectionTitle: {
    fontWeight: 700,
    lineHeight: 1.25,
  },

  sectionDescription: {
    mt: 0.2,
    color: 'text.tertiary',
    lineHeight: 1.4,
  },

  sectionContent: {
    minWidth: 0,
  },

  storyText: {
    color: 'text.primary',
    lineHeight: 1.6,
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: 0.75,
  },

  metricItem: {
    minWidth: 0,
    px: 1,
    py: 0.8,
    borderRadius: 9,
    bgcolor: 'neutral.50',
    border: '1px solid',
    borderColor: 'neutral.100',
  },

  metricLabel: {
    color: 'text.tertiary',
    lineHeight: 1.2,
  },

  metricValue: {
    mt: 0.25,
    color: 'text.primary',
    fontWeight: 700,
    lineHeight: 1.2,
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.6,
  },

  listItem: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 0.65,
  },

  listMarker: {
    width: 5,
    height: 5,
    mt: 0.75,
    flexShrink: 0,
    borderRadius: '50%',
    bgcolor: 'primary.500',
  },

  listText: {
    minWidth: 0,
    color: 'text.primary',
    lineHeight: 1.5,
  },

  reliability: ({ compact }) => ({
    minWidth: 0,
    display: 'inline-flex',
    alignItems: 'center',
    gap: compact ? 0.4 : 0.55,
    px: compact ? 0 : 0.8,
    py: compact ? 0 : 0.45,
    borderRadius: 999,
    bgcolor: compact
      ? 'transparent'
      : 'neutral.50',
    border: compact
      ? 'none'
      : '1px solid',
    borderColor: 'neutral.100',
    whiteSpace: 'nowrap',
  }),

  reliabilityDot: {
    high: {
      width: 8,
      height: 8,
      flexShrink: 0,
      borderRadius: '50%',
      bgcolor: 'success.500',
    },

    medium: {
      width: 8,
      height: 8,
      flexShrink: 0,
      borderRadius: '50%',
      bgcolor: 'warning.500',
    },

    low: {
      width: 8,
      height: 8,
      flexShrink: 0,
      borderRadius: '50%',
      bgcolor: 'danger.500',
    },

    neutral: {
      width: 8,
      height: 8,
      flexShrink: 0,
      borderRadius: '50%',
      bgcolor: 'neutral.400',
    },
  },

  reliabilityLabel: ({ compact }) => ({
    color: 'text.secondary',
    fontSize: compact ? 11 : 12,
    fontWeight: 600,
    lineHeight: 1,
  }),

  reliabilityScore: ({ compact }) => ({
    color: 'text.tertiary',
    fontSize: compact ? 10 : 11,
    fontWeight: 600,
    lineHeight: 1,

    '&::before': {
      content: '"·"',
      mx: 0.2,
    },
  }),
}
