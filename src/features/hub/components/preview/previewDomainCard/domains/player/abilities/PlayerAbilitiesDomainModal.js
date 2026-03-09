// src/features/players/components/preview/PreviewDomainCard/domains/abilities/player/abilitiesDomainModal.js
import React, { useMemo, useState } from 'react'
import {
  Box,
  Chip,
  Divider,
  Input,
  Option,
  Select,
  Sheet,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Stack,
  CircularProgress
} from '@mui/joy'
import SearchRounded from '@mui/icons-material/SearchRounded'
import { resolveAbilitiesDomain } from '../../../../../../../../shared/abilities/abilities.domain.logic'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi'

const safe = (v) => (v == null ? '' : String(v))
const isFilled = (v) => Number.isFinite(v) && v > 0
const toFixed1 = (v) => (Number.isFinite(v) ? (Math.round(v * 10) / 10).toFixed(1) : '—')

const filledOptions = [
  { id: 'all', label: 'הכל' },
  { id: 'filled', label: 'רק מולא' },
  { id: 'missing', label: 'רק חסר' },
]

function scoreColor(v) {
  if (!Number.isFinite(v)) return 'neutral'
  if (v >= 4) return 'success'
  if (v >= 3) return 'primary'
  if (v > 0) return 'warning'
  return 'neutral'
}

function calcDomainScore(items = []) {
  const filledItems = items.filter((i) => isFilled(i.value))
  if (!filledItems.length) return NaN

  const hasWeights = filledItems.some((i) => typeof i.weight === 'number' && i.weight > 0)
  if (hasWeights) {
    const wSum = filledItems.reduce((s, i) => s + (i.weight || 0), 0)
    if (!wSum) return NaN
    return filledItems.reduce((s, i) => s + i.value * (i.weight || 0), 0) / wSum
  }

  return filledItems.reduce((s, i) => s + i.value, 0) / filledItems.length
}

export default function AbilitiesDomainModal({ entity, onClose }) {
  const model = useMemo(() => resolveAbilitiesDomain(entity), [entity])
  const { summary, domains } = model || { summary: {}, domains: [] }

  const domainOptions = useMemo(
    () => [{ id: 'all', label: 'כל הדומיינים' }, ...(domains || []).map((d) => ({ id: d.domain, label: d.domainLabel }))],
    [domains]
  )

  const [q, setQ] = useState('')
  const [domainFilter, setDomainFilter] = useState('all')
  const [filledFilter, setFilledFilter] = useState('all')

  const filteredDomains = useMemo(() => {
    const search = q.trim().toLowerCase()
    const df = safe(domainFilter).toLowerCase().trim()
    const ff = safe(filledFilter).toLowerCase().trim()

    const domainPass = (d) => df === 'all' || df === safe(d.domain).toLowerCase().trim()

    const itemPass = (it) => {
      const filled = isFilled(it.value)
      if (ff === 'filled' && !filled) return false
      if (ff === 'missing' && filled) return false
      if (!search) return true
      return safe(it.label).toLowerCase().includes(search) || safe(it.id).toLowerCase().includes(search)
    }

    return (domains || [])
      .filter(domainPass)
      .map((d) => {
        const items2 = (d.items || []).filter(itemPass)
        return { ...d, items: items2 }
      })
      .filter((d) => d.items && d.items.length)
  }, [domains, q, domainFilter, filledFilter])

  const globalCount = useMemo(() => {
    let total = 0
    let filled = 0
    for (const d of filteredDomains) {
      const items = d.items || []
      total += items.length
      filled += items.filter((i) => isFilled(i.value)).length
    }
    return { total, filled }
  }, [filteredDomains])

  return (
    <Box sx={{ minWidth: 0 }}>
      {/* KPI strip */}
      <Sheet variant="soft" sx={{ p: 1, borderRadius: 'md' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
            <Chip size="sm" variant="soft">{`הושלמו: ${summary?.filled ?? 0}/${summary?.total ?? 0}`}</Chip>
            <Chip size="sm" variant="soft" color={summary?.color || 'neutral'}>{`ממוצע כללי: ${toFixed1(summary?.avgAll)}`}</Chip>
            <Chip size="sm" variant="soft" color={summary?.strongest?.color || 'neutral'}>
              {summary?.strongest ? `חוזקה: ${summary.strongest.domainLabel} (${toFixed1(summary.strongest.avg)})` : 'חוזקה: —'}
            </Chip>
            <Chip size="sm" variant="soft" color={summary?.weakest?.color || 'neutral'}>
              {summary?.weakest ? `חולשה: ${summary.weakest.domainLabel} (${toFixed1(summary.weakest.avg)})` : 'חולשה: —'}
            </Chip>
          </Box>

          <Chip size="sm" variant="soft">{`מוצג: ${globalCount.filled}/${globalCount.total}`}</Chip>
        </Box>
      </Sheet>

      <Divider sx={{ my: 1.25 }} />

      {/* Filters */}
      <Sheet variant="soft" sx={{ p: 1, borderRadius: 'md' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <SearchRounded fontSize="small" />
          <Input
            size="sm"
            placeholder="חיפוש לפי שם יכולת."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            sx={{ flex: 1, minWidth: 220 }}
          />

          <Select size="sm" value={domainFilter} onChange={(e, v) => setDomainFilter(v || 'all')} sx={{ minWidth: 180 }}>
            {domainOptions.map((o) => (
              <Option key={o.id} value={o.id}>
                {o.label}
              </Option>
            ))}
          </Select>

          <Select size="sm" value={filledFilter} onChange={(e, v) => setFilledFilter(v || 'all')} sx={{ minWidth: 150 }}>
            {filledOptions.map((o) => (
              <Option key={o.id} value={o.id}>
                {o.label}
              </Option>
            ))}
          </Select>
        </Box>
      </Sheet>

      <Divider sx={{ my: 1.25 }} />

      {/* Domains */}
      {!filteredDomains.length ? (
        <Sheet variant="soft" sx={{ p: 1, borderRadius: 'md' }}>
          <Typography level="body-sm" sx={{ opacity: 0.75 }}>
            אין יכולות להצגה לפי הסינון.
          </Typography>
        </Sheet>
      ) : (
        <Grid container spacing={2}>
          {filteredDomains.map((domain) => {
            const items = domain.items || []
            const domainAvg = calcDomainScore(items)
            const pct = Number.isFinite(domainAvg) ? (domainAvg / 5) * 100 : 0
            const dColor = scoreColor(domainAvg)
            const filledCount = items.filter((i) => isFilled(i.value)).length

            return (
              <Grid key={domain.domain} xs={12} sm={6} lg={4}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ gap: 1 }}>
                      <Typography level="title-sm" sx={{ minWidth: 0 }} noWrap startDecorator={iconUi({ id: domain.domain })}>
                        {domain.domainLabel}
                      </Typography>
                      <Chip size="sm" variant="soft">{`${filledCount}/${items.length}`}</Chip>
                    </Stack>

                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ my: 1 }}>
                    <Box sx={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
                      <CircularProgress
                        determinate
                        value={pct}
                        color={dColor}
                        sx={{ width: 48, height: 48  }}
                      />

                      <Typography
                        level="body-xs"
                        sx={{
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%) translateY(1px)',
                          lineHeight: 1,
                          fontWeight: 600,
                        }}
                      >
                        {toFixed1(domainAvg)}
                      </Typography>
                    </Box>


                      <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                        <Typography level="body-xs" sx={{ color: 'neutral.500' }}>
                          ממוצע דומיין
                        </Typography>
                        <LinearProgress determinate value={pct} color={dColor} sx={{ width: 160, maxWidth: '100%' }} />
                      </Stack>
                    </Stack>

                    {/* אם תרצה בהמשך: אפשר להוסיף כאן “Top 3” יכולות של הדומיין בלי לרדת לפרטים */}
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}
    </Box>
  )
}
