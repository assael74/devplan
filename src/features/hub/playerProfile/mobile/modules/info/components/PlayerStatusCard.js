// playerProfile/mobile/modules/info/components/PlayerStatusCard.js

import React, { useEffect, useMemo, useState } from 'react'
import { Box, Typography, Sheet, IconButton } from '@mui/joy'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { infoModuleSx as sx } from '../info.module.sx.js'
import {
  buildPlayerStatusInitial,
  isPlayerStatusDirty,
  buildPlayerStatusPatch,
} from '../../../../sharedLogic/info/info.logic.js'
import {
  PhoneField,
  PlayerIfaLinkField,
  PlayerActiveSelector,
  SquadRoleSelectField,
} from '../../../../../../../ui/fields'

export default function PlayerStatusCard({ player, onUpdate }) {
  const initial = useMemo(() => buildPlayerStatusInitial(player), [player])
  const [draft, setDraft] = useState(initial)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDraft(initial)
  }, [initial])

  const dirty = isPlayerStatusDirty(draft, initial)

  const setField = (key) => (value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const onReset = () => setDraft(initial)

  const onSave = async () => {
    if (!dirty || saving) return
    setSaving(true)
    try {
      await onUpdate(buildPlayerStatusPatch(draft), { section: 'status' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet variant="outlined" sx={sx.card}>
      <Box sx={sx.cardHead}>
        <Typography level="title-md" noWrap startDecorator={iconUi({ id: 'info' })}>
          סטטוס וטלפון
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="sm"
            variant="soft"
            color="warning"
            onClick={onReset}
            disabled={!dirty || saving}
          >
            {iconUi({ id: 'reset' })}
          </IconButton>

          <IconButton
            size="sm"
            variant="solid"
            onClick={onSave}
            disabled={!dirty || saving}
            loading={saving}
            sx={sx.confBtn}
          >
            {iconUi({ id: 'save' })}
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gap: 0.875, minWidth: 0 }}>
        <Box sx={sx.gridIfa}>
          <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'flex-end', mb: 0.5 }}>
            <PlayerActiveSelector
              size="xs"
              value={draft.active}
              onChange={setField('active')}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <PlayerIfaLinkField
              value={draft.ifaLink}
              onChange={setField('ifaLink')}
              size="sm"
              sx={{ minWidth: 0, width: '100%' }}
            />
          </Box>
        </Box>

        <Box sx={sx.formGrid2}>
          <Box sx={{ minWidth: 0 }}>
            <PhoneField
              size="sm"
              value={draft.phone}
              onChange={setField('phone')}
              sx={{ minWidth: 0, width: '100%' }}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <SquadRoleSelectField
              size="sm"
              value={draft.squadRole}
              onChange={(next) => setField('squadRole')(next || '')}
              sx={{ minWidth: 0, width: '100%' }}
            />
          </Box>
        </Box>
      </Box>
    </Sheet>
  )
}
