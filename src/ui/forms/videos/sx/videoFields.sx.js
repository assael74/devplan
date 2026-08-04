// ui/forms/videos/sx/videoFields.sx.js

export const videoFieldsSx = {
  root: {
    display: 'grid',
    gap: 1,
    minHeight: 0,
  },

  block: {
    display: 'grid',
    gap: 0.5,
    minWidth: 0,
  },

  pair: {
    display: 'grid',
    gap: 1,
    minWidth: 0,
    gridTemplateColumns: {
      xs: '1fr',
      sm: '1fr 1fr',
    },
  },

  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
  },

  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
  },

  divider: {
    my: 1.25,
  },

  dividerText: {
    opacity: 0.75,
  },
}
