import React, { useState } from 'react';
import { IconButton, Box, Tooltip } from '@mui/joy';
import AddIcon from '@mui/icons-material/Add';

export default function FloatingAddButton({
  formComponent: FormComponent,
  tooltipTitle = 'הוסף',
  onSaveAbilities,
  formProps,
  isMobile,
  player,
  onEdit,
  iconId,
  onAdd,
  view
}) {
  const [open, setOpen] = useState(false);
  //console.log(FormComponent)
  return (
    <>
      <Box sx={{ position: 'fixed', bottom: 40, right: 20, zIndex: 1300 }}>
        <Tooltip title={tooltipTitle} placement="left">
          <IconButton
            size="lg"
            onClick={() => setOpen(true)}
            sx={{
              bgcolor: '#03396c',
              color: '#ffffff',
              boxShadow: 'sm',
              borderRadius: 'lg',
              '&:hover': { bgcolor: '#03588c', boxShadow: 'md', transform: 'scale(1.08)' },
              '&:active': { transform: 'scale(0.96)' },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <AddIcon sx={{ color: '#ffffff' }} />
          </IconButton>
        </Tooltip>
      </Box>
      {FormComponent && (
        <FormComponent
          view={view}
          open={open}
          onAdd={onAdd}
          player={player}
          onEdit={onEdit}
          setOpen={setOpen}
          formProps={formProps}
          onSaveAbilities={onSaveAbilities}
         />
      )}
    </>
  );
}
