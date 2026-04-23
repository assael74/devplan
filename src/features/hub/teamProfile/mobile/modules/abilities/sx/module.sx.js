// teamProfile/mobile/modules/abilities/sx/module.sx.js

export const moduleSx = {
  stickyHeader: (theme) => ({
    position: 'sticky',
    top: 0,
    zIndex: 40,
    backgroundColor: theme.vars.palette.background.body,
    pt: 0.75,
    pb: 0.75,
  }),

  domainAccordion: (accent) => ({
    borderRadius: '16px',
    overflow: 'hidden',
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'sm',
    '&:before': {
      display: 'none',
    },
    '&[data-first-child]': {
      borderTopLeftRadius: '16px',
      borderTopRightRadius: '16px',
    },
    '&[data-last-child]': {
      borderBottomLeftRadius: '16px',
      borderBottomRightRadius: '16px',
    },
    '& .MuiAccordionSummary-root': {
      px: 1.1,
      py: 0.9,
    },
    '& .MuiAccordionDetails-root': {
      px: 1.1,
    },
    '&:hover': {
      borderColor: `${accent}.400`,
    },
  }),

  summaryRow: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
  },

  summaryStats: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexShrink: 0,
  },

  avgCircle: {
    position: 'relative',
    width: 42,
    height: 42,
    flexShrink: 0,
  },

  avgCircleCenter: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  domainItem: {
    p: 0.9,
    borderRadius: '12px',
    bgcolor: 'neutral.softBg',
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    alignItems: 'center',
    gap: 0.75,
    transition: 'background-color 120ms ease',
    '&:hover': {
      bgcolor: 'neutral.softHoverBg',
    },
  },

  empty: {
    mt: 0.9,
    p: 1,
    borderRadius: '12px',
    bgcolor: 'neutral.softBg'
  }
}
