// playerProfile/modules/abilities/AbilityHeader.js

import { getEntityColors } from '../../../../../ui/core/theme/Colors.js'

import React from 'react'
import { Box, Grid, Typography, Chip, Stack, Input, Switch, Button } from '@mui/joy'
import { Card, CardContent } from '@mui/joy'
import JoyStarRatingStatic from '../../../../../ui/domains/ratings/JoyStarRating.js'
import { toFixed1, clamp0to5, getScoreColor } from './abilities.logic'
import {
  abilityHeaderSx,
  headerChipsRowSx,
  headerStarsWrapSx,
  headerSearchInputSx,
  headerNoWrapSx,
  headerStarColSx,
  headerStarRowSx,
} from './Ability.module.sx'

const c = getEntityColors('players')

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
  onOpenInvite,
  invitePending,
}) {
  return (
    <Card variant="soft" sx={abilityHeaderSx}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={3}>
            <Typography level="title-sm">סיכום כולל</Typography>

            <Stack direction="row" spacing={1} alignItems="center" sx={headerChipsRowSx}>
              <Chip size="sm" variant="soft">{`הושלמו ${filled}/${total}`}</Chip>
              <Chip size="sm" variant="soft" color={getScoreColor(avgAll)}>{`ממוצע: ${toFixed1(avgAll)}`}</Chip>
            </Stack>
          </Grid>

          <Grid xs={12} md={3}>
            <Box sx={headerStarsWrapSx}>
              <StarRow label="יכולת נוכחית" value={player?.level} />
              <StarRow label="פוטנציאל" value={player?.levelPotential} />
            </Box>
          </Grid>

          <Grid xs={12} md={6}>
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

              <Button
                size="sm"
                variant="solid"
                onClick={onOpenInvite}
                loading={invitePending}
                sx={{
                  bgcolor: c.bg,
                  color: c.text,
                  transition: 'filter .15s ease, transform .12s ease',

                  '&:hover': {
                    bgcolor: c.bg,
                    color: c.text,
                    filter: 'brightness(0.96)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                שליחת טופס
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
