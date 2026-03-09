/// GenericObjectLayout
export const boxWraperPanelProps = {
  sx: {
    height: { xs: '90vh', md: '90vh' },
    p: 1,
    overflowY: 'scroll',
    paddingBottom: 5,
    scrollbarGutter: 'stable',
    '::-webkit-scrollbar': {
      width: '1px',
    },
    '::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '::-webkit-scrollbar-thumb': {
      backgroundColor: '#aaa',
      borderRadius: '6px',
    },
    '::-webkit-scrollbar-thumb:hover': {
      backgroundColor: '#888',
    },
  }
}

export const boxAnimProps = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
  transition: { duration: 0.3 },
}
