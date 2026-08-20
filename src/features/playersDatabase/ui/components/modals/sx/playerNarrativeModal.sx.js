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

const resolveDecisionBorder = decision => {
  if (decision.actionStatus === 'immediate') return 'success.600'
  if (decision.actionStatus === 'priority') return 'success.300'
  if (decision.futureOutlook === 'competition_down') return 'warning.400'

  return 'divider'
}

const resolveDecisionBackground = decision => {
  if (decision.actionStatus === 'immediate') return 'success.100'
  if (decision.actionStatus === 'priority') return 'success.softBg'
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

  decisionCard: decision => ({
    display: 'flex',
    flexDirection: 'column',
    gap: 0.65,
    px: 1.25,
    py: 0.85,
    borderRadius: 'md',
    border: decision.actionStatus === 'immediate' || decision.actionStatus === 'priority'
      ? '2px solid'
      : '1px solid',
    borderColor: resolveDecisionBorder(decision),
    bgcolor: resolveDecisionBackground(decision),
  }),

  decisionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
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
    gap: 0.55,
    flexWrap: 'wrap',
    minWidth: 0,
  },

  decisionChip: emphasis => ({
    maxWidth: '100%',
    fontWeight: 700,
    ...(emphasis ? { boxShadow: 'md', fontWeight: 700, px: 1.15 } : {}),
  }),

  decisionCallout: decision => ({
    lineHeight: 1.5,
    fontWeight: 700,
    color: decision.actionStatus === 'immediate' ? 'success.800' : 'success.700',
  }),

  primaryProfileText: {
    color: 'text.tertiary',
  },

  recommendationText: {
    color: 'text.secondary',
    lineHeight: 1.6,
  },

  storyBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.9,
  },

  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.45,
    px: 0.5,
    py: 0.35,
  },

  leadSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.45,
    px: 1.25,
    py: 1,
    borderRadius: 'md',
    bgcolor: 'primary.softBg',
  },

  sectionLabel: {
    color: 'text.tertiary',
    fontWeight: 700,
  },

  sectionText: {
    whiteSpace: 'pre-line',
    lineHeight: 1.75,
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.35,
  },

  listItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 0.7,
  },

  listBullet: {
    color: 'primary.500',
    fontWeight: 700,
    lineHeight: 1.75,
    flexShrink: 0,
  },

  actionSection: decision => ({
    display: 'flex',
    flexDirection: 'column',
    gap: 0.5,
    px: 1.25,
    py: 0.9,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: decision.actionStatus === 'immediate'
      ? 'success.600'
      : decision.actionStatus === 'priority'
        ? 'success.300'
        : 'divider',
    bgcolor: decision.actionStatus === 'immediate'
      ? 'success.100'
      : decision.actionStatus === 'priority'
        ? 'success.softBg'
        : 'background.level1',
  }),

  actionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
  },

  actionText: {
    lineHeight: 1.65,
    fontWeight: 600,
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

  entity: type => ({
    ...(ENTITY_STYLES[type] || ENTITY_STYLES.player),
  }),
}
