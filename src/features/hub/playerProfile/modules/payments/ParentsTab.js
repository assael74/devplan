// src/features/players/payments/ParentsTab.js
import React from 'react'
import { Box, Card, Typography, Stack, Button, IconButton, Divider } from '@mui/joy'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EmailRoundedIcon from '@mui/icons-material/EmailRounded'
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded'
import ParentFormModal from './ParentFormModal'
import { addCardProps } from './ParentsTab.sx.js'

export default function ParentsTab({ player, onSaveParents, saving = false }) {
  const [open, setOpen] = React.useState(false)
  const [editIndex, setEditIndex] = React.useState(null)
  const [draft, setDraft] = React.useState(null)

  const parents = Array.isArray(player?.parents) ? player.parents : []
  
  const handleAdd = () => {
    setEditIndex(null)
    setDraft(null)
    setOpen(true)
  }

  const handleEdit = (idx) => {
    setEditIndex(idx)
    setDraft(parents[idx] || null)
    setOpen(true)
  }

  const handleDelete = async (idx) => {
    if (saving) return
    const next = parents.slice()
    next.splice(idx, 1)
    await onSaveParents?.(next)
  }

  const handleSubmit = async (data) => {
    const next = parents.slice()

    const withId = {
      ...data,
      id: data.id || `${Date.now()}`,
    }

    if (editIndex === null) next.push(withId)
    else next[editIndex] = withId

    await onSaveParents?.(next)
    setOpen(false)
  }

  return (
    <Box sx={{ display: 'grid', gap: 1.2, pb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2 }}>
        <Card {...addCardProps} onClick={handleAdd}>
          <IconButton size="lg" variant="soft" color="primary">
            <AddRoundedIcon />
          </IconButton>
          <Typography level="body-sm" mt={1}>
            הוסף הורה
          </Typography>
        </Card>
      </Box>

      <Box sx={{ display: 'grid', gap: 2, mx: 1, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        {parents.map((p, idx) => (
          <Card key={p.id || idx} variant="outlined" sx={{ p: 1.2, boxShadow: 'sm' }}>
            <Stack spacing={0.8}>
              <Typography level="title-md">{p.parentName || 'הורה'}</Typography>
              <Typography level="body-xs" sx={{ opacity: 0.75 }}>
                {p.parentRole || 'תפקיד לא הוגדר'}
              </Typography>

              <Divider />

              {!!p.parentEmail && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <EmailRoundedIcon fontSize="small" />
                  <Typography level="body-sm">{p.parentEmail}</Typography>
                </Stack>
              )}

              {!!p.parentPhone && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <PhoneRoundedIcon fontSize="small" />
                  <Typography level="body-sm">{p.parentPhone}</Typography>
                </Stack>
              )}

              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 0.5 }}>
                <Button
                  size="sm"
                  variant="outlined"
                  color="danger"
                  onClick={() => handleDelete(idx)}
                  loading={saving}
                  disabled={saving}
                >
                  מחק
                </Button>
                <Button
                  size="sm"
                  variant="solid"
                  onClick={() => handleEdit(idx)}
                  disabled={saving}
                >
                  ערוך
                </Button>
              </Box>
            </Stack>
          </Card>
        ))}
      </Box>

      <ParentFormModal
        open={open}
        onClose={() => !saving && setOpen(false)}
        initialData={draft || {}}
        saving={saving}
        onSubmit={handleSubmit}
      />
    </Box>
  )
}
