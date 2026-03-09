import React, { useState } from 'react';
import { Box, Drawer } from '@mui/joy';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Stack from '@mui/joy/Stack';
import EditImageCard from '../../g_quickForms/imageUpload/EditImageCard.js';

export default function EditImageDrawer({ open, onClose, item, type = 'team', onEdit }) {
  const [updated, setUpdated] = useState({ ...item });
  const [resetSignal, setResetSignal] = useState(0);

  const handleSave = () => {
    onEdit(updated);
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor="bottom"
      sx={[
        open
          ? {
              '--Drawer-transitionDuration': '0.4s',
              '--Drawer-transitionFunction': 'cubic-bezier(0.79,0.14,0.15,0.86)',
            }
          : {
              '--Drawer-transitionDuration': '0.2s',
              '--Drawer-transitionFunction': 'cubic-bezier(0.77,0,0.18,1)',
            },
      ]}
      slotProps={{
        content: {
          sx: {
            height: '100%',
            maxHeight: '100vh',
          },
        },
      }}
    >
      <Box
        sx={{
          p: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: { xs: '100%', sm: 500, md: 580 },
          mx: 'auto',
        }}
      >
        <Typography level="h4" sx={{ mb: 3 }}>
          עריכת תמונה
        </Typography>

        <EditImageCard
          value={updated}
          onChange={setUpdated}
          type={type}
          resetSignal={resetSignal}
        />

        <Stack direction="row" spacing={2} sx={{ mt: 'auto', pt: 2, width: '100%' }}>
          <Button variant="outlined" fullWidth onClick={onClose}>
            ביטול
          </Button>
          <Button variant="solid" color="primary" fullWidth onClick={handleSave}>
            שמור
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
