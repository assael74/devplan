// src/features/players/modules/info/components/PlayerAffiliationCard.js

import React, { useEffect, useMemo, useState } from 'react'
import { Box, Typography, Sheet, Button, Chip } from '@mui/joy'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { playerInfoModuleSx as sx } from '../playerInfo.module.sx.js'

import { ClubSelectField, TeamSelectField } from '../../../../../../ui/fields'

import {
  buildAffiliationInitial,
  isAffiliationDirty,
} from './logic/info.logic.js'

const toStr = (v) => (v == null ? '' : String(v))

export default function PlayerAffiliationCard({ player, onUpdate, clubsOptions = [], teamsOptions = [] }) {
  const initial = useMemo(() => buildAffiliationInitial(player), [player])
  const [draft, setDraft] = useState(initial)
  const [saving, setSaving] = useState(false)

  const dirty = isAffiliationDirty(draft, initial)

  useEffect(() => setDraft(initial), [initial.clubId, initial.teamId])

  const hasClub = Boolean(draft.clubId)
  const hasTeam = Boolean(draft.teamId)

  const onReset = () => setDraft(initial)

  const onSave = async () => {
    if (!dirty || saving) return
    setSaving(true)
    try {
      const patch = {
        clubId: draft.clubId || null,
        teamId: draft.teamId || null,
      }
      await onUpdate(patch, { section: 'affiliation' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet variant="outlined" sx={sx.card}>
      <Box sx={sx.cardHead}>
        <Box sx={sx.cardTitle}>
          {iconUi({ id: 'club', size: 'sm' }) || iconUi?.({ id: 'team', size: 'sm' }) || null}
          <Typography level="title-md" noWrap>
            שיוך
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Chip size="sm" variant="soft" color={hasClub ? 'primary' : 'neutral'}>
            מועדון
          </Chip>
          <Chip size="sm" variant="soft" color={hasTeam ? 'primary' : 'neutral'}>
            קבוצה
          </Chip>
        </Box>
      </Box>

      <Box sx={sx.formGrid2}>
        <ClubSelectField
          value={draft.clubId}
          options={clubsOptions}
          readOnly={true}
        />

          <TeamSelectField
            value={draft.teamId}
            options={teamsOptions}
            clubId={draft.clubId}
            readOnly={true}
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
