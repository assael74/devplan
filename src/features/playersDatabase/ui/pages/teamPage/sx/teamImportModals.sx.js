// features/playersDatabase/ui/pages/teamPage/sx/TeamImportModals.sx.js

export const teamImportModalsSx = {
  modalContent: {
    p: {
      xs: 0.75,
      md: 1,
    },
    overflow: 'hidden',
  },

  content: {
    minWidth: 0,
    height: {
      xs: 'min(560px, calc(100dvh - 220px))',
      md: 'min(700px, calc(100dvh - 240px))',
    },
    minHeight: {
      xs: 0,
      md: 520,
    },
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: 1.5,
    overflow: 'hidden',
  },

  statsContent: {
    gridTemplateRows: 'auto auto minmax(0, 1fr)',
  },

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
