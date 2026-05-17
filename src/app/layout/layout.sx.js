

export const layoutSx = {
  mobWrap: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    bgcolor: 'background.body',
  },

  mobSecondWrap: {
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    zIndex: 1200,
    width: '100%',
    bgcolor: 'background.body',
    borderBottom: '1px solid',
    borderColor: 'divider',
  },

  mobOutWrap: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    py: { xs: 0, sm: 1 },
    px: { xs: 0, sm: 1 },
    bgcolor: 'background.level1',
  },

  mobSecondOutWrap: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    bgcolor: 'background.body',
    borderRadius: 'lg',
    border: '1px solid',
    borderColor: 'divider',
    py: { xs: 0, sm: 1 },
    px: { xs: 0, sm: 1 },
  },

  desWrap: {
    position: 'sticky',
    top: 0,
    zIndex: 1200,
    width: '100%',
    bgcolor: 'background.body',
    borderBottom: '1px solid',
    borderColor: 'divider',
  },

  desSeconWrap: (sideWidth) => ({
    width: sideWidth,
    flex: `0 0 ${sideWidth}px`,
    transition: 'width 180ms ease',
    borderRight: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.body',
    overflow: 'hidden',
    boxShadow: 'sm',
  }),

  boxMain: {
    bgcolor: 'background.body',
    borderRadius: 'lg',
    border: '1px solid',
    borderColor: 'divider',
    minHeight: 'calc(100vh - 88px)',
    p: { xs: 1, sm: 1 },
  }
}
