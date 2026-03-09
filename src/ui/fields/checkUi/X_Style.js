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

/// PaymentStatusSteps + MeetingStatusSteps
export const optionSheetProps = (isMobile, variant, color, isCurrent) => {
  return {
    variant: variant,
    color: color,
    sx: {
      width: isMobile ? 80 : 125,
      px: 1.5,
      py: isMobile ? 1 : 1,
      textAlign: 'center',
      borderRadius: 'md',
      cursor: 'pointer',
      boxShadow: isCurrent ? 'md' : 'sm',
      transition: 'all 0.3s ease-in-out',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 0.5,
      position: 'relative',
      transform: isCurrent ? 'scale(1.05)' : 'scale(1)',
      animation: isCurrent ? 'pulse 0.3s ease' : 'none',
      '@keyframes pulse': {
        '0%': { transform: 'scale(1)' },
        '50%': { transform: 'scale(1.05)' },
        '100%': { transform: 'scale(1)' },
      },
    }
  }
}

export const boxSheetProps = (color) => {
  return {
    sx: {
      position: 'absolute',
      top: 4,
      left: 6,
      fontSize: '11px',
      color: color === 'danger' ? 'primary.solidColor' : 'text.secondary',
      fontWeight: 'lg'
    }
  }
}

/// PaymentTypeSelector
export const radioPayProps = {
  variant: "outlined",
  size: "md",
  sx: {
    '--Radio-size': '22px',
    '--Radio-gap': '8px',
    bgcolor: '#fff',
    borderRadius: '50%',
  }
}

export const optionPayBoxProps = (option, isSelected) => {
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

/// PlayerTypeSelector
export const optionPlayerProps = (value, type, size) => {
  const width = size === 'sm' ? 65 : 85
  return {
    variant: "outlined",
    sx: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      px: 0.5,
      py: 0.5,
      pl: size === 'sm' ? 0.5 : 1,
      minHeight: 32,
      minWidth: width,
      width: width,
      mx: { xs: 'auto', sm: 0 },
      textAlign: 'center',
      borderRadius: 'sm',
      cursor: 'pointer',
      boxShadow: value === type.id ? 'lg' : 'sm',
      borderColor: value === type.id ? 'success.solidBg' : 'neutral.outlinedBorder',
      bgcolor: value === type.id ? 'success.softBg' : 'background.surface',
      '&:hover': {
        bgcolor: 'success.plainHoverBg',
      },
      transition: 'all 0.2s ease-in-out',
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
