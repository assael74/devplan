// playerProfile/mobile/modules/info/components/ProjectStatusCard.js

import React, { useEffect, useMemo, useState } from 'react'
import { Box, Typography, Sheet, IconButton } from '@mui/joy'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { infoModuleSx as sx } from '../info.module.sx.js'
import {
  buildProjectStatusInitial,
  isProjectStatusDirty,
  buildProjectStatusPatch,
} from '../../../../sharedLogic/info/info.logic.js'
import {
  ProjectStatusSelectField,
  PlayerTypeSelector,
} from '../../../../../../../ui/fields'

export default function ProjectStatusCard({ player, onUpdate }) {
  const initial = useMemo(() => buildProjectStatusInitial(player), [player])
  const [draft, setDraft] = useState(initial)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDraft(initial)
  }, [initial])

  const dirty = isProjectStatusDirty(draft, initial)

  const setField = (key) => (value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const onReset = () => setDraft(initial)

  const onSave = async () => {
    if (!dirty || saving) return
    setSaving(true)
    try {
      await onUpdate(buildProjectStatusPatch(draft), { section: 'projectStatus' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet variant="outlined" sx={sx.card}>
      <Box sx={sx.cardHead}>
        <Typography level="title-md" noWrap startDecorator={iconUi({ id: 'project' })}>
          סטטוס פרוייקט
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
          <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'flex-end', mb: 0.2 }}>
            <PlayerTypeSelector
              size="xs"
              value={draft.type}
              disabled={saving}
              onChange={(next) => setField('type')(Boolean(next))}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <ProjectStatusSelectField
              value={draft.projectStatus}
              onChange={(next) => setField('projectStatus')(next || '')}
              size="sm"
              disabled={saving}
              sx={{ minWidth: 0, width: '100%' }}
            />
          </Box>
        </Box>
      </Box>
    </Sheet>
  )
}
