// ui/fields/checkUi/players/sx/check.sx.js

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

export const activeSx = {
  chip: (size) => ({
    cursor: 'pointer',
    fontWeight: 'md',
    px: size === 'xs' ? 0.5 : 1,
    py: size === 'xs' ? 0 : 0.5,
    borderRadius: size === 'xs' ? 'md' : 'lg',
    fontSize: size === 'xs' ? 'xs' : 'sm',
    minHeight: size === 'xs' ? 22 : undefined,
    gap: size === 'xs' ? 0.375 : undefined,
    '--Chip-decoratorChildHeight': size === 'xs' ? '12px' : undefined,
  }),
}
