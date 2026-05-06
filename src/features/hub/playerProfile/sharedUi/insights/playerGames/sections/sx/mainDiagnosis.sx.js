// playerProfile/sharedUi/insights/playerGames/sx/playerMainDiagnosis.sx.js

const normalizeColor = (value) => {
  if (
    value === 'primary' ||
    value === 'neutral' ||
    value === 'danger' ||
    value === 'success' ||
    value === 'warning'
  ) {
    return value
  }

  return 'neutral'
}

export const mainDiagnosisSx = {
  root: (tone = 'neutral') => {
    const color = normalizeColor(tone)

    return {
      p: 1.5,
      borderRadius: 'xl',
      bgcolor: `${color}.softBg`,
      border: '1px solid',
      borderColor: `${color}.outlinedBorder`,
      boxShadow: 'sm',
      display: 'grid',
      gap: 1.15,
      minWidth: 0,
    }
  },

  topRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    minWidth: 0,
  },

  chipsRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 0.65,
    minWidth: 0,
  },

  statusChip: {
    fontWeight: 700,
    '--Chip-minHeight': '24px',
    '--Chip-paddingInline': '8px',
    fontSize: 12,
  },

  reliabilityChip: {
    flexShrink: 0,
    fontWeight: 700,
    bgcolor: 'background.surface',
    '--Chip-minHeight': '24px',
    '--Chip-paddingInline': '8px',
    fontSize: 12,
  },

  body: {
    display: 'grid',
    gap: 0.45,
    minWidth: 0,
    pr: 0.25,
  },

  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 1,
    minWidth: 0,
  },

  title: {
    fontWeight: 700,
    lineHeight: 1.15,
    color: 'text.primary',
    fontSize: {
      xs: 21,
      md: 23,
    },
  },

  text: {
    color: 'text.primary',
    lineHeight: 1.5,
    fontWeight: 600,
    fontSize: 14,
    maxWidth: 680,
  },

  bottomRow: {
    display: 'flex',
    alignItems: 'end',
    justifyContent: 'space-between',
    gap: 1,
    minWidth: 0,
    flexWrap: 'wrap',
    pt: 0.25,
  },

  factsRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 0.6,
    minWidth: 0,
  },

  fact: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.35,
    minWidth: 0,
    px: 0.75,
    py: 0.45,
    borderRadius: 'md',
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
  },

  factIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'text.secondary',
    flexShrink: 0,
  },

  factLabel: {
    color: 'text.secondary',
    fontWeight: 700,
    lineHeight: 1,
  },

  factValue: {
    color: 'text.primary',
    fontWeight: 700,
    lineHeight: 1,
  },

  actionText: {
    color: 'text.secondary',
    lineHeight: 1.35,
    fontWeight: 700,
    minWidth: 0,
  },
}
