// playerProfile/modules/abilities/components/AbilitiesDomainCard.js

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
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import {
  isFilled,
  toFixed1,
  getScoreColor,
  calcDomainScore,
  DOMAIN_ACCENT,
} from './../../../../sharedLogic/abilities'

import { moduleSx as sx } from '../sx/module.sx.js'

export default function AbilitiesDomainCard({ domain }) {
  const domainAvg = Number(domain?.avg)
  const pct = Number(domain?.coveragePct || 0)
  const domainColor = domain?.color || getScoreColor(domainAvg)
  const filledCount = Number(domain?.filled || 0)
  const accent = DOMAIN_ACCENT[domain?.domain] || 'neutral'
  const avgLabel = domain?.hasRated ? domain?.avgLabel : '—'

  return (
    <Card variant="outlined" sx={sx.domainCard(accent)}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography
            level="title-sm"
            startDecorator={iconUi({ id: domain?.domain })}
            sx={{color: `${accent}.700`, fontWeight: 600}}
          >
            {domain?.domainLabel}
          </Typography>

          <Chip size="sm" variant="soft" color={accent}>
            {filledCount}/{domain?.items?.length || 0}
          </Chip>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ position: 'relative', width: 48, height: 48 }}>
          <Box sx={{ my: 1 }}>
            <CircularProgress
              determinate
              value={pct}
              color={domainColor}
              size="sm"
              sx={{ width: 48, height: 48 }}
            />
            <Box sx={sx.domainAvgCircle}>
              <Typography level="body-xs">{toFixed1(domainAvg)}</Typography>
            </Box>
          </Box>

          <Stack spacing={0.25}>
            <Typography level="body-xs" sx={{ color: 'neutral.500' }}>
              ממוצע דומיין
            </Typography>
            <LinearProgress determinate value={pct} color={domainColor} sx={{ width: 160 }} />
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
              <Box key={item?.id} sx={sx.boxDomain}>
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
                  sx={{ minWidth: 32, fontWeight: filled ? 600 : 400 }}
                >
                  {filled ? item?.value : '—'}
                </Chip>

                <LinearProgress
                  determinate
                  value={itemPct}
                  color={itemColor}
                  size="sm"
                  variant="plain"
                  sx={{ gridColumn: '1 / -1' }}
                />
              </Box>
            )
          })}
        </Stack>

        {filledCount === 0 && (
          <Box sx={sx.domainEmpty}>
            <Typography level="body-xs" color="neutral">
              אין נתונים בדומיין זה
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
