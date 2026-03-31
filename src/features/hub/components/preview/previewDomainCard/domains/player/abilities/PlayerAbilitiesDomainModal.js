// preview/PreviewDomainCard/domains/abilities/player/abilitiesDomainModal.js

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
import PlayerAbilitiesKpi from './components/PlayerAbilitiesKpi.js'
import PlayerAbilitiesFilters from './components/PlayerAbilitiesFilters.js'
import { resolveAbilitiesDomain } from '../../../../../../../../shared/abilities/abilities.domain.logic'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi'
import { sx } from './sx/playerAbilities.modal.sx.js'

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

  const [selectedDomains, setSelectedDomains] = useState([])

  const filteredDomains = useMemo(() => {
    const selectedSet = new Set(selectedDomains || [])

    return (domains || []).filter((domain) => {
      if (!selectedSet.size) return true
      return selectedSet.has(domain?.domain)
    })
  }, [domains, selectedDomains])

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
      <Box sx={{ position: 'sticky', top: -10, zIndex: 5, borderRadius: 12, bgcolor: 'background.body' }}>
        <PlayerAbilitiesKpi entity={entity} summary={summary} globalCount={globalCount} />

        <PlayerAbilitiesFilters
          selectedDomains={selectedDomains}
          onChangeSelectedDomains={setSelectedDomains}
          onReset={() => {
            setSelectedDomains([])
          }}
        />
      </Box>

      {/* Domains */}
      {!filteredDomains.length ? (
        <Sheet variant="soft" sx={{ p: 1, borderRadius: 'md' }}>
          <Typography level="body-sm" sx={{ opacity: 0.75 }}>
            אין יכולות להצגה לפי הסינון.
          </Typography>
        </Sheet>
      ) : (
        <Grid container spacing={1}>
          {filteredDomains.map((domain) => {
            const items = domain.items || []
            const domainAvg = calcDomainScore(items)
            const pct = Number.isFinite(domainAvg) ? (domainAvg / 5) * 100 : 0
            const dColor = scoreColor(domainAvg)
            const filledCount = items.filter((i) => isFilled(i.value)).length

            return (
              <Grid key={domain.domain} xs={12} sm={6} lg={4} sx={{ mt: 2 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack sx={sx.cardStack}>
                      <Typography level="title-sm" sx={{ minWidth: 0 }} noWrap startDecorator={iconUi({ id: domain.domain })}>
                        {domain.domainLabel}
                      </Typography>
                      <Chip size="sm" variant="soft">{`${filledCount}/${items.length}`}</Chip>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center" sx={{ my: 0.5 }}>
                      <Box sx={sx.domainBox}>
                        <CircularProgress
                          determinate
                          value={pct}
                          color={dColor}
                          sx={{ width: 42, height: 42  }}
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
