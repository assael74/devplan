// playerProfile/modules/abilities/AbilityDomainCard.js

import { Box, Stack, Typography, Chip, Divider, LinearProgress, Tooltip, CircularProgress } from '@mui/joy'
import { Card, CardContent } from '@mui/joy'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

import {
  isFilled,
  toFixed1,
  scoreColor,
  calcDomainScore,
  DOMAIN_ACCENT,
} from './abilities.logic'

import {
  boxDomainSx,
  domainCardSx,
  domainTitleSx,
  domainAvgWrapSx,
  domainAvgCircleWrapSx,
  domainAvgCircleCenterSx,
  domainAvgBarSx,
  domainEmptyBoxSx,
  domainItemChipSx,
  domainItemBarSx,
} from './Ability.module.sx'

export default function AbilityDomainCard({ domain }) {
  const domainAvg = calcDomainScore(domain.items)
  const pct = Number.isFinite(domainAvg) ? (domainAvg / 5) * 100 : 0
  const dColor = scoreColor(domainAvg)
  const filledCount = domain.items.filter((i) => isFilled(i.value)).length
  const accent = DOMAIN_ACCENT[domain.domain] || 'neutral'

  return (
    <Card variant="outlined" sx={domainCardSx(accent)}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography
            level="title-sm"
            startDecorator={iconUi({ id: domain.domain })}
            sx={domainTitleSx(accent)}
          >
            {domain.domainLabel}
          </Typography>

          <Chip size="sm" variant="soft" color={accent}>
            {filledCount}/{domain.items.length}
          </Chip>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center" sx={domainAvgWrapSx}>
          <Box sx={domainAvgCircleWrapSx}>
            <CircularProgress determinate value={pct} color={dColor} size="sm" sx={{ width: 48, height: 48 }} />
            <Box sx={domainAvgCircleCenterSx}>
              <Typography level="body-xs">{toFixed1(domainAvg)}</Typography>
            </Box>
          </Box>

          <Stack spacing={0.25}>
            <Typography level="body-xs" sx={{ color: 'neutral.500' }}>
              ממוצע דומיין
            </Typography>
            <LinearProgress determinate value={pct} color={dColor} sx={domainAvgBarSx} />
          </Stack>
        </Stack>

        <Divider sx={{ my: 1 }} />

        <Stack spacing={0.6}>
          {domain.items.map((it) => {
            const filled = isFilled(it.value)
            const p = filled ? (it.value / 5) * 100 : 0
            const c = filled ? scoreColor(it.value) : 'neutral'
            const tip = it?.description || it?.label

            return (
              <Box key={it.id} sx={boxDomainSx}>
                {tip ? (
                  <Tooltip title={tip} placement="top" enterDelay={250}>
                    <Typography level="body-sm" startDecorator={iconUi({ id: it.id })}>
                      {it.label}
                    </Typography>
                  </Tooltip>
                ) : (
                  <Typography level="body-sm" startDecorator={iconUi({ id: it.id })}>
                    {it.label}
                  </Typography>
                )}

                <Chip
                  size="sm"
                  variant={filled ? 'soft' : 'outlined'}
                  color={c}
                  sx={domainItemChipSx(filled)}
                >
                  {filled ? it.value : '—'}
                </Chip>

                <LinearProgress
                  determinate
                  value={p}
                  color={c}
                  size="sm"
                  variant="plain"
                  sx={domainItemBarSx}
                />
              </Box>
            )
          })}
        </Stack>

        {filledCount === 0 && (
          <Box sx={domainEmptyBoxSx}>
            <Typography level="body-xs" color="neutral">
              אין נתונים בדומיין זה
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
