// ui/patterns/insights/ui/sx/menuInfo.sx.js

export const menuInfoSx = {
  button: {
    justifySelf: 'start',
    minHeight: 24,
    px: 0.5,
    fontWeight: 700,
  },

  menu: {
    maxWidth: 340,
    p: 0.5,
    borderRadius: 12,
  },

  item: {
    alignItems: 'flex-start',
    borderRadius: 10,
    px: 0.9,
    py: 0.75,
  },

  itemContent: {
    display: 'grid',
    gap: 0.2,
    minWidth: 0,
  },

  labelPrimary: {
    fontWeight: 700,
    lineHeight: 1.25,
    color: 'text.primary',
  },

  label: {
    fontWeight: 700,
    lineHeight: 1.25,
    color: 'text.secondary',
  },

  text: {
    color: 'text.secondary',
    lineHeight: 1.45,
  },
}
