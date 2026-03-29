// playerProfile/modules/abilities/AbilityDomainCard.js

import {
  Box,
  Stack,
  Typography,
  Chip,
  Divider,
  LinearProgress,
  Tooltip,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/joy'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

import {
  isFilled,
  toFixed1,
  getScoreColor,
  calcDomainScore,
  DOMAIN_ACCENT,
} from './abilities.logic.js'

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
  const domainAvg = calcDomainScore(domain?.items || [])
  const pct = Number.isFinite(domainAvg) ? (domainAvg / 5) * 100 : 0
  const domainColor = getScoreColor(domainAvg)
  const filledCount = (domain?.items || []).filter((item) => isFilled(item?.value)).length
  const accent = DOMAIN_ACCENT?.[domain?.domain] || 'neutral'

  return (
    <Card variant="outlined" sx={domainCardSx(accent)}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography
            level="title-sm"
            startDecorator={iconUi({ id: domain?.domain })}
            sx={domainTitleSx(accent)}
          >
            {domain?.domainLabel}
          </Typography>

          <Chip size="sm" variant="soft" color={accent}>
            {filledCount}/{domain?.items?.length || 0}
          </Chip>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center" sx={domainAvgWrapSx}>
          <Box sx={domainAvgCircleWrapSx}>
            <CircularProgress
              determinate
              value={pct}
              color={domainColor}
              size="sm"
              sx={{ width: 48, height: 48 }}
            />
            <Box sx={domainAvgCircleCenterSx}>
              <Typography level="body-xs">{toFixed1(domainAvg)}</Typography>
            </Box>
          </Box>

          <Stack spacing={0.25}>
            <Typography level="body-xs" sx={{ color: 'neutral.500' }}>
              ממוצע דומיין
            </Typography>
            <LinearProgress determinate value={pct} color={domainColor} sx={domainAvgBarSx} />
          </Stack>
        </Stack>

        <Divider sx={{ my: 1 }} />

        <Stack spacing={0.6}>
          {(domain?.items || []).map((item) => {
            const filled = isFilled(item?.value)
            const itemPct = filled ? (item.value / 5) * 100 : 0
            const itemColor = filled ? getScoreColor(item?.value) : 'neutral'
            const tip = item?.description || item?.label

            return (
              <Box key={item?.id} sx={boxDomainSx}>
                {tip ? (
                  <Tooltip title={tip} placement="top" enterDelay={250}>
                    <Typography level="body-sm" startDecorator={iconUi({ id: item?.id })}>
                      {item?.label}
                    </Typography>
                  </Tooltip>
                ) : (
                  <Typography level="body-sm" startDecorator={iconUi({ id: item?.id })}>
                    {item?.label}
                  </Typography>
                )}

                <Chip
                  size="sm"
                  variant={filled ? 'soft' : 'outlined'}
                  color={itemColor}
                  sx={domainItemChipSx(filled)}
                >
                  {filled ? item?.value : '—'}
                </Chip>

                <LinearProgress
                  determinate
                  value={itemPct}
                  color={itemColor}
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
