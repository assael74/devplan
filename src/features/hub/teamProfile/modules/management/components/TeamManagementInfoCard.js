// src/features/hub/teamProfile/modules/management/TeamManagementInfoCard.js
import React from 'react'
import { Box, Sheet, Typography, Button, Chip } from '@mui/joy'

import TeamNameField from '../../../../../../ui/fields/inputUi/teams/TeamNameField.js'
import TeamIfaLinkField from '../../../../../../ui/fields/inputUi/teams/TeamIfaLinkField.js'
import TeamActiveSelector from '../../../../../../ui/fields/checkUi/teams/TeamActiveSelector.js'
import TeamProjectSelector from '../../../../../../ui/fields/checkUi/teams/TeamProjectSelector.js'
import ClubNameField from '../../../../../../ui/fields/inputUi/clubs/ClubNameField.js'
import YearPicker from '../../../../../../ui/fields/dateUi/YearPicker'

export default function TeamManagementInfoCard({
  sx,
  draft,
  clubName,
  isDirty,
  onDraft,
  onConfirm,
  onReset,
  pending
}) {
  return (
    <Sheet variant="soft" sx={sx.cardSx}>
      {/* ✅ header: title + dirty + actions right */}
      <Box sx={sx.cardHeader}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <Typography level="title-sm" sx={{ whiteSpace: 'nowrap' }}>
            ניהול קבוצה
          </Typography>
          {isDirty ? (
            <Chip size="sm" variant="soft" color="warning">
              לא נשמר
            </Chip>
          ) : null}
        </Box>

        <Box sx={sx.actions}>
          <Button size="sm" variant="soft" color="neutral" disabled={!isDirty} onClick={onReset}>
            איפוס
          </Button>
          <Button size="sm" variant="solid" color="success" disabled={pending || !isDirty} onClick={onConfirm} loading={pending}>
            אישור
          </Button>
        </Box>
      </Box>

      {/* ✅ Row 1: chips + year (year is visually secondary) */}
      <Box sx={sx.firstRow}>
        {/* ציפס */}
        <Box sx={sx.chipsRow}>
          <TeamActiveSelector
            value={draft.active}
            onChange={(v) => onDraft({ ...draft, active: v })}
          />
          <TeamProjectSelector
            value={draft.project}
            onChange={(v) => onDraft({ ...draft, project: v })}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <YearPicker
            label="שנתון"
            size='sm'
            value={draft.teamYear}
            onChange={(v) => onDraft({ ...draft, teamYear: v })}
            range={{ past: 20, future: 0 }}
            size="sm"
          />
        </Box>
      </Box>

      <Box sx={sx.secondRow}>
        <TeamNameField
          value={draft.teamName}
          size='sm'
          onChange={(v) => onDraft({ ...draft, teamName: v })}
        />

        <ClubNameField
          value={clubName}
          onChange={() => {}}
          readOnly
          required
          disabled={false}
          helperText=""
        />
      </Box>

      {/* ✅ Row 2: Team name (primary) + Club (readOnly secondary) */}
      <Box sx={sx.thirdRow}>
        <TeamIfaLinkField
          value={draft.ifaLink}
          onChange={(v) => onDraft({ ...draft, ifaLink: v })}
        />
      </Box>
    </Sheet>
  )
}
