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
}
