// 📁 src/h_SnackBar/SnackbarProvider.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { iconUi } from '../../b_styleObjects/icons/IconIndex';
import { useTheme } from '@mui/joy/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Snackbar, Alert, Box, Typography } from '@mui/joy';
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

const SnackbarContext = createContext();

export function SnackbarProvider({ children }) {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    color: 'success',
    iconId: null,
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const animationDuration = 600;

  const showSnackbar = (message, color = 'success', iconId = null) => {
    setSnackbar({ open: true, message, color, iconId });
  };

  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const getColorByType = (color) => {
    switch (color) {
      case 'add':
        return 'success'; // ירוק
      case 'delete':
        return 'danger';  // אדום
      case 'update':
        return 'primary'; // כחול
      case 'error':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        size={isMobile ? 'sm' : 'md'}
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleClose}
        variant="solid"
        color={snackbar.color}
        animationDuration={animationDuration}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={[
          snackbar.open && {
            animation: `${inAnimation} ${animationDuration}ms forwards`,
          },
          !snackbar.open && {
            animation: `${outAnimation} ${animationDuration}ms forwards`,
          },
        ]}
      >
        <Box dir="rtl" sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
          {snackbar.iconId && iconUi({ id: snackbar.iconId, size: isMobile ? 'sm' : 'md' })}
          <Typography color="common.white" fontSize={isMobile ? '12px' : '14px'}>{snackbar.message}</Typography>
        </Box>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

export const useSnackbar = () => useContext(SnackbarContext);
