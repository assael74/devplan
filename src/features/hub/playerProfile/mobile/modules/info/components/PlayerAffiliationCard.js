// playerProfile/mobile/modules/info/components/PlayerAffiliationCard.js

import React, { useEffect, useMemo, useState } from 'react'
import { Box, Typography, Sheet, IconButton } from '@mui/joy'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { infoModuleSx as sx } from '../info.module.sx.js'
import { ClubSelectField, TeamSelectField } from '../../../../../../../ui/fields'
import {
  buildAffiliationInitial,
  isAffiliationDirty,
  buildAffiliationPatch,
} from '../../../../sharedLogic/info/info.logic.js'

export default function PlayerAffiliationCard({
  player,
  onUpdate,
  clubsOptions = [],
  teamsOptions = [],
}) {
  const initial = useMemo(() => buildAffiliationInitial(player), [player])
  const [draft, setDraft] = useState(initial)
  const [saving, setSaving] = useState(false)

  const dirty = isAffiliationDirty(draft, initial)

  useEffect(() => {
    setDraft(initial)
  }, [initial])

  const onReset = () => setDraft(initial)

  const onSave = async () => {
    if (!dirty || saving) return
    setSaving(true)
    try {
      await onUpdate(buildAffiliationPatch(draft), { section: 'affiliation' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet variant="outlined" sx={sx.card}>
      <Box sx={sx.cardHead}>
        <Typography level="title-md" noWrap startDecorator={iconUi({ id: 'club' })}>
          שיוך שחקן
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
        <Box sx={sx.gridAff}>
          <Box sx={{ minWidth: 0 }}>
            <ClubSelectField
              value={draft.clubId}
              options={clubsOptions}
              disabled={true}
              sx={{ minWidth: 0, width: '100%' }}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <TeamSelectField
              value={draft.teamId}
              options={teamsOptions}
              clubId={draft.clubId}
              disabled={true}
              chip={false}
              sx={{ minWidth: 0, width: '100%' }}
            />
          </Box>
        </Box>
      </Box>
    </Sheet>
  )
}
