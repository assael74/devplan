// teamProfile/mobile/modules/abilities/TeamAbilitiesModule.js

import React, { useMemo, useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
} from '@mui/joy'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'
import { MobileFiltersDrawerShell } from '../../../../../../ui/patterns/filters/index.js'

import TeamAbilitiesToolbar from './components/TeamAbilitiesToolbar.js'
import AbilitiesFiltersContent from './components/AbilitiesFiltersContent.js'
import AbilitiesDomainCard from './components/AbilitiesDomainCard.js'
import TeamAbilitiesInsightsDrawer from './components/insightsDrawer/TeamAbilitiesInsightsDrawer.js'

import { resolveTeamAbilitiesDomain } from '../../../../../../shared/abilities/abilities.domain.logic.js'
import {
  isFilled,
  useAbilitiesSummary,
} from '../../../sharedLogic/abilities'

import { profileSx as sx } from '../../sx/profile.sx'

const DEFAULT_SELECTED_DOMAINS = [
  'technical',
  'physical',
  'gameUnderstanding',
  'mental',
  'cognitive',
]

export default function TeamAbilitiesModule({
  entity,
  context,
  abilitiesInsightsOpen,
  setAbilitiesInsightsOpen,
  abilitiesInsightsRequest = 0,
}) {
  const [insightsOpen, setInsightsOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

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

  useEffect(() => {
    if (abilitiesInsightsRequest > 0) {
      setInsightsOpen(true)
    }
  }, [abilitiesInsightsRequest])

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

  const hasActiveFilters = indicators.length > 0

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

  function handleResetFilters() {
    setSelectedDomains([])
    setShowOnlyFilled(false)
  }

  return (
    <SectionPanelMobile>
      <Box sx={sx.moduleRoot}>
        <TeamAbilitiesToolbar
          team={team}
          total={total}
          filled={filled}
          avgAll={avgAll}
          indicators={indicators}
          totalDomains={domains.length}
          shownCount={filteredDomains.length}
          playersCount={summary?.playersCount || 0}
          playersWithAbilities={summary?.playersWithAbilities || 0}
          hasActiveFilters={hasActiveFilters}
          onOpenFilters={() => setFiltersOpen(true)}
          onClearIndicator={handleClearIndicator}
        />
      </Box>

      <Box sx={{ display: 'grid', gap: 0.9, minWidth: 0 }}>
        {filteredDomains.map((domain, index) => (
          <AbilitiesDomainCard
            key={domain?.domain}
            domain={domain}
            defaultExpanded={index === 0}
          />
        ))}
      </Box>

      {filteredDomains.length === 0 ? (
        <Card variant="outlined" sx={{ mt: 1 }}>
          <CardContent>
            <Typography level="body-sm" sx={{ color: 'neutral.500' }}>
              אין תוצאות לתצוגה. נקה פילטרים או בטל הצגה של מלאים בלבד.
            </Typography>
          </CardContent>
        </Card>
      ) : null}

      <MobileFiltersDrawerShell
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="סינון יכולות"
        entity="team"
        subtitle="התאם את תצוגת היכולות למסך המובייל"
        resultsText={`${filteredDomains.length} דומיינים מוצגים`}
        onReset={handleResetFilters}
        resetDisabled={!hasActiveFilters}
      >
        <AbilitiesFiltersContent
          selectedDomains={selectedDomains}
          onChangeSelectedDomains={setSelectedDomains}
          showOnlyFilled={showOnlyFilled}
          onToggleShowOnlyFilled={setShowOnlyFilled}
        />
      </MobileFiltersDrawerShell>

      <TeamAbilitiesInsightsDrawer
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        entity={team}
        summary={summary}
        context={context}
      />
    </SectionPanelMobile>
  )
}
