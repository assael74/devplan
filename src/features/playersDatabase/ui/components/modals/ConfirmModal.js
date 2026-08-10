// src/features/playersDatabase/ui/components/modals/ConfirmModal.js

import * as React from 'react'
import { Typography } from '@mui/joy'

import RegularModal from './RegularModal.js'
import { confirmModalSx as sx } from './sx/confirmModal.sx.js'

export default function ConfirmModal({
  message,
  children,
  ...modalProps
}) {
  return (
    <RegularModal {...modalProps}>
      {message ? (
        <Typography level='body-sm' sx={sx.message}>
          {message}
        </Typography>
      ) : null}

      {children}
    </RegularModal>
  )
}
