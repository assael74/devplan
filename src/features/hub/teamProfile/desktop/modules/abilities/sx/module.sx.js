// teamProfile/desktop/modules/abilities/sx/module.sx.js

export const moduleSx = {
  toolbarWrap: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 0.3,
    flex: 1,
    minHeight: 0,
    position: 'relative',
    overflowY: 'visible',
    height: 'auto',
  },

  sticky: {
    position: 'sticky',
    top: -10,
    zIndex: 40,
    backgroundColor: 'background.body',
    pt: 1.25,
    pb: 0.75,
    borderBottom: '1px solid',
    borderColor: 'divider',
  },

  boxDomain: {
    height: '100%',
    p: 0.9,
    borderRadius: 'md',
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

  domainCard: {
    height: '100%',
    borderRadius: 'md',
    bgcolor: 'background.surface',
    transition: 'border-color 120ms ease, box-shadow 120ms ease',
    '&:hover': {
      boxShadow: 'sm',
      borderColor: 'primary.outlinedBorder',
    },
  },

  domainTitle: {
    color: 'text.primary',
    fontWeight: 700,
  },

  domainAvgCircle: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  domainEmpty: {
    mt: 1,
    p: 1,
    borderRadius: 'sm',
    bgcolor: 'neutral.softBg',
  }
}
