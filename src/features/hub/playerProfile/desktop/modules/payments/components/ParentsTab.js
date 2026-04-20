// playerProfile/desktop/modules/payments/components/ParentsTab.js

import React, { useState, useMemo } from 'react'
import { Box, Card, Typography, Button, Divider, Stack } from '@mui/joy'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import ParentFormModal from './ParentFormModal'
import { cardSx as sx } from '../sx/ParentsTab.sx.js'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { formatPhoneNumber } from '../../../../../../../shared/format/contactUtiles.js'

// חיבור להוקים ולוגיקה משותפת
import { usePlayerHubUpdate } from '../../../../../hooks/players/usePlayerHubUpdate.js'
import {
  buildParentInitialDraft,
  buildParentsUpdatePatch
} from '../../../../sharedLogic'

export default function ParentsTab({ player }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(null)

  // ההוק המרכזי לעדכון השחקן בפיירסטור
  const { run, pending } = usePlayerHubUpdate(player)
  const parents = Array.isArray(player?.parents) ? player.parents : []

  // פתיחת מודל ליצירה חדשה
  const handleAdd = () => {
    setDraft(buildParentInitialDraft(null))
    setOpen(true)
  }

  // פתיחת מודל לעריכה
  const handleEdit = (parent) => {
    setDraft(buildParentInitialDraft(parent))
    setOpen(true)
  }

  // מחיקת הורה - בניית פאץ' עם מערך מסונן ושליחה לפיירסטור
  const handleDelete = async (parentToDelete) => {
    if (!parentToDelete?.id) return

    const nextParents = parents.filter(p => p.id !== parentToDelete.id)

    await run({ parents: nextParents }, {
      section: 'playerParents',
      player,
      createIfMissing: false,
    })
  }

  // שמירה (עריכה או יצירה)
  const handleSubmit = async (formData) => {
    const nextParentsPatch = buildParentsUpdatePatch({
      player,
      parents,
      draft: formData,
      editingId: formData.id
    })

    await run(nextParentsPatch, {
      section: 'playerParents',
      player,
      createIfMissing: false,
    })

    setOpen(false)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {/* כרטיס הוספה - מוצג רק אם יש פחות מ-2 הורים */}
        {parents.length < 2 && (
          <Card
            variant="soft"
            sx={sx.addCard}
            onClick={!pending ? handleAdd : undefined}
          >
            <AddRoundedIcon sx={{ fontSize: '3rem', opacity: 0.3 }} />
            <Typography level="title-md">הוסף הורה</Typography>
          </Card>
        )}

        {/* רינדור כרטיסי ההורים */}
        {parents.map((p) => {
          const parentPhone = formatPhoneNumber(p.parentPhone) || 'לא עודכן נייד'

          return (
            <Card key={p.id} variant="outlined" sx={{ width: 300, p: 1, boxShadow: 'sm' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    <Typography level="title-lg" sx={{ fontWeight: 'md' }}>
                      {p.parentName || 'הורה'}
                    </Typography>
                    <Typography level="body-xs" sx={{ opacity: 0.7 }}>
                      {p.parentRole || 'תפקיד לא הוגדר'}
                    </Typography>
                  </Box>
                </Box>

                <Stack spacing={1} sx={{ my: 1.5 }}>
                  <Typography level="body-sm" startDecorator={iconUi({ id: 'email' })}>
                    {p.parentEmail || 'אין אימייל'}
                  </Typography>
                  <Typography level="body-sm" startDecorator={iconUi({ id: 'phone' })}>
                    {parentPhone}
                  </Typography>
                </Stack>
              </Box>

              <Divider inset="none" />

              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-start', mt: 'auto' }}>
                <Button
                  size="sm"
                  variant="outlined"
                  color="danger"
                  onClick={() => handleDelete(p)}
                  loading={pending}
                  disabled={pending}
                >
                  מחק
                </Button>
                <Button
                  size="sm"
                  variant="solid"
                  onClick={() => handleEdit(p)}
                  disabled={pending}
                  startDecorator={iconUi({id: 'edit'})}
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
        onClose={() => !pending && setOpen(false)}
        initialData={draft}
        saving={pending}
        onSubmit={handleSubmit}
      />
    </Box>
  )
}
