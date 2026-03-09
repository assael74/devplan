import { IconButton } from '@mui/joy';
import videoPoster from '../b_styleObjects/images/videoPoster.jpg'

///DriveVideoPlayer
export const modalDialogProps = {
  sx: {
    width: '100%',
    maxWidth: 800,
    p: 0,
    borderRadius: 'md',
    overflow: 'hidden',
  }
}

export const iconFullScreenProps = {
  size: "sm",
  variant: "soft",
  sx: {
    position: 'absolute',
    bottom: 10,
    right: 20,
    zIndex: 10,
    color: '#fff',
  }
}

export const iconCopyProps = {
  size: "sm",
  variant: "soft",
  sx: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    zIndex: 10,
    color: '#fff',
  }
}

/// VideoActionsCell
export const thumbnailBoxProps = {
  component: "img",
  alt: "וידאו",
  onError: (e) => { e.target.onerror = null; e.target.src = videoPoster },
  sx: {
    width: '100%',
    height: { xs: 38, sm: 42, md: 46 },
    mt: 0.5,
    borderRadius: 'md',
    objectFit: 'cover',
    cursor: 'pointer',
    border: '1px solid',
    borderColor: 'divider',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
      transform: 'scale(1.02)',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
    },
  }
}

export const menuButtonProps = {
  slots: { root: IconButton },
  slotProps: {
    root: {
      size: 'sm',
      variant: 'plain',
      sx: {
        backgroundColor: 'transparent',
        padding: '2px',
        width: 24,
        height: 24,
        minWidth: 'unset',
        borderRadius: '50%',
        '&:hover': {
          backgroundColor: 'rgba(255,255,255,0.1)',
        },
      },
    },
  }
}
