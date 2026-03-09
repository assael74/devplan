export const avatarBoxProps = (flexBasis) => {
  return {
    sx: {
      mt: 1,
      flexBasis: flexBasis.image,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }
  }
}

export const chipAvatarProps = (isMobile) => ({
  variant: "outlined",
  size: isMobile ? 'sm' : 'sm',
  sx: {
    mt: -1,
    ml: -0.5,
    width: isMobile ? 45 : 45,
    minWidth: isMobile ? 45 : 45,
    fontSize: isMobile ? '9px' : '9px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    direction: 'rtl',
    textAlign: 'center',
  }
})
