import { IconButton } from '@mui/joy';

/// MenuItemsContainer
export const menuProps = {
  size: "sm",
  placement:"left-start",
  sx: {
    py: 0.5,
    px: 0,
    minWidth: 150,
    maxHeight: 200,
    overflowY: 'auto',
    overflowX: 'hidden',
    zIndex: 1500,
    borderRadius: 'md',
    boxShadow: 'lg',
    scrollbarWidth: 'thin', // Firefox
    '&::-webkit-scrollbar': {
      width: 6,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(0,0,0,0.2)',
      borderRadius: 6,
    },
  },
}

export const menuButtonProps = {
  slots: { root: IconButton },
  slotProps: {
    root: {
      variant: 'plain',
      size: 'sm',
      sx: {
        backgroundColor: 'transparent',
      }
    }
  }
}

export const boxWraperProps = (bgc, textColor) => ({
  sx: {
    px: 2,
    py: 1,
    bgcolor: bgc,
    color: textColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #ddd',
    boxShadow: 'sm',
    borderRadius: '0 0 12px 12px',
    zIndex: 10,
    width: '100%',
  }
})

export const boxContProps = (isMobile) => ({
  sx: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row-reverse',
    flexGrow: 1,
    gap: isMobile ? 1 : 2,
    textAlign: isMobile ? 'center' : 'initial',
  }
})

export const boxStarProps = (isMobile) => ({
  sx: {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? 1 : 2,
    alignItems: 'center',
    justifyContent: 'center',
    mr: isMobile ? -3 : 0
  }
})
