
/// LoadingCardContainer
export const chipLoadProps = {
  color:"neutral",
  variant:"soft",
  size:"sm",
  sx: {
    minWidth: 70,
    height: 24, // גובה אחיד
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    px: 1,
    pb: 2.2,
    pl: 2,
  }
}

export const cardLoadProps = (isMobile, type) => {
  const height = () => {
    if (type === 'clubs') {
      return isMobile ? 135 : 100
    } else if (type === 'teams') {
      return isMobile ? 135 : 100
    } else if (type === 'players') {
      return isMobile ? 160 : 115
    } else if (type === 'payments') {
      return isMobile ? 165 : 120
    } else {
      return isMobile ? 135 : 90
    }
  }
  return {
    variant: "outlined",
    sx: {
      width: '100%',
      display: 'flex',
      height: height(),
      overflow: 'hidden',
      flexDirection: 'column',
      gap: 1,
      p: isMobile ? 1.5 : 2,
      borderRadius: 'lg',
      boxShadow: 'sm',
      cursor: 'wait',
    }
  }
}

export const boxCardLoadProps = (isMobile) => {
  return {
    sx: {
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      alignItems: isMobile ? 'stretch' : 'center',
      justifyContent: 'flex-start',
      gap: 1,
      position: 'relative',
      flexWrap: 'wrap',
    }
  }
}

export const boxTitleLoadProps = (flexBasis) => {
  return {
    sx: {
      flexBasis: flexBasis.name,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    }
  }
}

export const typoTitleLoadProps = {
  level:"title-md",
  dir:"rtl",
  sx:{
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }
}

export const boxChipsLoadProps = (flexBasis) => {
  return {
    sx: {
      flexBasis: flexBasis.chips,
      display: 'flex',
      flexWrap: 'wrap',
      gap: 1,
      overflow: 'hidden',
      justifyContent: 'flex-start',
    }
  }
}
