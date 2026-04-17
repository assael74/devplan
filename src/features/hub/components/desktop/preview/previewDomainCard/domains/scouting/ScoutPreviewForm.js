// hub/components/preview/previewDomainCard/domains/scouting/ScoutPreviewForm.js

import React, { useMemo } from 'react'
import { Box, Button, Typography } from '@mui/joy'
import RestartAltRounded from '@mui/icons-material/RestartAltRounded'

import PhoneField from '../../../../../../../../ui/fields/inputUi/PhoneField.js'
import GenericInputField from '../../../../../../../../ui/fields/inputUi/GenericInputField.js'
import ScoutFullNameField from '../../../../../../../../ui/fields/inputUi/scouting/ScoutFullNameField.js'
import ScoutIfaLinkField from '../../../../../../../../ui/fields/inputUi/scouting/ScoutIfaLinkField.js'

import { asIdArray } from './scoutPreview.logic.js'
import { scoutPreviewSx } from './scoutPreview.sx.js'

export default function ScoutPreviewForm({
  draft,
  setDraft,
  locked,
  pending,
  isDirty,
  canSave,
  onReset,
  onSave,
}) {
  const hint = useMemo(() => {
    if (locked) return 'הטופס נעול לעריכה'
    if (isDirty) return 'יש שינויים שלא נשמרו'
    return 'ללא שינויים'
  }, [locked, isDirty])

  return (
    <>
      <Box sx={scoutPreviewSx.row1}>
        <ScoutFullNameField
          value={draft.playerName}
          size='sm'
          onChange={(v) => setDraft((d) => ({ ...d, playerName: v }))}
        />

        <PhoneField
          value={draft.phone}
          size='sm'
          onChange={(v) => setDraft((d) => ({ ...d, phone: v }))}
        />

        <ScoutIfaLinkField
          value={draft.ifaLink}
          size='sm'
          onChange={(v) => setDraft((d) => ({ ...d, ifaLink: v }))}
        />
      </Box>

      <Box sx={scoutPreviewSx.row2}>
        <GenericInputField
          value={draft.clubName}
          label='שם מועדון'
          size='sm'
          onChange={(v) => setDraft((d) => ({ ...d, clubName: v }))}
        />

        <GenericInputField
          value={draft.teamName}
          label='שם קבוצה'
          size='sm'
          onChange={(v) => setDraft((d) => ({ ...d, teamName: v }))}
        />

        <GenericInputField
          value={draft.league}
          label='ליגה'
          size='sm'
          onChange={(v) => setDraft((d) => ({ ...d, league: v }))}
        />
      </Box>

      <GenericInputField
        value={draft.notes}
        label='הערות'
        size='sm'
        onChange={(v) => setDraft((d) => ({ ...d, notes: v }))}
      />

      <Box sx={scoutPreviewSx.footer}>
        <Typography level="body-xs" sx={scoutPreviewSx.footerHint}>
          {hint}
        </Typography>

        <Box sx={scoutPreviewSx.footerActions}>
          <Button
            size="sm"
            variant="soft"
            onClick={onReset}
            disabled={!isDirty || pending}
            startDecorator={<RestartAltRounded />}
          >
            איפוס
          </Button>

          <Button
            size="sm"
            variant="solid"
            onClick={onSave}
            disabled={!canSave}
            loading={pending}
            loadingPosition="center"
          >
            שמירה
          </Button>
        </Box>
      </Box>
    </>
  )
}
