import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Modal, ModalDialog, Typography, Box, Button, Divider, Chip, Avatar } from '@mui/joy'

import PlayerPositionFieldPitch from '../../fields/selectUi/players/PlayerPositionsSelect'
import { iconUi } from '../../core/icons/iconUi'
import playerImage from '../../core/images/playerImage.jpg'
import { useUpdateAction } from '../../domains/entityActions/updateAction.js'

const safeArr = (v) => (Array.isArray(v) ? v.filter(Boolean) : [])
const norm = (v) => (v == null ? '' : String(v)).trim()

const sameArr = (a, b) => {
  const x = safeArr(a)
  const y = safeArr(b)
  if (x.length !== y.length) return false
  for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return false
  return true
}

function resolveMeta(entityType) {
  if (entityType === 'scout') {
    return { routerEntityType: 'scouting', snackEntityType: 'scout', title: 'עריכת עמדות (Scout)' }
  }
  return { routerEntityType: 'players', snackEntityType: 'player', title: 'עריכת עמדות (Player)' }
}

export default function EntityPositionsModal({
  open,
  entityType = 'player',
  entity,
  locked,
  onClose,
  onAfterSave,
}) {
  const meta = useMemo(() => resolveMeta(entityType), [entityType])

  const initial = useMemo(() => {
    const e = entity || {}
    const id = norm(e?.id)
    const fullName =
      entityType === 'scout'
        ? norm(e?.playerName) || '—'
        : [e?.playerFirstName, e?.playerLastName].filter(Boolean).join(' ') || '—'
    const photo = e?.photo || ''
    const positions = safeArr(e?.positions)
    return { id, fullName, photo, positions, raw: e }
  }, [entity, entityType])

  const [positions, setPositions] = useState([])

  useEffect(() => {
    if (!open) return
    setPositions(initial.positions)
  }, [open, initial.positions])

  const isDirty = useMemo(
    () => !sameArr(positions, initial.positions),
    [positions, initial.positions]
  )

  const canSave = !!initial.id && isDirty && !locked

  const { runUpdate, pending } = useUpdateAction({
    routerEntityType: meta.routerEntityType,
    snackEntityType: meta.snackEntityType,
    id: initial.id,
    entityName: initial.fullName,
    requireAnyUpdated: true,
    createIfMissing: false,
  })

  const handleSave = useCallback(async () => {
    if (!canSave || pending) return
    const patch = { positions: positions?.length ? positions : null }
    await runUpdate(patch, { section: 'entityPositionsModal' })

    const nextEntity = { ...initial.raw, ...patch }
    onAfterSave(patch, nextEntity)
    onClose()
  }, [canSave, pending, positions, runUpdate, onAfterSave, onClose, initial.raw])

  return (
    <Modal open={!!open} onClose={pending ? undefined : onClose}>
      <ModalDialog sx={{ width: 'min(760px, 92vw)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography level="title-md">{meta.title}</Typography>

          <Chip
            size="sm"
            variant="soft"
            startDecorator={<Avatar src={initial.photo || playerImage} />}
          >
            {initial.fullName}
          </Chip>
        </Box>

        <Divider sx={{ my: 1 }} />

        <PlayerPositionFieldPitch value={positions} onChange={setPositions} disabled={pending || locked} />

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
