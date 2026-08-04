// playerProfile/desktop/modules/abilities/components/AbilitiesDomainCard.js

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
  DOMAIN_ACCENT,
} from './../../../../sharedLogic'

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
} from '../sx/Ability.module.sx'

const EMPTY = '\u2014'
const DOMAIN_AVG_LABEL = '\u05de\u05de\u05d5\u05e6\u05e2 \u05d3\u05d5\u05de\u05d9\u05d9\u05df'
const NO_DOMAIN_DATA = '\u05d0\u05d9\u05df \u05e0\u05ea\u05d5\u05e0\u05d9\u05dd \u05d1\u05d3\u05d5\u05de\u05d9\u05d9\u05df \u05d6\u05d4'

export default function AbilitiesDomainCard({ domain }) {
  const domainAvg = Number(domain?.avg)
  const pct = Number(domain?.coveragePct || 0)
  const domainColor = domain?.color || getScoreColor(domainAvg)
  const filledCount = Number(domain?.filled || 0)
  const accent = DOMAIN_ACCENT[domain?.domain] || 'neutral'

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
              {DOMAIN_AVG_LABEL}
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
                  {filled ? item?.value : EMPTY}
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
              {NO_DOMAIN_DATA}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
