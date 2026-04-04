
export const typeSx = {
  sheet: (value, type, size) => {
    const width = size === 'sm' ? 65 : 85
    const height = size === 'sm' ? 25 : 32
    return ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      px: 0.5,
      py: 0.5,
      pl: size === 'sm' ? 0.5 : 1,
      minHeight: height,
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
    })
  },

  stack: {
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 'md',
    p: 0.5,
    width: 'fit-content',
    bgcolor: 'background.level1',
    justifyContent: 'center',
    alignItems: 'center'
  }
}
