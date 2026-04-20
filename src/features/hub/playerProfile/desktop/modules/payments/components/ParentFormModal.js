// playerProfile/desktop/modules/payments/components/ParentFormModal.js

import React, { useEffect, useMemo, useState } from 'react'
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Stack,
  Divider,
  Button,
  DialogTitle,
  DialogContent,
  Box
} from '@mui/joy'

// שדות גנריים מהמערכת
import ParentNameField from '../../../../../../../ui/fields/inputUi/parent/ParentNameField.js'
import EmailField from '../../../../../../../ui/fields/inputUi/parent/EmailField.js'
import PhoneField from '../../../../../../../ui/fields/inputUi/parent/PhoneField.js'
import ParentRoleSelectField from '../../../../../../../ui/fields/selectUi/parent/ParentRoleSelectField.js'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { buildParentInitialDraft, getIsParentDirty } from '../../../../sharedLogic'

import { cardSx as sx } from '../sx/ParentsTab.sx.js'

export default function ParentFormModal({
  open,
  onClose,
  onSubmit,
  initialData = null,
  saving = false,
}) {
  // בניית נתונים ראשוניים (נרמול)
  const initial = useMemo(() => buildParentInitialDraft(initialData), [initialData])
  const [draft, setDraft] = useState(initial)

  // סנכרון הטיוטה בעת פתיחה או שינוי נתונים חיצוני
  useEffect(() => {
    if (open) setDraft(initial)
  }, [open, initial])

  const isEdit = Boolean(initialData?.id)
  const isDirty = useMemo(() => getIsParentDirty(draft, initial), [draft, initial])
  const canSave = Boolean(draft.parentName && draft.parentRole) && isDirty

  const setField = (key) => (value) => {
    setDraft(prev => ({ ...prev, [key]: value }))
  }

  return (
    <Modal open={open} onClose={() => !saving && onClose()}>
      <ModalDialog sx={{ minWidth: 500, borderRadius: 'md' }}>
        <ModalClose />
        <DialogTitle sx={{ gap: 1 }}>
          {iconUi({ id: isEdit ? 'edit' : 'add' })}
          {isEdit ? 'עריכת הורה' : 'הוספת הורה חדש'}
        </DialogTitle>

        <Divider sx={{ my: 1.5 }} />

        <DialogContent>
          <Stack spacing={2.5}>
            {/* שורת שם ותפקיד - פריסה דסקטופית */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <ParentNameField
                value={draft.parentName}
                onChange={setField('parentName')}
                disabled={saving}
                required
              />
              <ParentRoleSelectField
                value={draft.parentRole}
                onChange={setField('parentRole')}
                disabled={saving}
                required
              />
            </Box>

            <EmailField
              value={draft.parentEmail}
              onChange={setField('parentEmail')}
              disabled={saving}
            />

            <PhoneField
              value={draft.parentPhone}
              onChange={setField('parentPhone')}
              disabled={saving}
            />
          </Stack>
        </DialogContent>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" spacing={1.5} justifyContent="flex-start">
          <Button
            variant="solid"
            onClick={() => onSubmit(draft)}
            loading={saving}
            disabled={!canSave || saving}
            startDecorator={iconUi({ id: 'save' })}
            sx={sx.conBut}
          >
            {isEdit ? 'עדכן הורה' : 'שמור הורה'}
          </Button>

          <Button variant="plain" color="neutral" onClick={onClose} disabled={saving}>
            ביטול
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  )
}
