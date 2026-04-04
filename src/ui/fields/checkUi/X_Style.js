/// MeetingTypeSelector
export const radioProps = {
  variant: "outlined",
  size: "md",
  sx: {
    '--Radio-size': '22px',
    '--Radio-gap': '8px',
    bgcolor: '#fff',
    borderRadius: '50%',
  }
}

export const optionBoxProps = (option, isSelected) => {
  return {
    sx: {
      borderRadius: 'md',
      p: 1,
      px: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: option.disabled ? 'not-allowed' : 'pointer',
      opacity: option.disabled ? 0.6 : 1,
      bgcolor: option.disabled
        ? 'neutral.softDisabledBg'
        : isSelected
        ? 'primary.softActiveBg'
        : 'neutral.softBg',
      border: isSelected ? '1px solid' : 'none',
      borderColor: isSelected ? 'primary.solidBg' : undefined,
      transition: 'background-color 0.2s ease, border 0.2s ease',
      '&:hover': {
        bgcolor:
          !option.disabled &&
          (isSelected ? 'primary.softActiveBg' : 'neutral.softHoverBg'),
      },
    }
  }
}

/// TeamProjectSelector
export const chipProjProps = {
  sx: {
    cursor: 'pointer',
    fontWeight: 'md',
    px: 1,
    py: 0.5,
    borderRadius: 'lg',
    fontSize: 'sm',
  }
}

/// TeamActiveSelector
export const chipActiveProps = {
  sx: {
    cursor: 'pointer',
    fontWeight: 'md',
    px: 1,
    py: 0.5,
    borderRadius: 'lg',
    fontSize: 'sm',
  }
}

export const chipTypeProps = {
  sx: {
    cursor: 'pointer',
    fontWeight: 'md',
    px: 0.5,
    py: 0.5,
    borderRadius: 'sm',
    fontSize: 'xs',
    minWidth: '100%'
  }
}

///
export const optionSheetProps1 = (isMobile, variant, color, isCurrent) => {
  return {
    variant: variant,
    color: color,
    sx: {
      width: isMobile ? 90 : 135,
      px: 1.5,
      py: 1,
      textAlign: 'center',
      borderRadius: 'md',
      cursor: 'pointer',
      boxShadow: isCurrent ? 'md' : 'sm',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 0.5,
      position: 'relative',
      transform: isCurrent ? 'scale(1.05)' : 'scale(1)',
      transition: 'all 0.3s ease-in-out',
      animation: isCurrent ? 'pulse 0.3s ease' : 'none',
      '@keyframes pulse': {
        '0%': { transform: 'scale(1)' },
        '50%': { transform: 'scale(1.05)' },
        '100%': { transform: 'scale(1)' },
      },
    }
  }
}
