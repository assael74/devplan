// AbilityHeader.js
import React from 'react'
import { Box, Grid, Typography, Chip, Stack, Input, Switch } from '@mui/joy'
import { Card, CardContent } from '@mui/joy'
import JoyStarRatingStatic from '../../../../../ui/domains/ratings/JoyStarRating.js'
import { clamp0to5, toFixed1, scoreColor } from './abilities.logic'
import {
  abilityHeaderSx,
  headerChipsRowSx,
  headerStarsWrapSx,
  headerSearchInputSx,
  headerNoWrapSx,
  headerStarColSx,
  headerStarRowSx,
} from './Ability.module.sx'

function StarRow({ label, value }) {
  const numLabel = toFixed1(value)
  const starValue = clamp0to5(value)

  return (
    <Box sx={headerStarColSx}>
      <Typography fontSize="14px" level="body-xs" color="neutral">
        {label}
      </Typography>
      <Box sx={headerStarRowSx}>
        <Typography fontSize="14px" level="body-xs" color="neutral">
          {numLabel}
        </Typography>
        <JoyStarRatingStatic value={starValue} size="md" />
      </Box>
    </Box>
  )
}

export default function AbilityHeader({
  player,
  total,
  filled,
  avgAll,
  query,
  onChangeQuery,
  showOnlyFilled,
  onToggleShowOnlyFilled,
}) {
  return (
    <Card variant="soft" sx={abilityHeaderSx}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={4}>
            <Typography level="title-sm">סיכום כולל</Typography>

            <Stack direction="row" spacing={1} alignItems="center" sx={headerChipsRowSx}>
              <Chip size="sm" variant="soft">{`הושלמו ${filled}/${total}`}</Chip>
              <Chip size="sm" variant="soft" color={scoreColor(avgAll)}>{`ממוצע: ${toFixed1(avgAll)}`}</Chip>
            </Stack>
          </Grid>

          <Grid xs={12} md={4}>
            <Box sx={headerStarsWrapSx}>
              <StarRow label="יכולת נוכחית" value={player?.level} />
              <StarRow label="פוטנציאל" value={player?.levelPotential} />
            </Box>
          </Grid>

          <Grid xs={12} md={4}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="flex-end"
            >
              <Input
                size="sm"
                placeholder="חיפוש יכולת…"
                value={query}
                onChange={(e) => onChangeQuery(e.target.value)}
                sx={headerSearchInputSx}
              />

              <Stack direction="row" spacing={1} alignItems="center">
                <Switch
                  checked={showOnlyFilled}
                  onChange={(e) => onToggleShowOnlyFilled(e.target.checked)}
                  size="sm"
                />
                <Typography level="body-sm" sx={headerNoWrapSx}>
                  הצג רק מלאים
                </Typography>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
