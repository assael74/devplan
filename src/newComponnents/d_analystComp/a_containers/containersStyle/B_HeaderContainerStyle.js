
/// PageHeaderContainer
export const sheetIconProps = {
  variant: "outlined",
  sx: {
    borderRadius: 'md',
    px: 1,
    pt: 0.4,
    mr: 1,
    mt: 0.5,
    ml: 2,
    borderColor: 'primary.solidBg',
    boxShadow: 'lg',
  }
}

export const titleProps = (type) => ({
  level:"h1",
  component:"h1",
  sx: {
    fontSize: {
      xs: type === 'statsParm' ? '1rem' : '1.5rem', // במובייל קטן
      sm: '2rem',   // במסכים בינוניים
      md: '2.5rem'  // במסכים גדולים ומעלה
    }
  }
})

export const filterBoxProps = (isMobile) => ({
  sx: {
    width: isMobile ? 300 : 1200,
    my: 0.5,
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  }
})

export const boxSortingBox = (isBoth) => ({
  sx: {
    width: '100%',
    display: 'flex',
    justifyContent: isBoth ? 'space-between' : 'flex-end',
    alignItems: 'center',
  }
})

export const badgeProps = (hasActiveFilters) => {
  return {
    variant:"solid",
    color:"danger",
    invisible:!hasActiveFilters,
    anchorOrigin:{ vertical: 'top', horizontal: 'right' },
    badgeInset:"5%",
  }
}
