// src/features/players/payments/ParentFormModal.js

import React, { useEffect, useState } from 'react'
import { Modal, ModalDialog, ModalClose, Typography, Stack, FormControl, FormLabel, Input, Button } from '@mui/joy'
import EmailField from '../../../../../../ui/fields/inputUi/EmailField.js'

export default function ParentFormModal({
  open,
  onClose,
  onSubmit,
  initialData = {},
  saving = false, // ✅ new
}) {
  const [form, setForm] = useState({
    id: '',
    parentRole: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return
    setForm({
      id: initialData?.id || '',
      parentRole: initialData?.parentRole || '',
      parentName: initialData?.parentName || '',
      parentEmail: initialData?.parentEmail || '',
      parentPhone: initialData?.parentPhone || '',
    })
    setErrors({})
  }, [open, initialData])

  const setField = (k) => (e) => {
    const v = e?.target?.value ?? e
    setForm((p) => ({ ...p, [k]: v }))
    if (errors[k]) setErrors((p) => ({ ...p, [k]: '' }))
  }

  const handleSubmit = async () => {
    if (saving) return

    const nextErrors = {}
    if (!String(form.parentName || '').trim()) nextErrors.parentName = 'יש להזין שם'
    if (!String(form.parentRole || '').trim()) nextErrors.parentRole = 'יש להזין תפקיד (אמא/אבא)'

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    await onSubmit?.(form)
  }

  return (
    <Modal open={open} onClose={saving ? undefined : onClose}>
      <ModalDialog size="md" layout="center">
        <ModalClose disabled={saving} />

        <Typography level="h4" fontWeight="lg" mb={1}>
          {initialData?.parentName ? 'עריכת פרטי הורה' : 'הוספת הורה חדש'}
        </Typography>

        <Stack spacing={1.5} mt={1}>
          <FormControl error={!!errors.parentName}>
            <FormLabel sx={{ fontSize: 12 }} required>
              שם מלא
            </FormLabel>
            <Input
              value={form.parentName}
              onChange={setField('parentName')}
              placeholder="שם ההורה"
              autoFocus
              variant="soft"
              size="sm"
              color={errors.parentName ? 'danger' : 'neutral'}
              disabled={saving}
            />
            {!!errors.parentName && <Typography level="body-xs" color="danger">{errors.parentName}</Typography>}
          </FormControl>

          <FormControl error={!!errors.parentRole}>
            <FormLabel sx={{ fontSize: 12 }} required>
              תפקיד
            </FormLabel>
            <Input
              value={form.parentRole}
              onChange={setField('parentRole')}
              placeholder="אמא / אבא"
              variant="soft"
              size="sm"
              color={errors.parentRole ? 'danger' : 'neutral'}
              disabled={saving}
            />
            {!!errors.parentRole && <Typography level="body-xs" color="danger">{errors.parentRole}</Typography>}
          </FormControl>

          <EmailField
            value={form.parentEmail}
            onChange={(v) => setField('parentEmail')({ target: { value: v } })}
            disabled={saving}
          />

          <FormControl>
            <FormLabel sx={{ fontSize: 12 }}>טלפון</FormLabel>
            <Input
              value={form.parentPhone}
              onChange={setField('parentPhone')}
              placeholder="050-0000000"
              variant="soft"
              size="sm"
              disabled={saving}
            />
          </FormControl>

          <Stack direction="row" spacing={1} justifyContent="flex-end" mt={1}>
            <Button variant="outlined" onClick={onClose} disabled={saving}>
              סגור
            </Button>
            <Button
              variant="solid"
              onClick={handleSubmit}
              loading={saving}
              loadingPosition="center"
              disabled={saving}
            >
              שמור
            </Button>
          </Stack>
        </Stack>
      </ModalDialog>
    </Modal>
  )
}
