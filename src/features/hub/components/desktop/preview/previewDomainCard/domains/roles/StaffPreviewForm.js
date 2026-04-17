// C:\projects\devplan\src\features\hub\components\preview\previewDomainCard\domains\roles\StaffPreviewForm.js

import React, { useMemo } from 'react'
import { Box, Button, Typography } from '@mui/joy'
import RestartAltRounded from '@mui/icons-material/RestartAltRounded'

import ClubMultiSelectField from '../../../../../../../../ui/fields/selectUi/clubs/ClubMultiSelectField.js'
import TeamMultiSelectField from '../../../../../../../../ui/fields/selectUi/teams/TeamMultiSelectField.js'
import RoleTypeSelectField from '../../../../../../../../ui/fields/selectUi/roles/RoleTypeSelectField.js'
import PhoneField from '../../../../../../../../ui/fields/inputUi/PhoneField.js'
import RoleFullNameField from '../../../../../../../../ui/fields/inputUi/RoleFullNameField.js'
import EmailField from '../../../../../../../../ui/fields/inputUi/EmailField.js'
import RoleActiveSelector from '../../../../../../../../ui/fields/checkUi/roles/RoleActiveSelector.js'

import { asIdArray } from './staffPreview.logic.js'
import { staffPreviewSx } from './staffPreview.sx.js'

export default function StaffPreviewForm({
  draft,
  setDraft,
  clubsOptions,
  teamsOptions,
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
      <Box sx={staffPreviewSx.row1}>
        <Box sx={staffPreviewSx.activeWrap}>
          <RoleActiveSelector
            value={draft.active}
            onChange={(v) => setDraft((d) => ({ ...d, active: !!v }))}
          />
        </Box>

        <RoleFullNameField
          value={draft.fullName}
          onChange={(v) => setDraft((d) => ({ ...d, fullName: v }))}
        />

        <RoleTypeSelectField
          value={draft.type}
          onChange={(v) => setDraft((d) => ({ ...d, type: v }))}
        />
      </Box>

      <Box sx={staffPreviewSx.row2}>
        <PhoneField
          value={draft.phone}
          onChange={(v) => setDraft((d) => ({ ...d, phone: v }))}
        />

        <EmailField
          value={draft.email}
          onChange={(v) => setDraft((d) => ({ ...d, email: v }))}
        />
      </Box>

      <Box sx={staffPreviewSx.row3}>
        <ClubMultiSelectField
          value={draft.clubsId}
          onChange={(v) => setDraft((d) => ({ ...d, clubsId: asIdArray(v) }))}
          clubs={clubsOptions}
        />

        <TeamMultiSelectField
          teams={teamsOptions}
          value={draft.teamsId}
          clubs={clubsOptions}
          onChange={(v) => setDraft((d) => ({ ...d, teamsId: asIdArray(v) }))}
        />
      </Box>

      <Box sx={staffPreviewSx.footer}>
        <Typography level="body-xs" sx={staffPreviewSx.footerHint}>
          {hint}
        </Typography>

        <Box sx={staffPreviewSx.footerActions}>
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
