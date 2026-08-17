// src/features/playersDatabase/ui/components/modals/sx/playerNarrativeModal.sx.js

const ENTITY_STYLES = {
  player: {
    color: 'text.primary',
    fontWeight: 700,
  },
  club: {
    color: 'primary.700',
    fontWeight: 700,
  },
  team: {
    color: 'primary.700',
    fontWeight: 700,
  },
  league: {
    color: 'success.700',
    fontWeight: 700,
  },
  ageGroup: {
    color: 'warning.700',
    fontWeight: 700,
  },
  birthYear: {
    color: 'warning.700',
    fontWeight: 700,
  },
  profile: {
    color: 'neutral.700',
    fontWeight: 700,
  },
}

const resolveDecisionBorder = (decision = {}) => {
  if (decision.actionStatus === 'immediate') return 'danger.400'
  if (decision.futureOutlook === 'competition_down') return 'warning.400'
  if (decision.actionStatus === 'priority') return 'warning.400'

  return 'divider'
}

const resolveDecisionBackground = (decision = {}) => {
  if (decision.actionStatus === 'immediate') return 'danger.softBg'
  if (decision.futureOutlook === 'competition_down') return 'warning.softBg'

  return 'background.level1'
}

export const playerNarrativeModalSx = {
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1.25,
    minWidth: 0,
  },

  decisionCard: (decision) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: 0.75,
    px: 1.25,
    py: 0.9,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: resolveDecisionBorder(decision),
    bgcolor: resolveDecisionBackground(decision),
  }),

  decisionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    flexWrap: 'wrap',
  },

  decisionTitle: {
    fontWeight: 700,
    flexShrink: 0,
  },

  decisionChips: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 0.6,
    flexWrap: 'wrap',
    minWidth: 0,
  },

  decisionChip: (emphasis) => ({
    maxWidth: '100%',
    fontWeight: 700,
    ...(emphasis ? {
      boxShadow: 'sm',
    } : {}),
  }),

  recommendationText: {
    color: 'text.secondary',
    lineHeight: 1.55,
  },

  storyHeader: {
    display: 'flex',
    alignItems: 'stretch',
    gap: 1.25,
  },

  storyMark: {
    width: 4,
    borderRadius: 'sm',
    bgcolor: 'primary.500',
    flexShrink: 0,
  },

  title: {
    fontWeight: 700,
    lineHeight: 1.35,
  },

  storyBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1.25,
  },

  leadParagraph: {
    px: 1.5,
    py: 1.25,
    borderRadius: 'md',
    bgcolor: 'primary.softBg',
  },

  paragraph: {
    px: 0.5,
  },

  closingParagraph: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.5,
    px: 1.5,
    py: 1.25,
    borderRadius: 'md',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
  },

  closingLabel: {
    color: 'text.tertiary',
    fontWeight: 700,
  },

  summary: {
    whiteSpace: 'pre-line',
    lineHeight: 1.85,
  },

  refineBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.6,
    pt: 0.25,
  },

  refineLabel: {
    color: 'text.tertiary',
    fontWeight: 700,
  },

  refineRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 0.75,
  },

  refineInput: {
    flex: 1,
    minWidth: 0,
  },

  refineButton: {
    flexShrink: 0,
  },

  entity: (type) => ({
    ...(ENTITY_STYLES[type] || ENTITY_STYLES.player),
  }),
}
