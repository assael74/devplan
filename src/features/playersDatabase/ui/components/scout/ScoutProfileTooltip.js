// features/playersDatabase/ui/components/scout/ScoutProfileTooltip.js

import {
  Box,
  Typography,
} from '@mui/joy'

import {
  buildScoutProfileTooltipItems,
  DEFAULT_SCOUT_PROFILE_TOOLTIP_FIELDS,
} from '../../logic/scoutDisplay.logic.js'
import { scoutProfileTooltipSx as sx } from './sx/scoutComponents.sx.js'

const DEFAULT_FIELDS = DEFAULT_SCOUT_PROFILE_TOOLTIP_FIELDS

function TooltipBulletItem({ value, bulletSx }) {
  return (
    <Box sx={sx.itemRow}>
      <Box sx={bulletSx} />

      <Typography
        level='body-sm'
        sx={sx.itemValue}
      >
        {value}
      </Typography>
    </Box>
  )
}

function PrimaryTooltipItem({ item }) {
  if (!item) {
    return null
  }

  return (
    <Box sx={sx.primarySection}>
      <Typography
        level='body-xs'
        sx={sx.primaryLabel}
      >
        {item.label}
      </Typography>

      {Array.isArray(item.items) ? (
        <Box sx={sx.itemsList}>
          {item.items.map(childItem => (
            <TooltipBulletItem
              key={childItem.key}
              value={childItem.value}
              bulletSx={sx.primaryBullet}
            />
          ))}
        </Box>
      ) : (
        <Typography
          level='body-sm'
          sx={sx.itemValue}
        >
          {item.value}
        </Typography>
      )}
    </Box>
  )
}

function SecondaryTooltipItem({ item }) {
  return (
    <Box sx={sx.itemRow}>
      <Box sx={sx.secondaryBullet} />

      <Typography
        level='body-xs'
        sx={sx.secondaryValue}
      >
        <Box
          component='span'
          sx={sx.inlineLabel}
        >
          {item.label}:
        </Box>

        {' '}

        {item.value}
      </Typography>
    </Box>
  )
}

export default function ScoutProfileTooltip({ profile = {}, fields = DEFAULT_FIELDS, title }) {
  const items = buildScoutProfileTooltipItems({
    profile,
    fields,
  })

  const [ primaryItem, ...secondaryItems ] = items

  const tooltipTitle = (
    title ||
    profile?.label ||
    profile?.id ||
    'פרופיל סקאוט'
  )

  return (
    <Box sx={sx.root}>
      <Typography
        level='title-sm'
        sx={sx.title}
      >
        {tooltipTitle}
      </Typography>

      <PrimaryTooltipItem item={primaryItem} />

      {secondaryItems.length > 0 && (
        <Box sx={sx.secondaryList}>
          {secondaryItems.map(item => (
            <SecondaryTooltipItem
              key={item.key}
              item={item}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}
