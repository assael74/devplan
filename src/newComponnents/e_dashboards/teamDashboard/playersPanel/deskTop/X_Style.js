/// A_DeskTopPlayersList
export const tablProps = {
  variant: "outlined",
  stickyHeader: true,
  sx: {
    minWidth: 900,
    borderRadius: 'md',
    '& thead th': {
      backgroundColor: '#f5f5f5',
      textAlign: 'center',
      fontWeight: 'bold',
    },
    '& td': {
      textAlign: 'center',
    },
  }
}

export const boxPlaProps = (goToPlayer, player) => ({
  component: "tr",
  role: "button",
  tabIndex: 0,
  onKeyDown: (e) => (e.key === 'Enter' || e.key === ' ') && goToPlayer(player.id),
  sx: {
    cursor: 'pointer',
    userSelect: 'none',
    '& > td': { transition: 'background-color 120ms ease' },
    '&:hover > td': {
      backgroundColor: 'neutral.softBg',
    },
    '&:active > td': {
      backgroundColor: 'neutral.softActiveBg',
    },
    '& td:focus': { outline: 'none' },
    transition: 'background-color 120ms',
  }
})
