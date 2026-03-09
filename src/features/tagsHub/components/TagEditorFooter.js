// src/features/tagsHub/components/TagEditorFooter.js
import React from 'react'
import { Box, Button, IconButton } from '@mui/joy'
import { iconUi } from '../../../ui/core/icons/iconUi'
import { localSx } from './TagEditor.sx.js'

export default function TagEditorFooter({
  isGroup,
  childrenCount,
  dirty,
  pending,
  valid,
  blockTypeChange,
  typeColor,
  idColor,
  onDelete,
  onReset,
  onClose,
  onSave,
}) {
  const deleteDisabled = pending || (isGroup && childrenCount > 0)

  return (
    <Box sx={localSx.footer}>
      <Box sx={localSx.footerBottom}>
        <Button
          variant="outlined"
          color="danger"
          startDecorator={iconUi({ id: 'delete' })}
          sx={localSx.dangerBtn}
          disabled={deleteDisabled}
          onClick={onDelete}
        >
          {isGroup ? 'מחיקת קטגוריה' : 'מחיקת תג'}
        </Button>
        <IconButton variant="soft" color="neutral" onClick={onReset} disabled={!dirty || pending}>
          {iconUi({id: 'reset'})}
        </IconButton>
        <Button variant="outlined" onClick={onClose} disabled={pending}>
          סגור
        </Button>

        <Button
          variant="solid"
          disabled={!dirty || pending || !valid || blockTypeChange}
          loading={pending}
          loadingPosition="center"
          onClick={onSave}
          startDecorator={iconUi({ id: idColor })}
          sx={localSx.confirmBtn(typeColor)}
        >
          שמור
        </Button>
      </Box>
    </Box>
  )
}
