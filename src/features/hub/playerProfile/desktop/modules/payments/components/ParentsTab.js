// playerProfile/desktop/modules/payments/components/ParentsTab.js

import React, { useState } from 'react'
import { Box, Card, Typography, Button, Divider, Stack } from '@mui/joy'
import AddRoundedIcon from '@mui/icons-material/AddRounded'

import ParentFormModal from './ParentFormModal'
import { cardSx as sx } from '../sx/ParentsTab.sx.js'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { formatPhoneNumber } from '../../../../../../../shared/format/contactUtiles.js'

import { usePlayerHubUpdate } from '../../../../../hooks/players/usePlayerHubUpdate.js'

import {
  buildParentEditInitial,
  buildParentsPlayerPatch,
  buildRemoveParentPlayerPatch,
  getCanCreateParent,
} from '../../../../../editLogic/payments/index.js'

export default function ParentsTab({ player }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(null)

  const { run, pending } = usePlayerHubUpdate(player)

  const parents = Array.isArray(player?.parents) ? player.parents : []
  const canCreateParent = getCanCreateParent(parents)

  const handleClose = () => {
    if (pending) return

    setOpen(false)
    setDraft(null)
  }

  const handleAdd = () => {
    if (pending || !canCreateParent) return

    setDraft(buildParentEditInitial(null))
    setOpen(true)
  }

  const handleEdit = (parent) => {
    if (pending) return

    setDraft(buildParentEditInitial(parent))
    setOpen(true)
  }

  const handleDelete = async (parentToDelete) => {
    if (pending || !parentToDelete?.id) return

    const patch = buildRemoveParentPlayerPatch({
      parents,
      parentId: parentToDelete.id,
    })

    await run('playerParentsEdit', patch, {
      section: 'playerParents',
      playerId: player?.id,
      createIfMissing: false,
    })
  }

  const handleSubmit = async (formData) => {
    if (pending) return

    const patch = buildParentsPlayerPatch({
      player,
      parents,
      draft: formData,
      editingId: formData?.id || draft?.id || '',
    })

    await run('playerParentsEdit', patch, {
      section: 'playerParents',
      playerId: player?.id,
      createIfMissing: true,
    })

    setOpen(false)
    setDraft(null)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {canCreateParent ? (
          <Card
            variant="soft"
            sx={sx.addCard}
            onClick={handleAdd}
          >
            <AddRoundedIcon sx={{ fontSize: '3rem', opacity: 0.3 }} />

            <Typography level="title-md">
              הוסף הורה
            </Typography>
          </Card>
        ) : null}

        {parents.map((parent) => {
          const parentPhone = formatPhoneNumber(parent?.parentPhone) || 'לא עודכן נייד'

          return (
            <Card
              key={parent.id}
              variant="outlined"
              sx={{ width: 300, p: 1, boxShadow: 'sm' }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography level="title-lg" sx={{ fontWeight: 700 }} noWrap>
                    {parent?.parentName || 'הורה'}
                  </Typography>

                  <Typography level="body-xs" sx={{ opacity: 0.7 }} noWrap>
                    {parent?.parentRole || 'תפקיד לא הוגדר'}
                  </Typography>
                </Box>

                <Stack spacing={1} sx={{ minWidth: 0 }}>
                  <Typography level="body-sm" startDecorator={iconUi({ id: 'email' })} noWrap>
                    {parent?.parentEmail || 'אין אימייל'}
                  </Typography>

                  <Typography level="body-sm" startDecorator={iconUi({ id: 'phone' })} noWrap>
                    {parentPhone}
                  </Typography>
                </Stack>
              </Box>

              <Divider inset="none" sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-start', mt: 'auto' }}>
                <Button
                  size="sm"
                  variant="outlined"
                  color="danger"
                  onClick={() => handleDelete(parent)}
                  loading={pending}
                  disabled={pending}
                >
                  מחק
                </Button>

                <Button
                  size="sm"
                  variant="solid"
                  onClick={() => handleEdit(parent)}
                  disabled={pending}
                  startDecorator={iconUi({ id: 'edit' })}
                  sx={sx.conBut}
                >
                  ערוך
                </Button>
              </Box>
            </Card>
          )
        })}
      </Box>

      <ParentFormModal
        open={open}
        onClose={handleClose}
        initialData={draft}
        saving={pending}
        onSubmit={handleSubmit}
      />
    </Box>
  )
}
