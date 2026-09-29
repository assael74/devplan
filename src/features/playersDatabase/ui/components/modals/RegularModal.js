// src/features/playersDatabase/ui/components/modals/RegularModal.js

import * as React from 'react'
import { Box } from '@mui/joy'

import { AnimatedModal } from '../../../../../ui/patterns/modals/index.js'
import { regularModalSx as sx } from './sx/regularModal.sx.js'

export default function RegularModal({
  children,
  headerActions = null,
  headerIconSx,
  contentSx,
  appearance = 'default',
  ...modalProps
}) {
  return (
    <AnimatedModal
      {...modalProps}
      contentSx={{
        ...sx.content,
        ...(contentSx || {}),
      }}
      headerSx={{
        ...sx.header,
        ...(appearance === 'destructive' ? sx.destructiveHeader : {}),
      }}
      headerIconSx={{
        ...(appearance === 'destructive' ? sx.destructiveHeaderIcon : {}),
        ...(headerIconSx || {}),
      }}
    >
      {headerActions ? (
        <Box sx={sx.headerActions}>
          {headerActions}
        </Box>
      ) : null}

      {children}
    </AnimatedModal>
  )
}
