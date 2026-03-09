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

export const boxSortProps = (tabValue) => ({
  sx: {
    //mt: tabValue === 0 ? -6 : 1,
    display: 'flex',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 2,
  }
})

export const buttonSortAddProps = (tabValue) => ({
  sx: {
    opacity: tabValue === 1 ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
  }
})

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
