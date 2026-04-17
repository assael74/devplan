// teamProfile/modules/abilities/TeamAbilitiesModule.js

import React, { useMemo, useState } from 'react'
import { Box, Grid, Typography, Divider, Card, CardContent } from '@mui/joy'

import { resolveTeamAbilitiesDomain } from '../../../../../../shared/abilities/abilities.domain.logic.js'

import TeamAbilitiesToolbar from './components/TeamAbilitiesToolbar.js'
import AbilitiesDomainCard from './components/AbilitiesDomainCard.js'
import TeamAbilitiesInsightsDrawer from './components/insightsDrawer/TeamAbilitiesInsightsDrawer.js'
import { isFilled } from './logic/abilities.logic.js'
import useAbilitiesSummary from './logic/useAbilitiesSummary.js'
import { abilitiesModuleSx, stickyHeaderWrapSx } from './sx/Ability.module.sx.js'

const DEFAULT_SELECTED_DOMAINS = [
  'technical',
  'physical',
  'gameUnderstanding',
  'mental',
  'cognitive',
]

export default function TeamAbilitiesModule({ entity, context }) {
  const [insightsDrawerOpen, setInsightsDrawerOpen] = useState(false)
  const [selectedDomains, setSelectedDomains] = useState(DEFAULT_SELECTED_DOMAINS)
  const [showOnlyFilled, setShowOnlyFilled] = useState(false)

  const team = entity || null

  const domainResult = useMemo(() => {
    return resolveTeamAbilitiesDomain(team || {}, context || {})
  }, [team, context])

  const domains = domainResult?.domains || []
  const summary = domainResult?.summary || {}

  const { total, filled, avgAll } = useAbilitiesSummary(domains)

  const filteredDomains = useMemo(() => {
    const selectedSet = new Set(selectedDomains || [])

    return domains
      .filter((domain) => {
        if (!selectedSet.size) return true
        return selectedSet.has(domain?.domain)
      })
      .map((domain) => {
        const items = (domain?.items || []).filter((item) => {
          return showOnlyFilled ? isFilled(item?.value) : true
        })

        return {
          ...domain,
          items,
          filled: items.filter((item) => isFilled(item?.value)).length,
        }
      })
      .filter((domain) => (domain?.items || []).length > 0)
  }, [domains, selectedDomains, showOnlyFilled])

  const indicators = useMemo(() => {
    const next = []

    if (selectedDomains.length) {
      next.push({
        id: 'domains',
        label: `דומיינים: ${selectedDomains.length}`,
        idIcon: 'filter',
        color: 'primary',
      })
    }

    if (showOnlyFilled) {
      next.push({
        id: 'filled-only',
        label: 'רק מלאים',
        idIcon: 'filter',
        color: 'primary',
      })
    }

    return next
  }, [selectedDomains, showOnlyFilled])

  function handleOpenInsights() {
    setInsightsDrawerOpen(true)
  }

  function handleClearIndicator(item) {
    if (!item?.id) return

    if (item.id === 'domains') {
      setSelectedDomains([])
      return
    }

    if (item.id === 'filled-only') {
      setShowOnlyFilled(false)
    }
  }

  return (
    <Box sx={abilitiesModuleSx} className="dpScrollThin">
      <Box sx={stickyHeaderWrapSx}>
        <TeamAbilitiesToolbar
          team={team}
          total={total}
          filled={filled}
          avgAll={avgAll}
          indicators={indicators}
          insightsPending={false}
          totalDomains={domains.length}
          shownCount={filteredDomains.length}
          selectedDomains={selectedDomains}
          onOpenInsights={handleOpenInsights}
          onClearIndicator={handleClearIndicator}
          onChangeSelectedDomains={setSelectedDomains}
          playersCount={summary?.playersCount || 0}
          playersWithAbilities={summary?.playersWithAbilities || 0}
        />
        <Divider sx={{ mt: 1 }} />
      </Box>

      <Grid container spacing={2} sx={{ p: 0.25 }}>
        {filteredDomains.map((domain) => (
          <Grid key={domain?.domain} xs={12} sm={6} lg={3}>
            <AbilitiesDomainCard domain={domain} />
          </Grid>
        ))}
      </Grid>

      {filteredDomains.length === 0 && (
        <Card variant="outlined" sx={{ mt: 1 }}>
          <CardContent>
            <Typography level="body-sm" sx={{ color: 'neutral.500' }}>
              אין תוצאות לתצוגה — נסה לנקות את הסינון של הדומיינים.
            </Typography>
          </CardContent>
        </Card>
      )}

      <TeamAbilitiesInsightsDrawer
        open={insightsDrawerOpen}
        onClose={() => setInsightsDrawerOpen(false)}
        entity={team}
        context={context}
      />
    </Box>
  )
}
