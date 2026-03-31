// playerProfile/modules/abilities/components/PlayerAbilitiesToolbar.js

import React from 'react'
import {
  Box,
  Typography,
  Chip,
  Button,
  ChipDelete,
} from '@mui/joy'
import JoyStarRatingStatic from '../../../../../../ui/domains/ratings/JoyStarRating.js'
import AbilitiesMultiSelectField from '../../../../../../ui/fields/selectUi/abilities/AbilitiesMultiSelectField.js'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { playerAbilitiesToolbarSx as sx } from '../sx/playerAbilities.toolbar.sx.js'
import { toFixed1, clamp0to5 } from '../logic/abilities.logic.js'

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
      color={color ? color : 'neutral'}
      startDecorator={idIcon ? iconUi({ id: idIcon, sx: { fontSize: 16 } }) : null}
      sx={{ '--Chip-paddingInline': '8px', maxWidth: '100%' }}
    >
      <Typography level="body-xs" noWrap sx={{ minWidth: 0 }}>
        {label}: <Typography color='primary' sx={{ display: 'inline', fontWeight: 700 }}> {value} </Typography>
      </Typography>
    </Chip>
  )
}

export default function PlayerAbilitiesToolbar({
  player,
  total = 0,
  filled = 0,

  formsCount = 0,
  evaluatorsCount = 0,

  onOpenInvite,
  invitePending = false,

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
          <StarRow label="יכולת נוכחית" value={player?.level} />
          <StarRow label="פוטנציאל" value={player?.levelPotential} />
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
            variant="solid"
            startDecorator={iconUi({ id: 'addAbilities' })}
            onClick={onOpenInvite}
            loading={invitePending}
            sx={sx.addBtn}
          >
            שליחת טופס
          </Button>

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
            label="מספר דיווחים"
            value={formsCount}
            idIcon="form"
          />

          <MetaChip
            label="מספר מעריכים"
            value={evaluatorsCount}
            idIcon="group"
          />

          <Box sx={{ flex: 1 }} />

          <MetaChip
            label="מוצגים"
            value={`${shownCount}/${totalDomains}`}
            idIcon="filter"
            color='warning'
          />
        </Box>
      </Box>
    </Box>
  )
}
