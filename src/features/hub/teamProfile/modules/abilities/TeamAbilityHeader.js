// teamProfile/modules/abilities/TeamAbilityHeader.js

import React from 'react'
import { Box, Grid, Typography, Chip, Stack, Input, Switch, Card, CardContent } from '@mui/joy'
import JoyStarRatingStatic from '../../../../../ui/domains/ratings/JoyStarRating.js'
import { clamp0to5, toFixed1, getScoreColor } from './logic/abilities.logic.js'

function StarRow({ label, value }) {
  const numLabel = toFixed1(value)
  const starValue = clamp0to5(value)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography fontSize="14px" level="body-xs" color="neutral">
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography fontSize="14px" level="body-xs" color="neutral">
          {numLabel}
        </Typography>
        <JoyStarRatingStatic value={starValue} size="md" />
      </Box>
    </Box>
  )
}

export default function TeamAbilityHeader({
  levelAvg,
  levelPotentialAvg,
  totalAbilities,
  filledAbilities,
  avgAll,
  totalPlayers,
  usedPlayers,
  usedPlayersPotential,
  query,
  onChangeQuery,
  showOnlyFilled,
  onToggleShowOnlyFilled,
}) {
  return (
    <Card variant="soft">
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={4}>
            <Typography level="title-sm">סיכום יכולות קבוצה</Typography>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, flexWrap: 'wrap' }}>
              <Chip size="sm" variant="soft">
                {`יכולות שמולאו: ${filledAbilities}/${totalAbilities}`}
              </Chip>

              <Chip size="sm" variant="soft" color={getScoreColor(avgAll)}>
                {`ממוצע יכולות: ${toFixed1(avgAll)}`}
              </Chip>

              <Chip size="sm" variant="soft" title="על בסיס כמה שחקנים נקבעה רמת הקבוצה">
                {`איכות נקבעה על בסיס ${usedPlayers}/${totalPlayers} שחקנים`}
              </Chip>

              <Chip size="sm" variant="soft" title="על בסיס כמה שחקנים נקבע הפוטנציאל">
                {`פוטנציאל נקבע על בסיס ${usedPlayersPotential}/${totalPlayers}`}
              </Chip>
            </Stack>
          </Grid>

          <Grid xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3, alignItems: 'center', ml: 1 }}>
              <StarRow label="רמת קבוצה" value={levelAvg} />
              <StarRow label="פוטנציאל קבוצה" value={levelPotentialAvg} />
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
                onChange={(e) => onChangeQuery?.(e.target.value)}
                sx={{ maxWidth: 280 }}
              />

              <Stack direction="row" spacing={1} alignItems="center">
                <Switch
                  checked={showOnlyFilled}
                  onChange={(e) => onToggleShowOnlyFilled?.(e.target.checked)}
                  size="sm"
                />
                <Typography level="body-sm" sx={{ whiteSpace: 'nowrap' }}>
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
