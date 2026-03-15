// teamProfile/modules/players/components/drawer/TeamPlayerPositionsModal.js

import React, { useEffect, useMemo, useState } from 'react'
import { Avatar, Box, Button, Chip, Divider, Drawer, Typography } from '@mui/joy'

import PlayerPositionFieldPitch from '../../../../../../../ui/fields/selectUi/players/PlayerPositionsSelect.js'
import playerImage from '../../../../../../../ui/core/images/playerImage.jpg'

import { teamPlayersDrawerSx as sx } from '../../sx/teamPlayers.drawer.sx.js'

const safe = (v) => (v == null ? '' : String(v).trim())
const safeArr = (v) => (Array.isArray(v) ? v : [])

const sameArr = (a, b) => {
  const x = safeArr(a)
  const y = safeArr(b)
  if (x.length !== y.length) return false
  for (let i = 0; i < x.length; i++) {
    if (x[i] !== y[i]) return false
  }
  return true
}

export default function TeamPlayerPositionsDrawer({
  open,
  row,
  pending,
  onClose,
  onSave,
}) {
  const initial = useMemo(() => {
    const r = row?.raw || row || {}
    const p = r?.player || {}
    return {
      id: safe(r?.playerId || p?.id || r?.id),
      raw: r,
      fullName: row?.fullName || [p?.playerFirstName, p?.playerLastName].filter(Boolean).join(' ') || '—',
      photo: row?.photo || p?.photo || '',
      positions: safeArr(r?.positions ?? p?.positions),
    }
  }, [row])

  const [positions, setPositions] = useState([])

  useEffect(() => {
    if (!open) return
    setPositions(initial.positions)
  }, [open, initial])

  const isDirty = !sameArr(positions, initial.positions)

  const handleSave = () => {
    if (!initial.id) return
    onSave?.({
      ...initial.raw,
      playerId: initial.id,
      positions,
    })
  }

  return (
    <Drawer open={!!open} onClose={onClose} anchor="right" size="lg">
      <Box sx={{ p: 1.5 }}>
        <Box sx={sx.drawerHeader}>
          <Typography level="title-md">עריכת עמדות</Typography>
          <Chip
            size="sm"
            variant="soft"
            startDecorator={<Avatar src={initial.photo || playerImage} />}
          >
            {initial.fullName}
          </Chip>
        </Box>

        <Divider sx={{ mb: 1 }} />

        <PlayerPositionFieldPitch
          value={positions}
          onChange={setPositions}
          disabled={pending}
        />

        <Divider sx={{ mt: 1, mb: 1 }} />

        <Box sx={sx.drawerFooter}>
          <Button variant="plain" onClick={onClose} disabled={pending}>
            ביטול
          </Button>

          <Button disabled={!isDirty || pending} onClick={handleSave}>
            שמירה
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}
