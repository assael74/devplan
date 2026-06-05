// src/features/liveTagging/sharedUi/events/sx/eventsSummary.sx.js

const sideTone = side => {
  if (side === 'positive') {
    return {
      bgcolor: 'success.softBg',
      borderColor: 'success.outlinedBorder',
    }
  }

  if (side === 'negative') {
    return {
      bgcolor: 'danger.softBg',
      borderColor: 'danger.outlinedBorder',
    }
  }

  return {
    bgcolor: 'background.level1',
    borderColor: 'divider',
  }
}

export const eventsSummarySx = {
  root: {
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 'lg',
    p: 0.75,
    display: 'grid',
    gap: 0.65,
  },

  lastEventCard: side => ({
    ...sideTone(side),
    border: '1px solid',
    borderRadius: 'lg',
    px: 0.75,
    py: 0.65,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    minWidth: 0,
  }),

  lastEventMain: {
    minWidth: 0,
    display: 'grid',
    gap: 0.1,
  },

  mutedText: {
    color: 'text.tertiary',
  },

  lastEventTitle: {
    fontWeight: 700,
    lineHeight: 1.15,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  lastEventSub: {
    color: 'text.secondary',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  sideChip: {
    flexShrink: 0,
    fontWeight: 700,
  },

  emptyLastEvent: {
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 'lg',
    px: 0.75,
    py: 0.65,
    display: 'grid',
    gap: 0.1,
  },

  emptyText: {
    color: 'text.secondary',
    fontWeight: 600,
  },

  summaryRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  info: {
    minWidth: 0,
    display: 'grid',
    gap: 0.1,
  },

  title: {
    fontWeight: 700,
  },

  deleteButton: {
    flexShrink: 0,
    minHeight: 34,
    fontWeight: 700,
  },
}
