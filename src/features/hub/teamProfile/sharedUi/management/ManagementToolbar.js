// teamProfile/sharedUi/management/ManagementToolbar.js

import React from 'react'
import { Box, Button, Chip, IconButton, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { toolbarSx as sx } from './sx/toolbar.sx.js'

export default function ManagementToolbar({
  activeTab,
  isDirty,
  canSave,
  pending,
  isEditing = true,
  onEdit,
  onReset,
  onSave,
  extraActions = null,
  isMobile = false,
}) {
  const nonShow = activeTab.id === 'roles'
  const showStatus = !nonShow && !isMobile && isEditing
  const showEditButton = activeTab.id === 'info' && !isEditing

  return (
    <Box sx={sx.toolbar(nonShow, isMobile)}>
      <Box sx={sx.titleArea}>
        <Box sx={sx.headerDot} />

        <Typography level='title-sm' sx={sx.title(isMobile)} noWrap>
          {activeTab?.labelH || 'ניהול'}
        </Typography>

        {showStatus && (
          <Box sx={sx.statusWrap}>
            {isDirty ? (
              <Chip size='sm' variant='soft' color='warning'>
                לא נשמר
              </Chip>
            ) : (
              <Chip size='sm' variant='soft' color='neutral'>
                שמור
              </Chip>
            )}
          </Box>
        )}
      </Box>

      {!nonShow && (
        <Box sx={sx.toolbarActions(isMobile)}>
          {extraActions}

          {showEditButton ? (
            isMobile ? (
              <IconButton
                size='sm'
                variant='soft'
                color='neutral'
                disabled={pending}
                onClick={onEdit}
                sx={sx.secondaryAction}
              >
                {iconUi({ id: 'edit' })}
              </IconButton>
            ) : (
              <Button
                size='sm'
                variant='soft'
                color='neutral'
                disabled={pending}
                onClick={onEdit}
                startDecorator={iconUi({ id: 'edit' })}
                sx={sx.secondaryAction}
              >
                עריכה
              </Button>
            )
          ) : (
            <>
              {isMobile ? (
                <IconButton
                  size='sm'
                  variant='soft'
                  color='neutral'
                  disabled={pending}
                  onClick={onReset}
                  sx={sx.secondaryAction}
                >
                  {iconUi({ id: 'reset' })}
                </IconButton>
              ) : (
                <Button
                  size='sm'
                  variant='soft'
                  color='neutral'
                  disabled={pending}
                  onClick={onReset}
                  startDecorator={iconUi({ id: 'reset' })}
                  sx={sx.secondaryAction}
                >
                  ביטול
                </Button>
              )}

              {isMobile ? (
                <IconButton
                  size='sm'
                  variant='solid'
                  disabled={!canSave}
                  loading={pending}
                  onClick={onSave}
                  sx={sx.saveAction(canSave)}
                >
                  {iconUi({ id: 'save' })}
                </IconButton>
              ) : (
                <Button
                  size='sm'
                  variant='solid'
                  disabled={!canSave}
                  loading={pending}
                  onClick={onSave}
                  sx={sx.saveAction(canSave)}
                  startDecorator={iconUi({ id: 'save' })}
                >
                  שמירה
                </Button>
              )}
            </>
          )}
        </Box>
      )}
    </Box>
  )
}
