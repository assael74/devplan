// modules/payments/ParentsTab.sx.js

export const addCardProps = {
  variant:"soft",
  sx:{
    width: { xs: '100%', sm: 280 },
    p: 2,
    display: 'flex',
    gap: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    border: '2px dashed #b2dfdb',
    color: 'neutral.600',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      borderColor: 'primary.400',
      backgroundColor: 'primary.softHoverBg',
    },
  }
}
