// features/hub/clubProfile/desktop/modules/management/components/ClubManagementInfoCard.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'

import ClubEditFields from '../../../../../../../ui/forms/clubs/ClubEditFields.js'

import { moduleSx as sx } from '../sx/module.sx'

const emptyValue = 'לא הוזן'

export default function ClubManagementInfoCard({
  draft,
  onDraft,
  pending,
  readOnly = false,
}) {
  const clubName = String(draft?.clubName || '').trim() || emptyValue
  const ifaLink = String(draft?.ifaLink || '').trim() || emptyValue

  if (readOnly) {
    return (
      <Sheet variant="plain" sx={sx.infoCard}>
        <Box sx={sx.statusRow}>
          <Chip size="sm" variant="soft" color={draft?.active ? 'success' : 'neutral'}>
            {draft?.active ? 'פעיל' : 'לא פעיל'}
          </Chip>
        </Box>

        <Box sx={sx.readGrid}>
          <Box sx={sx.readItem}>
            <Typography level="body-xs" sx={sx.readLabel}>
              שם מועדון
            </Typography>
            <Typography level="title-sm" sx={sx.readValue}>
              {clubName}
            </Typography>
          </Box>

          <Box sx={sx.readItem}>
            <Typography level="body-xs" sx={sx.readLabel}>
              קישור התאחדות
            </Typography>
            <Typography level="title-sm" sx={sx.readLink} title={ifaLink}>
              {ifaLink}
            </Typography>
          </Box>
        </Box>
      </Sheet>
    )
  }

  return (
    <Sheet variant="plain" sx={sx.infoCard}>
      <Box sx={sx.editHeader}>
        <Box sx={{ minWidth: 0 }}>
          <Typography level="title-sm" sx={sx.editTitle}>
            עריכת מידע מועדון
          </Typography>
          <Typography level="body-xs" sx={sx.editSubtitle}>
            עדכון שם המועדון, קישור התאחדות וסטטוס פעילות
          </Typography>
        </Box>

        <Chip size="sm" variant="soft" color="neutral">
          מצב עריכה
        </Chip>
      </Box>

      <ClubEditFields
        draft={draft}
        onDraft={onDraft}
        variant="profile"
        disabled={pending}
      />
    </Sheet>
  )
}
