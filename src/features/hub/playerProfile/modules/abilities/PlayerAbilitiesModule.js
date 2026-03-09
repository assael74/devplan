// PlayerAbilitiesModule.js
import React, { useMemo, useState } from 'react'
import { Box, Grid, Typography, Divider } from '@mui/joy'
import { Card, CardContent } from '@mui/joy'
import { groupAbilitiesByDomain } from '../../../../../shared/abilities/abilities.grouping.js'
import AbilityHeader from './AbilityHeader'
import AbilityDomainCard from './AbilityDomainCard'
import { isFilled } from './abilities.logic'
import useAbilitiesSummary from './useAbilitiesSummary'
import { abilitiesModuleSx, stickyHeaderWrapSx } from './Ability.module.sx'

export default function PlayerAbilitiesModule({ entity }) {
  const player = entity

  const domains = useMemo(
    () => groupAbilitiesByDomain(player?.abilities || {}),
    [player?.abilities]
  )

  const { total, filled, avgAll } = useAbilitiesSummary(domains)

  const [showOnlyFilled, setShowOnlyFilled] = useState(false)
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()

  const filteredDomains = useMemo(() => {
    return domains
      .map((d) => {
        const items = d.items.filter((i) => {
          const passFilled = showOnlyFilled ? isFilled(i.value) : true
          const passQuery = q
            ? (i.label?.toLowerCase().includes(q) || i.id?.toLowerCase().includes(q))
            : true
          return passFilled && passQuery
        })
        return { ...d, items }
      })
      .filter((d) => d.items.length > 0)
  }, [domains, showOnlyFilled, q])

  return (
    <Box sx={abilitiesModuleSx} className="dpScrollThin">
      <Box sx={stickyHeaderWrapSx}>
        <AbilityHeader
          player={player}
          total={total}
          filled={filled}
          avgAll={avgAll}
          query={query}
          onChangeQuery={setQuery}
          showOnlyFilled={showOnlyFilled}
          onToggleShowOnlyFilled={setShowOnlyFilled}
        />
        <Divider sx={{ mt: 1 }} />
    </Box>

      <Grid container spacing={2} sx={{ p: 0.25 }}>
        {filteredDomains.map((domain) => (
          <Grid key={domain.domain} xs={12} sm={6} lg={3}>
            <AbilityDomainCard domain={domain} />
          </Grid>
        ))}
      </Grid>

      {filteredDomains.length === 0 && (
        <Card variant="outlined" sx={{ mt: 1 }}>
          <CardContent>
            <Typography level="body-sm" sx={{ color: 'neutral.500' }}>
              אין תוצאות לתצוגה — נסה לבטל “הצג רק מלאים” או נקה את החיפוש.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
