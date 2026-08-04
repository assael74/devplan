// features/hub/scouting/desktop/ScoutForm.js

import React, { useMemo } from 'react'
import { Box, Button, Typography } from '@mui/joy'
import RestartAltRounded from '@mui/icons-material/RestartAltRounded'

import ScoutFields from '../../../../ui/forms/scouting/ScoutFields.js'
import {
  getScoutFormLayout,
} from '../../../../ui/forms/scouting/form.layout.js'

import { scoutFormSx } from './scoutForm.sx.js'

export default function ScoutForm({
  draft,
  setDraft,
  locked,
  pending,
  isDirty,
  canSave,
  onReset,
  onSave,
}) {
  const layout = getScoutFormLayout()

  const hint = useMemo(() => {
    if (locked) return 'הטופס נעול לעריכה'
    if (isDirty) return 'יש שינויים שלא נשמרו'
    return 'ללא שינויים'
  }, [locked, isDirty])

  return (
    <>
      <ScoutFields
        draft={draft}
        onDraft={setDraft}
        layout={layout}
        disabled={pending}
        readOnly={locked}
      />

      <Box sx={scoutFormSx.footer}>
        <Typography level="body-xs" sx={scoutFormSx.footerHint}>
          {hint}
        </Typography>

        <Box sx={scoutFormSx.footerActions}>
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
