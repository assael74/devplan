// teamProfile/modules/players/components/TeamPlayerPositionsModal.js
import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Modal, ModalDialog, Typography, Box, Button, Divider, Chip, Avatar } from '@mui/joy'

import PlayerPositionFieldPitch from '../../../../../../ui/fields/selectUi/players/PlayerPositionsSelect'
import { iconUi } from '../../../../../../ui/core/icons/iconUi'
import playerImage from '../../../../../../ui/core/images/playerImage.jpg'

import { useUpdateAction } from '../../../../../../ui/domains/entityActions/updateAction.js'

const safeArr = (v) => (Array.isArray(v) ? v : [])
const norm = (v) => (v == null ? '' : String(v)).trim()

const sameArr = (a, b) => {
  const x = safeArr(a)
  const y = safeArr(b)
  if (x.length !== y.length) return false
  for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return false
  return true
}

export default function TeamPlayerPositionsModal({ open, row, onClose, onSave }) {
  const initial = useMemo(() => {
    const r = row?.raw || row || {}
    const p = r?.player || {}
    const id = norm(r?.playerId || p?.id || r?.id)
    const fullName = norm(r?.fullName) || [p?.playerFirstName, p?.playerLastName].filter(Boolean).join(' ') || '—'
    const positions = safeArr(r?.positions ?? p?.positions)
    return { id, fullName, positions, raw: r }
  }, [row])

  const [positions, setPositions] = useState([])

  useEffect(() => {
    if (!open) return
    setPositions(initial.positions)
  }, [open, initial])

  const isDirty = useMemo(() => !sameArr(positions, initial.positions), [positions, initial.positions])
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
    const patch = { positions: positions || null }
    await onUpdate(patch, { section: 'teamPlayerEdit' })
    onSave({ ...initial.raw, playerId: initial.id, ...patch })
    onClose()
  }

  return (
    <Modal open={!!open} onClose={pending ? undefined : onClose}>
      <ModalDialog sx={{ width: 'min(720px, 92vw)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography level="title-md">עריכת עמדה</Typography>
          <Chip size="sm" variant="soft" startDecorator={<Avatar src={row?.photo || playerImage} />}>
            {row?.fullName}
          </Chip>
        </Box>

        <Divider sx={{ my: 1 }} />

        <PlayerPositionFieldPitch value={positions} onChange={setPositions} disabled={pending} />

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
