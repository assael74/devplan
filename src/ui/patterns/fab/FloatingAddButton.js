import React, { useState } from 'react'
import { IconButton, Box, Tooltip } from '@mui/joy'
import AddIcon from '@mui/icons-material/Add'
import { fabSx } from './nav.sx'

export default function FloatingAddButton({
  formComponent: FormComponent,
  tooltipTitle = 'הוסף',
  onSave,
  entity,
  context,
  onEdit,
  onAdd,
}) {
  // --- סטייט פתיחה ---
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* --- כפתור צף --- */}
      <Box sx={fabSx.wrap}>
        <Tooltip title={tooltipTitle} placement="left">
          <IconButton size="lg" onClick={() => setOpen(true)} sx={fabSx.button}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* --- טופס דינמי --- */}
      {FormComponent && (
        <FormComponent
          open={open}
          setOpen={setOpen}
          entity={entity}
          context={context}
          onSave={onSave}
          onAdd={onAdd}
          onEdit={onEdit}
        />
      )}
    </>
  )
}
