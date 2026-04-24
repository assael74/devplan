// src/features/hub/clubProfile/desktop/modules/management/ClubManagementInfoCard.js

import React from 'react'
import { Box, Sheet, Typography, Button, Chip } from '@mui/joy'

import ClubNameField from '../../../../../../../ui/fields/inputUi/clubs/ClubNameField.js'
import ClubIfaLinkField from '../../../../../../../ui/fields/inputUi/clubs/ClubIfaLinkField.js'
import ClubActiveSelector from '../../../../../../../ui/fields/checkUi/clubs/ClubActiveSelector.js'

import { moduleSx as sx } from '../sx/module.sx'

export default function ClubManagementInfoCard({
  draft,
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
            ניהול מועדון
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
          <ClubActiveSelector
            value={draft.active}
            onChange={(v) => onDraft({ ...draft, active: v })}
          />
        </Box>
      </Box>

      <Box sx={sx.secondRow}>
        <ClubNameField
          required
          value={draft?.clubName}
          onChange={(v) => onDraft({ ...draft, clubName: v })}
        />
      </Box>

      {/* ✅ Row 2: Team name (primary) + Club (readOnly secondary) */}
      <Box sx={sx.thirdRow}>
        <ClubIfaLinkField
          value={draft.ifaLink}
          onChange={(v) => onDraft({ ...draft, ifaLink: v })}
        />
      </Box>
    </Sheet>
  )
}
