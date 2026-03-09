import * as React from 'react';
import {
  Box,
  Drawer,
  Sheet,
  Typography,
  ModalClose,
  Divider,
} from '@mui/joy';

export default function MotionDrawer({
  open,
  setOpen,
  onClose,
  title = '',
  children,
  footer = null,
  anchor = 'bottom',
  size = 'md',
  isMobile = false,
}) {
  const handleClose = () => {
    onClose?.();
    setOpen?.(false);
  };

  return (
    <Drawer
      size={size}
      variant="plain"
      anchor={anchor}
      open={open}
      onClose={handleClose}
      slotProps={{
        content: {
          sx: {
            bgcolor: 'transparent',
            p: isMobile ? 0 : 3,
            boxShadow: 'none',
          },
        },
      }}
    >
      <Sheet
        sx={{
          borderRadius: 'md',
          height: isMobile ? '90dvh' : '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* כותרת */}
        <Box
          sx={{
            flexShrink: 0,
            px: 2,
            pt: 2,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {title && <Typography level="h5" fontWeight='lg'>{title}</Typography>}
          <ModalClose />
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* תוכן עם גלילה */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            px: 2,
            py: 1,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
        <Box sx={{ mx: 'auto', width: isMobile ? '100%' : 700 }}>
          {children}
        </Box>
        </Box>

        {/* כפתורים בתחתית */}
        {footer && (
          <Box
            sx={{
              flexShrink: 0,
              px: 2,
              py: 1,
              borderTop: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ mx: 'auto', width: isMobile ? '100%' : 700 }}>
              {footer}
            </Box>
          </Box>
        )}
      </Sheet>
    </Drawer>
  );
}
