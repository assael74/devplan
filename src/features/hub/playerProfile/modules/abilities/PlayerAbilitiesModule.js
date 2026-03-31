// playerProfile/modules/abilities/PlayerAbilitiesModule.js

import React, { useMemo, useState } from 'react'
import { Box, Grid, Typography, Divider, Card, CardContent } from '@mui/joy'

import { resolveAbilitiesDomain } from '../../../../../shared/abilities/abilities.domain.logic.js'

import PlayerAbilitiesToolbar from './components/PlayerAbilitiesToolbar.js'
import AbilitiesDomainCard from './components/AbilitiesDomainCard'
import AbilitiesInviteCreateDrawer from './components/inviteDrawer/AbilitiesInviteCreateDrawer'
import PlayerAbilitiesInsightsDrawer from './components/insightsDrawer/PlayerAbilitiesInsightsDrawer.js'
import { isFilled } from './logic/abilities.logic.js'
import useAbilitiesSummary from './logic/useAbilitiesSummary.js'
import { abilitiesModuleSx, stickyHeaderWrapSx } from './sx/Ability.module.sx'

export default function PlayerAbilitiesModule({ entity, context }) {
  const [inviteDrawerOpen, setInviteDrawerOpen] = useState(false)
  const [insightsDrawerOpen, setInsightsDrawerOpen] = useState(false)
  const [selectedDomains, setSelectedDomains] = useState(['technical', 'physical', 'gameUnderstanding', 'mental', 'cognitive'])
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
      return
    }
  }

  return (
    <Box sx={abilitiesModuleSx} className="dpScrollThin">
      <Box sx={stickyHeaderWrapSx}>
        <PlayerAbilitiesToolbar
          player={player}
          total={total}
          filled={filled}
          avgAll={avgAll}
          insightsPending={false}
          indicators={indicators}
          invitePending={invitePending}
          totalDomains={domains.length}
          showOnlyFilled={showOnlyFilled}
          onOpenInvite={handleOpenInvite}
          selectedDomains={selectedDomains}
          shownCount={filteredDomains.length}
          onOpenInsights={handleOpenInsights}
          onClearIndicator={handleClearIndicator}
          onToggleShowOnlyFilled={setShowOnlyFilled}
          onChangeSelectedDomains={setSelectedDomains}
          formsCount={player?.abilitiesState?.evaluation?.formsCount || 0}
          evaluatorsCount={player?.abilitiesState?.evaluation?.evaluatorsCount || 0}
        />
        <Divider sx={{ mt: 1 }} />
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
              אין תוצאות לתצוגה — נסה לבטל “הצג רק מלאים” או נקה את החיפוש.
            </Typography>
          </CardContent>
        </Card>
      )}

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

      {/* כאן תחבר בהמשך את מגירת התובנות */}
      <PlayerAbilitiesInsightsDrawer
        open={insightsDrawerOpen}
        onClose={() => setInsightsDrawerOpen(false)}
        entity={player}
      />
    </Box>
  )
}
