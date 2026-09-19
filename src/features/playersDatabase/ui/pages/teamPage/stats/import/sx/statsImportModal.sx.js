// src/features/playersDatabase/ui/pages/teamPage/stats/import/sx/statsImportModal.sx.js

export const statsImportModalSx = {
  missingLink: {
    color: 'neutral.500',
  },

  metaLink: {
    display: 'inline-block',
    maxWidth: 260,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: 'primary.700',
    fontWeight: 600,
    textDecoration: 'none',
    verticalAlign: 'bottom',

    '&:hover': {
      textDecoration: 'underline',
    },
  },

  description: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 0.5,
  },

  selectionRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(220px, 360px) minmax(200px, 300px)',
    gap: 1.25,
    alignItems: 'start',
    justifyContent: 'start',

    '@media (max-width: 620px)': {
      gridTemplateColumns: '1fr',
    },
  },

  seasonSelect: {
    minWidth: 0,
  },

  seasonStatus: {
    minWidth: 0,
  },

  settingsAction: {
    minHeight: 28,
    px: 1,
    fontSize: 11,
    alignSelf: 'flex-start',
  },

  settingsActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
  },

  validationIssuesChip: {
    borderRadius: 999,
    minHeight: 23,
    px: 0.8,
    gap: 0.55,
    fontSize: 11,
    lineHeight: 1.2,

    '& .MuiChip-label': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.55,
      p: 0,
      whiteSpace: 'nowrap',
    },
  },

  validationInvalidChip: {
    boxShadow: 'inset 0 0 0 1px #f09a9a',
  },

  validationValidChip: {
    opacity: 0.82,
  },

  validationCheckWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.35,
  },

  validationCheckLabel: {
    color: 'neutral.800',
    fontWeight: 700,
  },

  validationCheckValue: {
    fontWeight: 600,
  },

  validationAdjustmentAction: {
    minHeight: 21,
    px: 0.65,
    fontSize: 10,
    fontWeight: 700,
  },

  rosterExceptionsChip: {
    borderRadius: 999,
    minHeight: 23,
    px: 0.85,
    fontSize: 11,
    fontWeight: 700,
  },
}
