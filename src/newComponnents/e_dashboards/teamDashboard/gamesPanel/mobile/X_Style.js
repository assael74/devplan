/// MobilePlayersList
export const boxListProps = (player) => ({
  sx: {
    width: '100%',
    px: 1,
    py: 1.5,
    direction: 'rtl',
    cursor: 'pointer',
    borderBottom: '1px solid #eee',
    bgcolor: 'background.body',
    boxShadow: player.type === 'project' ? '-4px 0 8px -2px rgba(0, 128, 0, 0.4)' : 'none',
    borderRight: player.type === 'project' ? '4px solid #4caf50' : 'none',
    borderRadius: 'md',
    '&:hover': {
      backgroundColor: '#f9f9f9',
    },
  }
})

export const openPaymentProps = {
  sx: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: 'danger.500',
    zIndex: 1,
  }
}
