import { IconButton } from '@mui/joy';
import { typeBackground } from '../b_styleObjects/Colors.js'
import { keyframes } from '@mui/system';

const inAnimation = keyframes`
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const outAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
`;

export const drawerConsProps = (open, setOpen) => ({
  size:"md",
  variant:"plain",
  open: open,
  anchor:'bottom',
  onClose: (e) => {
    e.stopPropagation()
    setOpen(false)
  },
  sx: { mr: { md: 1 } },
  slotProps:{
    content: {
      sx: {
        bgcolor: 'transparent',
        p: { md: 3 },
        boxShadow: 'none',
        width: '100%',
        height: 'auto',
        maxHeight: '85vh',
        overflowY: 'auto',
      },
    },
  }
})

export const modalProps = (open, isMobile) => ({
  'aria-labelledby': 'modal-dialog',
  layout:'center',
  autoHideDuration: 4000,
  animationDuration: 600,
  sx: [
    {
      width: isMobile ? '100%' : 600,
      position: 'absolute',
      top: isMobile ? '10%' : '15%',
      left: isMobile ? '5%' : '30%',
    },
    open && {
      animation: `${inAnimation} ${600}ms forwards`,
    },
    !open && {
      animation: `${outAnimation} ${600}ms forwards`,
    },
  ]
})

export const menuButtonProps = (isMobile) => ({
  slots: { root: IconButton },
  slotProps: {
    root: {
      variant: 'plain',
      size: isMobile ? 'sm' : 'md',
      sx: {
        minWidth: isMobile ? 24 : 32,
        height: isMobile ? 24 : 32,
        padding: isMobile ? '2px' : '6px',
        fontSize: isMobile ? '16px' : '20px',
        backgroundColor: 'transparent',
      }
    }
  }
})

export const clearButtProps = {
  size:"md",
  variant:"solid",
  color:"neutral",
  sx:{ borderRadius: 'md' }
}

export const sheetWraperMoadlProps = {
  dir:"rtl",
  sx: {
    borderRadius: 'md',
    p: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  }
}

export const titleTypoProps = (type, isMobile) => ({
    component: "p",
    sx: {
      fontWeight: 'lg',
      fontSize: isMobile ? '15px' : '17px',
      color: typeBackground[type].text,
      lineHeight: 1.3,
      letterSpacing: 0.5,
    }
})
