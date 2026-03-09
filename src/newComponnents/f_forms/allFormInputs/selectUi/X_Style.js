
export const boxStaffProps = (staff) => {
  return {
    sx: {
      display: "flex",
      alignItems: "center",
      gap: 1,
      borderBottom: "1px solid #eee",
      pb: 0.5,
      px: 1,
      py: 0.5,
      borderRadius: "sm",
      backgroundColor:
        staff.fullName.trim() === "" ? "#f9f9f9" : "transparent",
      flexWrap: "wrap",
    }
  }
}

/// PlayerPositionFieldPitch
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

/// MeetingSelectField
export const renderOptionStyle = {
  component: "li",
  sx: {
    display: 'flex',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 1.5,
    px: 1,
    py: 0.5,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: 'background.level2',
    }
  }
}

export const autoSlotProps = {
  listbox: {
    sx: {
      maxHeight: 200,
      overflowY: 'auto',
      borderRadius: 'md',
      px: 1,
      '&::-webkit-scrollbar': {
        width: 6,
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 6,
      }
    }
  }
}

/// GameSelectField
export const boxWraperFilterProps = {
  sx: {
    p: 0.5,
    mb: 0.5,
    borderRadius: 'md',
    bgcolor: 'neutral.softBg',
    border: '1px solid',
    borderColor: 'neutral.outlinedBorder',
    display: 'flex',
    gap:1
  }
}

export const selectFilterProps = {
  size: "sm",
  indicator: "▼",
  sx: { minWidth: 130 },
  slotProps: { button: { sx: { fontSize: '12px' } } },
}
