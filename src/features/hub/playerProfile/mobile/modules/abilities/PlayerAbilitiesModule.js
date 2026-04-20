// playerProfile/mobile/modules/abilities/PlayerAbilitiesModule.js

import React, { useMemo, useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControl,
  FormLabel,
  FormHelperText,
} from '@mui/joy'
import { useTheme } from '@mui/joy/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'
import EmptyState from '../../../../sharedProfile/EmptyState.js'

import { resolveAbilitiesDomain } from '../../../../../../shared/abilities/abilities.domain.logic.js'

import PlayerAbilitiesToolbar from './components/PlayerAbilitiesToolbar.js'
import AbilitiesFiltersContent from './components/AbilitiesFiltersContent.js'
import AbilitiesDomainCard from './components/AbilitiesDomainCard'
import AbilitiesInviteCreateDrawer from './components/inviteDrawer/AbilitiesInviteCreateDrawer'
import PlayerAbilitiesInsightsDrawer from './components/insightsDrawer/PlayerAbilitiesInsightsDrawer.js'

import { MobileFiltersDrawerShell } from '../../../../../../ui/patterns/filters/index.js'

import { isFilled, useAbilitiesSummary } from './../../../sharedLogic'
//import { moduleSx as sx } from './sx/Ability.module.sx'
import { profileSx as sx } from './../../sx/profile.sx'

export default function PlayerAbilitiesModule({ entity, context }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [inviteDrawerOpen, setInviteDrawerOpen] = useState(false)
  const [insightsDrawerOpen, setInsightsDrawerOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [selectedDomains, setSelectedDomains] = useState([
    'technical',
    'physical',
    'gameUnderstanding',
    'mental',
    'cognitive',
  ])
  const [showOnlyFilled, setShowOnlyFilled] = useState(false)
  const [invitePending, setInvitePending] = useState(false)
  const [inviteResult, setInviteResult] = useState(null)

  const player = entity || null
  const domainResult = useMemo(() => resolveAbilitiesDomain(player || {}), [player])
  const domains = domainResult?.domains || []

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
        }
      })
      .filter((domain) => domain?.items?.length > 0)
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

  const hasActiveFilters = indicators.length > 0

  function handleOpenInvite() {
    setInviteDrawerOpen(true)
  }

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

  function handleResetFilters() {
    setSelectedDomains([])
    setShowOnlyFilled(false)
  }

  return (
    <SectionPanelMobile>
      <Box sx={sx.moduleRoot}>
        <PlayerAbilitiesToolbar
          player={player}
          total={total}
          filled={filled}
          avgAll={avgAll}
          insightsPending={false}
          indicators={indicators}
          invitePending={invitePending}
          totalDomains={domains.length}
          shownCount={filteredDomains.length}
          formsCount={player?.abilitiesState?.evaluation?.formsCount || 0}
          evaluatorsCount={player?.abilitiesState?.evaluation?.evaluatorsCount || 0}
          hasActiveFilters={hasActiveFilters}
          filtersCount={indicators.length}
          isMobile={isMobile}
          onOpenInvite={handleOpenInvite}
          onOpenInsights={handleOpenInsights}
          onOpenFilters={() => setFiltersOpen(true)}
          onClearIndicator={handleClearIndicator}
        />
      </Box>

      {inviteResult?.invite?.link ? (
        <Card variant="outlined" sx={{ mt: 1, mb: 1 }}>
          <CardContent>
            <Typography level="title-sm">קישור טופס שנוצר</Typography>
            <Typography level="body-sm">{inviteResult?.invite?.link}</Typography>
            <Typography level="body-sm" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
              {inviteResult?.whatsappText}
            </Typography>
          </CardContent>
        </Card>
      ) : null}

      <Box sx={{ display: 'grid', gap: 0.9, minWidth: 0 }}>
        {filteredDomains.map((domain, index) => (
          <AbilitiesDomainCard
            key={domain?.domain}
            domain={domain}
            defaultExpanded={index === 0}
          />
        ))}
      </Box>

      {filteredDomains.length === 0 && (
        <Card variant="outlined" sx={{ mt: 1 }}>
          <CardContent>
            <Typography level="body-sm" sx={{ color: 'neutral.500' }}>
              אין תוצאות לתצוגה. נקה פילטרים או בטל הצגה של מלאים בלבד.
            </Typography>
          </CardContent>
        </Card>
      )}

      <MobileFiltersDrawerShell
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="סינון יכולות"
        entity='player'
        subtitle="התאם את התצוגה למסך המובייל"
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

      <AbilitiesInviteCreateDrawer
        open={inviteDrawerOpen}
        onClose={() => setInviteDrawerOpen(false)}
        player={player}
        context={context}
        pending={invitePending}
        onPendingChange={setInvitePending}
        createdState={inviteResult}
        onCreatedStateChange={setInviteResult}
      />

      <PlayerAbilitiesInsightsDrawer
        open={insightsDrawerOpen}
        onClose={() => setInsightsDrawerOpen(false)}
        entity={player}
      />
    </SectionPanelMobile>
  )
}
