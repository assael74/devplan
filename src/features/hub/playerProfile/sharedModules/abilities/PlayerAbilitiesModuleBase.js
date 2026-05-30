// playerProfile/sharedModules/abilities/PlayerAbilitiesModuleBase.js

import React from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
} from '@mui/joy'

import { MobileFiltersDrawerShell } from '../../../../../ui/patterns/filters/index.js'

import usePlayerAbilitiesModuleModel from './usePlayerAbilitiesModuleModel.js'

export default function PlayerAbilitiesModuleBase({
  entity,
  context,
  abilitiesInsightsRequest = 0,

  isMobile = false,
  Section,

  rootSx,
  desktopRootSx,
  stickyHeaderSx,

  PlayerAbilitiesToolbar,
  AbilitiesFiltersContent,
  AbilitiesDomainCard,
  AbilitiesInviteCreateDrawer,
  PlayerAbilitiesInsightsDrawer,
}) {
  const model = usePlayerAbilitiesModuleModel({
    entity,
    abilitiesInsightsRequest,
  })

  const {
    player,
    domains,

    total,
    filled,
    avgAll,

    filteredDomains,
    indicators,
    hasActiveFilters,

    inviteDrawerOpen,
    insightsOpen,
    filtersOpen,

    selectedDomains,
    showOnlyFilled,
    invitePending,
    inviteResult,

    setInviteDrawerOpen,
    setInsightsOpen,
    setFiltersOpen,
    setSelectedDomains,
    setShowOnlyFilled,
    setInvitePending,
    setInviteResult,

    handleOpenInvite,
    handleClearIndicator,
    handleResetFilters,
  } = model

  const formsCount =
    player?.abilitiesState?.evaluation?.formsCount || 0

  const evaluatorsCount =
    player?.abilitiesState?.evaluation?.evaluatorsCount || 0

  const inviteResultCard = inviteResult?.invite?.link ? (
    <Card variant="outlined" sx={{ mt: 1, mb: 1 }}>
      <CardContent>
        <Typography level="title-sm">קישור טופס שנוצר</Typography>

        <Typography level="body-sm">
          {inviteResult?.invite?.link}
        </Typography>

        <Typography level="body-sm" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
          {inviteResult?.whatsappText}
        </Typography>
      </CardContent>
    </Card>
  ) : null

  const emptyText = isMobile
    ? 'אין תוצאות לתצוגה. נקה פילטרים או בטל הצגה של מלאים בלבד.'
    : 'אין תוצאות לתצוגה — נסה לבטל “הצג רק מלאים” או נקה את החיפוש.'

  const emptyState = filteredDomains.length === 0 ? (
    <Card variant="outlined" sx={{ mt: 1 }}>
      <CardContent>
        <Typography level="body-sm" sx={{ color: 'neutral.500' }}>
          {emptyText}
        </Typography>
      </CardContent>
    </Card>
  ) : null

  const toolbar = (
    <PlayerAbilitiesToolbar
      player={player}
      total={total}
      filled={filled}
      avgAll={avgAll}
      indicators={indicators}
      invitePending={invitePending}
      totalDomains={domains.length}
      shownCount={filteredDomains.length}
      formsCount={formsCount}
      evaluatorsCount={evaluatorsCount}
      hasActiveFilters={hasActiveFilters}
      filtersCount={indicators.length}
      isMobile={isMobile}
      showOnlyFilled={showOnlyFilled}
      selectedDomains={selectedDomains}
      onOpenInvite={handleOpenInvite}
      onOpenFilters={() => setFiltersOpen(true)}
      onClearIndicator={handleClearIndicator}
      onToggleShowOnlyFilled={setShowOnlyFilled}
      onChangeSelectedDomains={setSelectedDomains}
    />
  )

  const desktopBody = (
    <Box sx={desktopRootSx} className="dpScrollThin">
      <Box sx={stickyHeaderSx}>
        {toolbar}
        <Divider sx={{ mt: 1 }} />
      </Box>

      {inviteResultCard}

      <Grid container spacing={2} sx={{ p: 0.25 }}>
        {filteredDomains.map(domain => (
          <Grid key={domain?.domain} xs={12} sm={6} lg={3}>
            <AbilitiesDomainCard domain={domain} />
          </Grid>
        ))}
      </Grid>

      {emptyState}
    </Box>
  )

  const mobileBody = (
    <>
      <Box sx={rootSx}>
        {toolbar}
      </Box>

      {inviteResultCard}

      <Box sx={{ display: 'grid', gap: 0.9, minWidth: 0 }}>
        {filteredDomains.map((domain, index) => (
          <AbilitiesDomainCard
            key={domain?.domain}
            domain={domain}
            defaultExpanded={index === 0}
          />
        ))}
      </Box>

      {emptyState}

      <MobileFiltersDrawerShell
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="סינון יכולות"
        entity="player"
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
    </>
  )

  const body = (
    <>
      {isMobile ? mobileBody : desktopBody}

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
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        entity={player}
        context={context}
      />
    </>
  )

  if (!Section) return body

  const Wrap = Section

  return <Wrap>{body}</Wrap>
}
