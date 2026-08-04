// teamProfile/desktop/modules/abilities/components/TeamAbilitiesToolbar.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'
import AbilitiesMultiSelectField from '../../../../../../../ui/fields/abilities/AbilitiesMultiSelectField.js'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { toolbarSx as sx } from '../sx/toolbar.sx.js'
import { toFixed1 } from './../../../../sharedLogic/abilities'

function SummaryMetric({ label, value, idIcon }) {
  return (
    <Box sx={sx.summaryMetric}>
      <Box sx={sx.summaryIcon}>
        {iconUi({ id: idIcon })}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography level="body-xs" sx={sx.summaryLabel}>
          {label}
        </Typography>

        <Typography level="title-sm" sx={sx.summaryValue} noWrap>
          {value}
        </Typography>
      </Box>
    </Box>
  )
}

export default function TeamAbilitiesToolbar({
  team,
  total = 0,
  filled = 0,
  playersCount = 0,
  playersWithAbilities = 0,
  indicators = [],
  onClearIndicator,
  selectedDomains,
  onChangeSelectedDomains,
  shownCount = 0,
  totalDomains = 0,
}) {
  const teamAbility = toFixed1(team?.squadStrength?.level?.avg || team?.level?.avg)
  const teamPotential = toFixed1(team?.squadStrength?.levelPotential?.avg || team?.levelPotential?.avg)

  return (
    <Box sx={sx.toolbar}>
      <Box sx={sx.summaryRow}>
        <SummaryMetric label="יכולת קבוצה" value={teamAbility} idIcon="abilities" />
        <SummaryMetric label="פוטנציאל" value={teamPotential} idIcon="potential" />
        <SummaryMetric label="שחקנים דורגו" value={`${playersWithAbilities}/${playersCount}`} idIcon="players" />
        <SummaryMetric label="יכולות שמולאו" value={`${filled}/${total}`} idIcon="check" />
        <SummaryMetric label="דומיינים מוצגים" value={`${shownCount}/${totalDomains}`} idIcon="filter" />
      </Box>

      <Box sx={sx.filtersRow}>
        <AbilitiesMultiSelectField
          value={selectedDomains || []}
          onChange={(value) => onChangeSelectedDomains(value || [])}
          placeholder="בחירת דומיינים לצפייה"
          clearableChips
          fieldWidth={600}
        />

        {indicators.map((item) => (
          <Chip
            key={item.id}
            size="sm"
            variant="soft"
            color="neutral"
            onClick={() => onClearIndicator?.(item)}
            startDecorator={iconUi({ id: item.idIcon || 'filter' })}
          >
            {item.label}
          </Chip>
        ))}
      </Box>
    </Box>
  )
}
