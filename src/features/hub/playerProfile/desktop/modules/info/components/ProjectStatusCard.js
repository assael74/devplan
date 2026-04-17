// playerProfile/desktop/modules/info/components/ProjectStatusCard.js

import React, { useEffect, useMemo, useState } from 'react'
import { Box, Typography, Sheet, Button, Chip } from '@mui/joy'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { playerInfoModuleSx as sx } from '../playerInfo.module.sx.js'
import {
  buildProjectStatusInitial,
  isProjectStatusDirty,
  buildProjectStatusPatch,
  isProjectPlayer,
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

  const isProject = isProjectPlayer(draft.type)

  const onReset = () => setDraft(initial)

  const setField = (key) => (value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const onSave = async () => {
    if (!dirty || saving) return

    setSaving(true)
    try {
      const patch = buildProjectStatusPatch(draft)

      await onUpdate(patch, { section: 'projectStatus' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet variant="outlined" sx={sx.card}>
      <Box sx={sx.cardHead}>
        <Box sx={sx.cardTitle}>
          {iconUi({id: 'project', size: 'sm'}) || null}
          <Typography level="title-md" noWrap>
            סטטוס פרויקט
          </Typography>
        </Box>

        <Chip
          size="sm"
          variant="soft"
          color={isProject ? 'success' : 'neutral'}
          startDecorator={iconUi({ id: isProject ? 'project' : 'noneType' })}
        >
          {isProject ? 'פרויקט' : 'כללי'}
        </Chip>
      </Box>

      <Box sx={sx.gridStatus}>
        <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'flex-end', mb: 0.2 }}>
          <PlayerTypeSelector
            size="sm"
            value={draft.type}
            disabled={saving}
            onChange={(next) => setField('type')(Boolean(next))}
          />
        </Box>

        <ProjectStatusSelectField
          value={draft.projectStatus}
          onChange={(next) => setDraft((p) => ({ ...p, projectStatus: next || '' }))}
          size="sm"
          disabled={saving}
        />
      </Box>

      <Box sx={sx.actions}>
        <Button
          size="sm"
          variant="soft"
          color="neutral"
          onClick={onReset}
          disabled={!dirty || saving}
          startDecorator={iconUi({ id: 'reset' })}
        >
          איפוס
        </Button>

        <Button
          size="sm"
          variant="solid"
          onClick={onSave}
          disabled={!dirty || saving}
          loading={saving}
          loadingPosition="center"
          sx={sx.confBtn}
          startDecorator={iconUi({ id: 'save' })}
        >
          שמירה
        </Button>
      </Box>
    </Sheet>
  )
}
