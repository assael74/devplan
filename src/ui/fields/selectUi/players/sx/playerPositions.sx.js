// ui/fields/selectUi/players/playerPositions.sx.js
export const boxPositionProps = {
  sx: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    py: 2,
    minHeight: 300,
    borderRadius: 'lg',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: '#81c784',
  }
}

export const chipProps = (value, code) => {
  return {
    variant: value.includes(code) ? 'solid' : 'soft',
    color: value.includes(code) ? 'primary' : 'neutral',
    size: "lg",
    sx: {
      width: 80,
      height: 40,
      fontWeight: 'bold',
      fontSize: '14px',
      borderRadius: 'xl',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: value.includes(code)
        ? 'inset 0 0 6px rgba(0,0,0,0.3)'
        : 'none',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        bgcolor: value.includes(code)
          ? 'success.softActive'
          : 'neutral.softHover',
      },
    }
  }
}

export const layerBoxProps = (isFullWidthLayer) => {
  return {
    sx: {
      display: 'flex',
      justifyContent: isFullWidthLayer ? 'space-evenly' : 'center',
      gap: 2,
      mt: 0.5,
    }
  }
}
