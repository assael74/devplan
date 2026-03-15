// teamProfile/modules/players/components/drawer/TeamPlayerQuickEditDrawer.js

import React, { useEffect, useMemo, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Typography,
} from '@mui/joy'

import playerImage from '../../../../../../../ui/core/images/playerImage.jpg'
import ProjectStatusSelectField from '../../../../../../../ui/fields/checkUi/players/ProjectStatusSelectField.js'

import { teamPlayersDrawerSx as sx } from '../../sx/teamPlayers.drawer.sx.js'

const safe = (v) => (v == null ? '' : String(v).trim())

const buildInitial = (row) => {
  const r = row?.raw || row || {}
  const p = r?.player || {}

  return {
    id: safe(r?.playerId || p?.id || r?.id),
    raw: r,
    fullName: row?.fullName || [p?.playerFirstName, p?.playerLastName].filter(Boolean).join(' ') || '—',
    photo: row?.photo || p?.photo || '',
    isKey: (r?.isKey ?? p?.isKey ?? false) === true,
    active: (r?.active ?? p?.active ?? true) === true,
    type: safe(r?.type ?? p?.type) || 'noneType',
    projectStatus: safe(r?.projectStatus ?? p?.projectStatus),
  }
}

export default function TeamPlayerQuickEditDrawer({
  open,
  row,
  pending,
  onClose,
  onSave,
  onRemove,
}) {
  const initial = useMemo(() => buildInitial(row), [row])

  const [isKey, setIsKey] = useState(false)
  const [active, setActive] = useState(true)
  const [type, setType] = useState('noneType')
  const [projectStatus, setProjectStatus] = useState('')

  useEffect(() => {
    if (!open) return
    setIsKey(initial.isKey)
    setActive(initial.active)
    setType(initial.type)
    setProjectStatus(initial.projectStatus)
  }, [open, initial])

  const isDirty =
    isKey !== initial.isKey ||
    active !== initial.active ||
    type !== initial.type ||
    projectStatus !== initial.projectStatus

  const handleSave = () => {
    if (!initial.id) return
    onSave?.({
      ...initial.raw,
      playerId: initial.id,
      isKey,
      active,
      type,
      projectStatus: safe(projectStatus) || null,
    })
  }

  return (
    <Drawer open={!!open} onClose={onClose} anchor="right" size="md">
      <Box sx={{ p: 1.5 }}>
        <Box sx={sx.drawerHeader}>
          <Typography level="title-md">עריכת שחקן</Typography>
          <Chip
            size="sm"
            variant="soft"
            startDecorator={<Avatar src={initial.photo || playerImage} />}
          >
            {initial.fullName}
          </Chip>
        </Box>

        <Divider sx={{ mb: 1 }} />

        <Box sx={sx.drawerBody}>
          <FormControl orientation="horizontal" sx={{ justifyContent: 'space-between' }}>
            <FormLabel>פעיל</FormLabel>
            <Switch checked={active} onChange={(e) => setActive(e.target.checked)} />
          </FormControl>

          <FormControl orientation="horizontal" sx={{ justifyContent: 'space-between' }}>
            <FormLabel>שחקן מפתח</FormLabel>
            <Switch checked={isKey} onChange={(e) => setIsKey(e.target.checked)} />
          </FormControl>

          <FormControl>
            <FormLabel>סוג שחקן</FormLabel>
            <Input
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="project / noneType"
            />
          </FormControl>

          <ProjectStatusSelectField
            label="סטטוס פרויקט"
            size="sm"
            value={projectStatus}
            onChange={setProjectStatus}
            disabled={pending}
          />
        </Box>

        <Divider sx={{ mt: 1, mb: 1 }} />

        <Box sx={sx.drawerFooter}>
          <Button variant="plain" onClick={onClose} disabled={pending}>
            ביטול
          </Button>

          <Button
            variant="soft"
            color="danger"
            disabled={pending || !initial.id}
            onClick={() => onRemove?.(initial.id)}
          >
            הסרה מהקבוצה
          </Button>

          <Button disabled={!isDirty || pending} onClick={handleSave}>
            שמירה
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}
