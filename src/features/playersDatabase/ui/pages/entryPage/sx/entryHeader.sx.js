// features/playersDatabase/ui/pages/entryPage/sx/EntryHeader.sx.js

export const entryHeaderSx = {
  header: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: '520px minmax(0, 1fr)',
    },
    gridTemplateAreas: {
      xs: `
        "content"
        "visual"
      `,
      lg: '"content visual"',
    },
    gap: 2,
    alignItems: 'center',
  },

  headerContent: {
    gridArea: 'content',
    width: '100%',
    minWidth: 0,
    alignItems: 'flex-start',
    justifySelf: 'stretch',
    textAlign: 'left',
  },

  headerVisual: {
    gridArea: 'visual',
    width: '100%',
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  scoutIqImage: {
    width: {
      xs: 'min(100%, 410px)',
      md: 460,
    },
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
    objectFit: 'contain',
  },
}