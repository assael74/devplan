// src/ui/forms/gameStatsForm/steps/parts/EntryFieldsSection.js

import React from 'react'
import {
  Box,
  Sheet,
  Typography,
} from '@mui/joy'

import { entryStepSx as sx } from '../sx/entryStep.sx.js'

import {
  StatsFieldRenderer,
  StatsTripletInput,
} from '../../inputs/index.js'

// אחריות:
// תצוגת שדות המילוי בשלב Entry.

function FieldCard({ field, children }) {
  const type = field.statsParmType ||
    (field.parm && field.parm.statsParmType) ||
    'general'

  return (
    <Sheet variant="plain" sx={sx.entryFieldCard(type)}>
      {children}
    </Sheet>
  )
}

export function RegularFieldsSection({ fields, row, locked, onUpdateRow }) {
  if (!fields.length) return null

  return (
    <Box sx={sx.entrySection}>
      <Typography level="body-xs" sx={sx.entrySectionTitle}>
        שדות בודדים
      </Typography>

      <Box sx={sx.regularEntryGrid}>
        {fields.map(field => (
          <FieldCard key={field.id} field={field}>
            <StatsFieldRenderer
              parm={field.parm}
              value={row[field.id]}
              disabled={locked}
              readOnly={locked}
              onChange={value => {
                if (locked) return
                onUpdateRow({ [field.id]: value })
              }}
            />
          </FieldCard>
        ))}
      </Box>
    </Box>
  )
}

export function TripletFieldsSection({ fields, row, locked, onUpdateRow }) {
  if (!fields.length) return null

  return (
    <Box sx={sx.entrySection}>
      <Typography level="body-xs" sx={sx.entrySectionTitle}>
        מדדים מחושבים
      </Typography>

      <Box sx={sx.tripletEntryGrid}>
        {fields.map(field => (
          <FieldCard key={field.id} field={field}>
            <StatsTripletInput
              label={field.label}
              totalKey={field.totalKey}
              successKey={field.successKey}
              rateKey={field.rateKey}
              totalValue={row[field.totalKey]}
              successValue={row[field.successKey]}
              rateValue={row[field.rateKey]}
              disabled={locked}
              readOnly={locked}
              onChange={patch => {
                if (locked) return
                onUpdateRow(patch)
              }}
            />
          </FieldCard>
        ))}
      </Box>
    </Box>
  )
}
