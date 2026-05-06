export const modalSx = {
  root: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 1,
    p: 1.25,
    borderRadius: 14,
    bgcolor: 'background.level1',
    border: '1px dashed',
    borderColor: 'divider',
  },

  icon: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'background.surface',
    color: 'text.tertiary',
    flexShrink: 0,
  },

  content: {
    minWidth: 0,
    display: 'grid',
    gap: 0.25,
  },

  title: {
    fontWeight: 700,
    color: 'text.secondary',
    lineHeight: 1.35,
  },

  text: {
    color: 'text.tertiary',
    lineHeight: 1.45,
  },
}
