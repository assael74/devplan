// src/features/playersDatabase/ui/components/modals/paste/sx/statsImportModal.sx.js

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

  seasonStatus: {
    maxWidth: 320,
  },

  seasonStatusCompact: {
    maxWidth: 260,

    '& .MuiFormLabel-root': {
      fontSize: 12,
      lineHeight: 1.2,
    },

    '& .MuiSelect-root': {
      minHeight: 30,
      fontSize: 12,
    },
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
}
