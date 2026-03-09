import EditRoundedIcon from '@mui/icons-material/EditRounded';
/// PlayerPaymentsTab
export const boxPanelProps = {
  sx: {
    px: { xs: 0, md: 2 },
    minHeight: {md: '60vh' , xs: '77vh'} ,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  }
}

export const tabListProps = {
  sx: {
    width: '100%',
    mx: 'auto',
    display: 'flex',
    justifyContent: 'flex-start',
    gap: 4,
    px: 2,
    py: 1,
    mb: 1
  }
}

export const tabsBoxProps = {
  sx: {
    position: 'fixed',
    bottom: 0,
    left: 'auto',
    right: 'auto',
    maxWidth: {md: 1090, xs: 350},
    width: '100%',
    mx: 'auto',
    backgroundColor: 'background.surface',
    boxShadow: '0 -4px 16px rgba(0,0,0,0.08)',
    borderTop: '1px solid',
    borderColor: 'divider',
    zIndex: 1200,
    borderRadius: 'xl',
  }
}

export const tabSx = (isSelected) => (theme) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 0.5,
  color: isSelected ? theme.vars.palette.primary[600] : undefined,
  borderBottom: isSelected ? `2px solid ${theme.vars.palette.primary[500]}` : '2px solid transparent',
  transition: 'all 0.2s ease-in-out',
});

export const boxSortProps = {
  sx: {
    display: 'flex',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 2,
  }
}

/// ParentCardList
export const parentCardProps = {
  variant:"outlined",
  sx:{
    width: { xs: '100%', sm: 280 },
    p: 2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderColor: '#cce0dd',
    borderRadius: 'lg',
    boxShadow: 'sm',
  }
}

export const buttEditProps = {
  variant:"soft",
  color:"primary",
  size:"sm",
  startDecorator:<EditRoundedIcon />,
  sx:{ mt: 1, width: 200, ml: 1 }
}

export const addCardProps = {
  variant:"soft",
  sx:{
    width: { xs: '100%', sm: 280 },
    p: 2,
    display: 'flex',
    gap: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    border: '2px dashed #b2dfdb',
    color: 'neutral.600',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      borderColor: 'primary.400',
      backgroundColor: 'primary.softHoverBg',
    },
  }
}

export const deleteButtProps = {
  variant:"soft",
  color:"danger",
  size:"sm",
  sx: { mt: 1, width: 150, mr: 1 }
}
