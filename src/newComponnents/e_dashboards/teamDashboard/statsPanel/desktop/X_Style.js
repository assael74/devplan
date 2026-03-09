import { iconUi } from '../../../../b_styleObjects/icons/IconIndex';
///
export const boxHeaderProps = {
  sx: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    mb: 2,
    gap: 0.5,
    borderBottom: '2px solid',
    borderColor: 'divider',
    pb: 1,
  }
}

export const typoHeadProps = (id) => ({
  level: id === 1 ? "h4" : 'body-sm',
  sx: {
    fontWeight: id === 1 ? 'bold' : '',
    fontSize: id === 1 ? '1.25rem' : '0.85rem',
    color: id === 1 ? 'text.primary' : 'text.secondary',
    display: 'flex',
    alignItems: 'center',
    p: 0.5,
    ml: id === 1 ? -1.5 : 0,
    mr: id === 2 ? -1.5 : 0,
    mt: id === 2 ? 0.5 : 0
  },
  startDecorator: iconUi('stats')
})

export const sheetHeaderProps = {
  varian: "outlined",
  sx: {
    px: 3,
    borderRadius: 'lg',
    textAlign: 'center',
    bgcolor: '#f9f9f9',
    borderRight: `6px solid #e0e0e0`,
    boxShadow: 'sm',
    minHeight: 75,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  }
}

export const sheetDisplayProps = (boxColor) => ({
  variant: "outlined",
  sx: {
    p: 1,
    borderRadius: 'lg',
    textAlign: 'center',
    bgcolor: '#f9f9f9',
    borderRight: `6px solid #e0e0e0`,
    boxShadow: 'sm',
    minHeight: 75,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  }
})

export const typoDisplayProps = (icon) => ({
  level: "body-xs",
  endDecorator : icon,
  sx: {
    color: 'text.secondary',
    mb: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 0.5,
    fontSize: '0.75rem',
  }
})

export const tableProps = {
  size:"sm",
  variant:"outlined",
  borderAxis:"both",
  stickyHeader: true,
  sx: {
    '--TableCell-paddingX': '6px',
    borderRadius: 8,
    width: '100%',
    '& th, & td': {
      textAlign: 'center',
      whiteSpace: 'nowrap',
      fontSize: { xs: '0.75rem', md: '0.875rem' },
      //padding: '4px 8px',
    },
  }
}

export const boxWarperProps = {
  sx: {
    minWidth: 370,
    minHeight: 0,
    height: '57dvh',
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#c1c1c1',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: '#a0a0a0',
    },
  }
}
