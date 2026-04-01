// teamProfile/modules/players/components/drawer/TeamPlayerEditModal.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Modal, ModalDialog, Typography, Box, Button, Divider, Chip, Avatar } from '@mui/joy'

import ProjectStatusSelectField from '../../../../../../ui/fields/checkUi/players/ProjectStatusSelectField'
import PlayerKeyPlayerSelector from '../../../../../../ui/fields/checkUi/players/PlayerKeyPlayerSelector'
import { iconUi } from '../../../../../../ui/core/icons/iconUi'
import playerImage from '../../../../../../ui/core/images/playerImage.jpg'

import { useUpdateAction } from '../../../../../../ui/domains/entityActions/updateAction.js'

const str = (v) => (v == null ? '' : String(v).trim())

const buildInitial = (row) => {
  const r = row?.raw || row || {}
  const p = r?.player || {}
  const id = str(r?.playerId || p?.id || r?.id)
  const fullName = str(r?.fullName) || [p?.playerFirstName, p?.playerLastName].filter(Boolean).join(' ') || '—'
  return {
    id,
    fullName,
    projectStatus: str(r?.projectStatus ?? p?.projectStatus),
    squadRole: (r?.squadRole ?? p?.squadRole ?? false) === true,
    raw: r,
  }
}

export default function TeamPlayerEditModal({ open, row, onClose, onSave }) {
  const initial = useMemo(() => buildInitial(row), [row])

  const [projectStatus, setProjectStatus] = useState('')
  const [isKey, setIsKey] = useState(false)

  useEffect(() => {
    if (!open) return
    setProjectStatus(initial.projectStatus)
    setIsKey(!!initial.isKey)
  }, [open, initial])

  const isDirty = useMemo(
    () => str(projectStatus) !== str(initial.projectStatus) || !!isKey !== !!initial.isKey,
    [projectStatus, isKey, initial]
  )

  const canSave = !!initial.id && isDirty

  const { runUpdate, pending } = useUpdateAction({
    routerEntityType: 'players',
    snackEntityType: 'player',
    id: initial.id,
    entityName: initial.fullName,
    requireAnyUpdated: true,
    createIfMissing: false,
  })

  const onUpdate = useCallback(
    async (patch, meta) => {
      return runUpdate(patch, meta)
    },
    [runUpdate]
  )

  const handleSave = async () => {
    if (!canSave || pending) return
    const patch = { projectStatus: str(projectStatus) || null, isKey: !!isKey }
    await onUpdate(patch, { section: 'teamPlayerPos' })
    onSave({ ...initial.raw, playerId: initial.id, ...patch })
    onClose()
  }

  return (
    <Modal open={!!open} onClose={pending ? undefined : onClose}>
      <ModalDialog sx={{ width: 'min(720px,92vw)', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'center' }}>
          <Typography level="title-md">עריכת שחקן</Typography>
          <Chip size="sm" variant="soft" startDecorator={<Avatar src={row?.photo || playerImage} />}>
            {row?.fullName}
          </Chip>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ display: 'grid', gap: 1 }}>
          <PlayerKeyPlayerSelector value={isKey} onChange={setIsKey} size="sm" disabled={pending} />

          <Divider sx={{ my: 2 }} />

          <ProjectStatusSelectField
            label="סטטוס תהליך פרויקט"
            size="sm"
            value={projectStatus}
            onChange={setProjectStatus}
            disabled={pending}
          />
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button variant="plain" onClick={onClose} disabled={pending}>
            ביטול
          </Button>
          <Button
            startDecorator={iconUi({ id: 'save' })}
            disabled={!canSave || pending}
            loading={pending}
            loadingPosition="center"
            onClick={handleSave}
          >
            שמירה
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  )
}
