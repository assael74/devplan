// playerProfile/modules/abilities/components/PlayerAbilitiesToolbar.js

import React from 'react'
import { Box, Typography, Chip, Button } from '@mui/joy'
import JoyStarRatingStatic from '../../../../../../../ui/domains/ratings/JoyStarRating.js'
import AbilitiesMultiSelectField from '../../../../../../../ui/fields/selectUi/abilities/AbilitiesMultiSelectField.js'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { toolbarSx as sx } from '../sx/toolbar.sx.js'
import { toFixed1, clamp0to5 } from './../../../../sharedLogic/abilities'

function StarRow({ label, value }) {
  const numLabel = toFixed1(value)
  const starValue = clamp0to5(value)

  return (
    <Box sx={sx.starItem}>
      <Typography fontSize="14px" level="body-xs" color="neutral">
        {label} ({numLabel})
      </Typography>

      <JoyStarRatingStatic value={starValue} size="md" />
    </Box>
  )
}

function MetaChip({ label, value, idIcon, color }) {
  return (
    <Chip
      size="sm"
      variant="soft"
      color={color || 'neutral'}
      startDecorator={idIcon ? iconUi({ id: idIcon, sx: { fontSize: 16 } }) : null}
      sx={{ '--Chip-paddingInline': '8px', maxWidth: '100%' }}
    >
      <Typography level="body-xs" noWrap sx={{ minWidth: 0 }}>
        {label}:
        <Typography color="primary" sx={{ display: 'inline', fontWeight: 700 }}>
          {' '}
          {value}
        </Typography>
      </Typography>
    </Chip>
  )
}

export default function TeamAbilitiesToolbar({
  team,
  total = 0,
  filled = 0,

  playersCount = 0,
  playersWithAbilities = 0,

  onOpenInsights,
  insightsPending = false,

  indicators = [],
  onClearIndicator,
  selectedDomains,
  onChangeSelectedDomains,

  shownCount = 0,
  totalDomains = 0,
}) {
  return (
    <Box sx={sx.toolbar}>
      <Box sx={sx.topGrid}>
        <Box sx={sx.starsWrap}>
          <StarRow label="יכולת קבוצה" value={team?.squadStrength?.level?.avg || team?.level?.avg} />
          <StarRow
            label="פוטנציאל קבוצה"
            value={team?.squadStrength?.levelPotential?.avg || team?.levelPotential?.avg}
          />
        </Box>

        <Box sx={sx.actionsWrap}>
          <AbilitiesMultiSelectField
            value={selectedDomains || []}
            onChange={(value) => onChangeSelectedDomains(value || [])}
            placeholder="בחירת דומיינים לצפייה"
            clearableChips
            fieldWidth={600}
          />

          <Box sx={{ flex: 1 }} />

          <Button
            size="sm"
            variant="soft"
            startDecorator={iconUi({ id: 'insights' })}
            onClick={onOpenInsights}
            loading={insightsPending}
            sx={sx.insightsBtn}
          >
            תובנות
          </Button>
        </Box>
      </Box>

      <Box sx={sx.bottomRow}>
        <Box sx={sx.indicatorsRow}>
          <MetaChip
            label="יכולות שדווחו"
            value={`${filled}/${total}`}
            idIcon="abilities"
          />

          <MetaChip
            label="שחקנים בסגל"
            value={playersCount}
            idIcon="group"
          />

          <MetaChip
            label="שחקנים עם יכולות"
            value={playersWithAbilities}
            idIcon="check"
          />

          <Box sx={{ flex: 1 }} />

          <MetaChip
            label="מוצגים"
            value={`${shownCount}/${totalDomains}`}
            idIcon="filter"
            color="warning"
          />
        </Box>
      </Box>
    </Box>
  )
}
