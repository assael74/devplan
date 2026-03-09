import { tabClasses } from '@mui/joy/Tab';

export const boxTabsProps = (isMobile) => ({
  sx: {
    position: 'fixed',
    bottom: 0,
    right: 0,
    left: isMobile ? 0 : 230,
    zIndex: 1000,
    bgcolor: '#f5f5f5',
    borderTop: '1px solid #ddd',
    boxShadow: '0 -2px 6px rgba(0,0,0,0.04)',
  }
})

export const tabListPorps = {
  sx:{
    p: 1,
    position: 'relative',
    display: 'flex',
    borderRadius: 'md',
  }
}

export const tabProps = (tabIndex, index) => {
  return {
    sx: {
      flex: 'unset',
      minWidth: '80px',
      flexDirection: 'column',
      py: 1,
      disableIndicator: true,
      fontSize: 'xs',
      color: tabIndex === index ? 'primary.plainColor' : 'neutral.600',
      '&:hover': { bgcolor: 'transparent' },
    }
  }
}
