import React from 'react';
import { Modal, Box, Sheet, Typography, IconButton } from '@mui/joy';
import { iconUi } from '../../b_styleObjects/icons/IconIndex';
import { motion, AnimatePresence } from 'framer-motion';

const MotionSheet = motion.create(Sheet);

export default function MotionModal({
  open,
  onClose,
  title,
  children,
  width = 500,
  noPadding = false,
}) {

  return (
    <AnimatePresence>
      {open && (
        <Modal open={true} onClose={onClose} keepMounted>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)', // מרכז מדויק ויציב
              width: '100%',
              maxWidth: width,
            }}
          >
            <MotionSheet
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              variant="outlined"
              sx={{
                borderRadius: 'md',
                width: '100%',
                bgcolor: '#fff',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '90vh',
                overflow: 'hidden',
                p: noPadding ? 0 : 2,
                boxShadow: 'lg',
              }}
            >
            {title && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                  mt: -2
                }}
              >
                <Typography level="h4" fontWeight="lg">
                  {title}
                </Typography>
              </Box>
            )}
              <Box sx={{ flex: 1, overflowY: 'auto', mt: !title ? -8 : 0 }}>
                {children}
              </Box>
            </MotionSheet>
          </Box>
        </Modal>
      )}
    </AnimatePresence>
  );
}
