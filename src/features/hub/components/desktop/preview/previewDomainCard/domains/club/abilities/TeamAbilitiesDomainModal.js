// src/features/players/components/desktop/preview/PreviewDomainCard/domains/team/abilities/TeamAbilitiesDomainModal.js

import React, { useMemo, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Input,
  LinearProgress,
  Option,
  Select,
  Sheet,
  Stack,
  Typography,
  CircularProgress,
} from '@mui/joy'
import SearchRounded from '@mui/icons-material/SearchRounded'
import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi'
import { resolveTeamAbilitiesDomain } from './abilities.team.domain.logic'
import { teamAbilitiesDomainModalSx as sx } from './TeamAbilitiesDomainModal.sx'
import { buildDomainOptions, filterDomains, sumCoverageForItems } from './TeamAbilitiesDomainModal.logic'
import { fmtScore, isRated, scoreColor } from '../../../../../../../../../shared/abilities/abilities.utils'

// --- קבועים ---
const filledOptions = [
  { id: 'all', label: 'הכל' },
  { id: 'filled', label: 'רק מולא' },
  { id: 'missing', label: 'רק חסר' },
]

export default function TeamAbilitiesDomainModal({ entity, scope = 'global', scopeKey = null }) {
  const model = useMemo(() => resolveTeamAbilitiesDomain({ entity, scope, key: scopeKey }), [entity, scope, scopeKey])

  const summary = model?.summary || {}
  const domains = model?.domains || []
  const coverageMap = model?.coverageMap || {}
  const cov = model?.coverageSummary || { count: 0, total: 0, pct: 0 }

  const domainOptions = useMemo(() => buildDomainOptions(domains), [domains])

  const [q, setQ] = useState('')
  const [domainFilter, setDomainFilter] = useState('all')
  const [filledFilter, setFilledFilter] = useState('all')

  const filteredDomains = useMemo(
    () => filterDomains(domains, q, domainFilter, filledFilter),
    [domains, q, domainFilter, filledFilter]
  )

  const shownStats = useMemo(() => {
    let total = 0
    let filled = 0

    for (let i = 0; i < filteredDomains.length; i++) {
      const items = filteredDomains[i]?.items || []
      total += items.length
      for (let j = 0; j < items.length; j++) {
        if (isRated(items[j]?.value)) filled += 1
      }
    }

    return { total, filled }
  }, [filteredDomains])

  return (
    <Box sx={sx.wrap}>
      <Sheet variant="soft" sx={sx.topSheet}>
        <Box sx={sx.topRow}>
          <Box sx={sx.topChips}>
            <Chip size="sm" variant="soft"> {`סה״כ שחקנים בחישוב: ${summary.playersUsed}`} </Chip>
            <Chip size="sm" variant="soft">{`כיסוי: ${cov.count}/${cov.total} (${cov.pct}%)`}</Chip>
            <Chip size="sm" variant="soft" color={scoreColor(summary?.avgAll)}>{`ממוצע כללי: ${fmtScore(summary?.avgAll)}`}</Chip>
            <Chip size="sm" variant="soft">{`מוצג: ${shownStats.filled}/${shownStats.total}`}</Chip>
          </Box>
        </Box>
      </Sheet>

      <Divider sx={sx.divider} />

      <Sheet variant="soft" sx={sx.filtersSheet}>
        <Box sx={sx.filtersRow}>
          <SearchRounded fontSize="small" />
          <Input
            size="sm"
            placeholder="חיפוש לפי שם יכולת"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            sx={sx.searchInput}
          />

          <Select
            size="sm"
            value={domainFilter}
            onChange={(e, v) => setDomainFilter(v || 'all')}
            sx={sx.domainSelect}
          >
            {domainOptions.map((o) => (
              <Option key={o.id} value={o.id}>
                {o.label}
              </Option>
            ))}
          </Select>

          <Select
            size="sm"
            value={filledFilter}
            onChange={(e, v) => setFilledFilter(v || 'all')}
            sx={sx.filledSelect}
          >
            {filledOptions.map((o) => (
              <Option key={o.id} value={o.id}>
                {o.label}
              </Option>
            ))}
          </Select>
        </Box>
      </Sheet>

      <Divider sx={sx.divider} />

      {!filteredDomains.length ? (
        <Sheet variant="soft" sx={sx.emptySheet}>
          <Typography level="body-sm" sx={sx.emptyText}>
            אין יכולות להצגה לפי הסינון.
          </Typography>
        </Sheet>
      ) : (
        <Grid container spacing={2}>
          {filteredDomains.map((domain) => {
            const items = domain.items || []
            const domainAvg = domain?.avg
            const pct = Number.isFinite(domainAvg) ? (domainAvg / 5) * 100 : 0
            const dColor = domain?.color || scoreColor(domainAvg)
            const cov2 = sumCoverageForItems(coverageMap, items)

            return (
              <Grid key={domain.domain} xs={12} sm={6} lg={4}>
                <Card variant="outlined" sx={sx.card}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={sx.cardHeader}>
                      <Typography
                        level="title-sm"
                        sx={sx.cardTitle}
                        noWrap
                        startDecorator={iconUi({ id: domain.domain, size: 'sm' })}
                      >
                        {domain.domainLabel}
                      </Typography>
                      <Chip size="sm" variant="soft">{`מבוסס על ${domain.playersUsed} שחקנים`}</Chip>
                    </Stack>

                    <Stack direction="row" spacing={1.5} alignItems="center" sx={sx.scoreRow}>
                      <Box sx={sx.circleWrap}>
                        <CircularProgress determinate value={pct} color={dColor} sx={sx.circle} />
                        <Typography level="body-xs" sx={sx.circleValue}>
                          {fmtScore(domainAvg)}
                        </Typography>
                      </Box>

                      <Stack spacing={0.25} sx={sx.scoreMeta}>
                        <Typography level="body-xs" sx={sx.scoreLabel}>
                          ממוצע דומיין
                        </Typography>
                        <LinearProgress determinate value={pct} color={dColor} sx={sx.progress} />
                      </Stack>
                    </Stack>
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
