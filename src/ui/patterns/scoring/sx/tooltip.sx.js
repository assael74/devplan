// src/ui/patterns/scoring/sx/tooltip.sx.js

export const tooltipSx = {
  trigger: {
    minWidth: 24,
    minHeight: 24,
    p: 0.25,
    color: 'text.tertiary',

    '&:hover': {
      color: 'primary.plainColor',
      bgcolor: 'background.level1',
    },
  },

  childTrigger: {
    display: 'inline-flex',
    minWidth: 0,
    cursor: 'help',
  },

  content: {
    maxWidth: 350,
    p: 1.25,
  },

  shortContent: {
    maxWidth: 260,
    p: 1,
  },

  head: {
    mb: 1,
  },

  title: {
    fontWeight: 700,
    lineHeight: 1.35,
  },

  shortTitle: {
    mb: 0.35,
    fontWeight: 700,
    lineHeight: 1.35,
  },

  subtitle: {
    mt: 0.25,
    color: 'primary.plainColor',
    fontWeight: 600,
  },

  text: {
    color: 'text.secondary',
    lineHeight: 1.55,
  },

  section: {
    mt: 1,
    pt: 1,
    borderTop: '1px solid',
    borderColor: 'divider',
  },

  list: {
    m: 0,
    mt: 0.5,
    ps: 2,
    color: 'text.secondary',
  },

  item: {
    mb: 0.35,
    lineHeight: 1.45,
  },

  note: {
    mt: 1,
    p: 0.75,
    borderRadius: 'md',
    bgcolor: 'background.level1',
    color: 'text.secondary',
    lineHeight: 1.45,
  },

  infoMenuBackdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 1298,
    bgcolor: 'rgba(15, 23, 42, 0.18)',
    backdropFilter: 'blur(1px)',
  },

  infoMenuCentered: {
    position: 'fixed !important',
    top: '50% !important',
    left: '50% !important',
    right: 'auto !important',
    bottom: 'auto !important',
    transform: 'translate(-50%, -50%) !important',

    width: 'min(86vw, 330px)',
    maxWidth: 330,
    p: 1,
    borderRadius: 'lg',
    boxShadow: 'lg',
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    zIndex: 1299,

    animation: 'scoringInfoMenuIn 140ms ease-out',

    '@keyframes scoringInfoMenuIn': {
      from: {
        opacity: 0,
        transform: 'translate(-50%, calc(-50% + 6px)) scale(0.98)',
      },
      to: {
        opacity: 1,
        transform: 'translate(-50%, -50%) scale(1)',
      },
    },
  },

  infoMenuTop: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 0.75,
    mb: 0.65,
  },

  infoMenuHead: {
    display: 'grid',
    gap: 0.15,
    minWidth: 0,
    flex: 1,
  },

  infoMenuTitle: {
    fontWeight: 700,
    lineHeight: 1.25,
  },

  infoMenuSubtitle: {
    color: 'text.tertiary',
    lineHeight: 1.35,
  },

  infoMenuClose: {
    flexShrink: 0,
    minWidth: 26,
    minHeight: 26,
    p: 0.25,
    mt: -0.25,
    color: 'text.tertiary',

    '&:hover': {
      bgcolor: 'background.level1',
      color: 'text.primary',
    },
  },

  infoMenuBody: {
    maxHeight: 270,
    overflow: 'auto',
  },
}
