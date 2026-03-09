/// teamProfile/modules/abilities/TeamAbilityDomainCard.js
import { Box, Stack, Typography, Chip, Divider, LinearProgress, Tooltip, CircularProgress } from '@mui/joy'
import { Card, CardContent } from '@mui/joy'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

import { isFilled, toFixed1, scoreColor, calcDomainScore, DOMAIN_ACCENT } from './logic/abilities.logic'
import { boxDomainSx, domainCardSx } from './Ability.module.sx'

export default function TeamAbilityDomainCard({
  domain,
  onOpenDomain,
  onOpenAbility,
}) {
  const domainAvg = calcDomainScore(domain.items)
  const pct = Number.isFinite(domainAvg) ? (domainAvg / 5) * 100 : 0
  const dColor = scoreColor(domainAvg)
  const accent = DOMAIN_ACCENT[domain.domain] || 'neutral'
  
  const usedPlayers = Number(domain.usedPlayers || 0)
  const totalPlayers = Number(domain.totalPlayers || 0)

  return (
    <Card variant="outlined" sx={domainCardSx(accent)}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography
            level="title-sm"
            startDecorator={iconUi({ id: domain.domain })}
            sx={{ color: `${accent}.700`, fontWeight: 600, cursor: 'pointer' }}
            onClick={() => onOpenDomain(domain)}
          >
            {domain.domainLabel}
          </Typography>

          <Tooltip title={`איכות הקבוצה נקבעה על בסיס ${usedPlayers}/${totalPlayers} שחקנים`}>
            <Chip size="sm" variant="soft" color={accent}>
              {usedPlayers}/{totalPlayers}
            </Chip>
          </Tooltip>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ my: 1 }}>
          <Box sx={{ position: 'relative', width: 48, height: 48 }}>
            <CircularProgress determinate value={pct} color={dColor} size="sm" sx={{ width: 48, height: 48 }} />
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography level="body-xs">{toFixed1(domainAvg)}</Typography>
            </Box>
          </Box>

          <Stack spacing={0.25}>
            <Typography level="body-xs" sx={{ color: 'neutral.500' }}>
              ממוצע דומיין
            </Typography>
            <LinearProgress determinate value={pct} color={dColor} sx={{ width: 160 }} />
          </Stack>
        </Stack>

        <Divider sx={{ my: 1 }} />

        <Stack spacing={0.6}>
          {domain.items.map((it) => {
            const filled = isFilled(it.value)
            const p = filled ? (it.value / 5) * 100 : 0
            const c = filled ? scoreColor(it.value) : 'neutral'
            const tip = `${it.label} • מבוסס על ${it.count || 0}/${totalPlayers} שחקנים • חסרים: ${Math.max(0, totalPlayers - (it.count || 0))}`

            return (
              <Box key={it.id} sx={{ ...boxDomainSx, cursor: 'pointer' }} onClick={() => onOpenAbility(it)}>
                <Tooltip title={tip}>
                  <Typography level="body-sm" startDecorator={iconUi({ id: it.id })}>
                    {it.label}
                  </Typography>
                </Tooltip>

                <Tooltip title={tip}>
                  <Chip
                    size="sm"
                    variant={filled ? 'soft' : 'outlined'}
                    color={c}
                    sx={{ minWidth: 22, fontWeight: filled ? 600 : 400, justifyContent: 'center', alignItems: 'center' }}
                  >
                    {filled ? toFixed1(it.value) : '—'}
                  </Chip>
                </Tooltip>

                <LinearProgress determinate value={p} color={c} size="sm" variant="plain" sx={{ gridColumn: '1 / -1' }} />
              </Box>
            )
          })}
        </Stack>

        {usedPlayers === 0 && (
          <Box sx={{ mt: 1, p: 1, borderRadius: 'sm', bgcolor: 'neutral.softBg' }}>
            <Typography level="body-xs" color="neutral">
              אין נתונים בדומיין זה
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
