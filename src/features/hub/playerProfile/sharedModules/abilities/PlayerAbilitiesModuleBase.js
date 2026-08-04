// playerProfile/sharedModules/abilities/PlayerAbilitiesModuleBase.js

import React from 'react'
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
} from '@mui/joy'

import { MobileFiltersDrawerShell } from '../../../../../ui/patterns/filters/index.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

import usePlayerAbilitiesModuleModel from './usePlayerAbilitiesModuleModel.js'

const TEXT = {
  inviteCreated: '\u05e7\u05d9\u05e9\u05d5\u05e8 \u05d8\u05d5\u05e4\u05e1 \u05e9\u05e0\u05d5\u05e6\u05e8',
  emptyMobile: '\u05d0\u05d9\u05df \u05ea\u05d5\u05e6\u05d0\u05d5\u05ea \u05dc\u05ea\u05e6\u05d5\u05d2\u05d4. \u05e0\u05e7\u05d4 \u05e4\u05d9\u05dc\u05d8\u05e8\u05d9\u05dd \u05d0\u05d5 \u05d1\u05d8\u05dc \u05d4\u05e6\u05d2\u05d4 \u05e9\u05dc \u05de\u05dc\u05d0\u05d9\u05dd \u05d1\u05dc\u05d1\u05d3.',
  emptyDesktop: '\u05d0\u05d9\u05df \u05ea\u05d5\u05e6\u05d0\u05d5\u05ea \u05dc\u05ea\u05e6\u05d5\u05d2\u05d4 - \u05e0\u05e1\u05d4 \u05dc\u05d1\u05d8\u05dc \u05d4\u05e6\u05d2 \u05e8\u05e7 \u05de\u05dc\u05d0\u05d9\u05dd \u05d0\u05d5 \u05e0\u05e7\u05d4 \u05d0\u05ea \u05d4\u05d7\u05d9\u05e4\u05d5\u05e9.',
  noEvaluationTitle: '\u05d8\u05e8\u05dd \u05d1\u05d5\u05e6\u05e2\u05d4 \u05d4\u05e2\u05e8\u05db\u05ea \u05d9\u05db\u05d5\u05dc\u05d5\u05ea',
  noEvaluationBody: '\u05db\u05d3\u05d9 \u05dc\u05d4\u05ea\u05d7\u05d9\u05dc \u05de\u05e2\u05e7\u05d1 \u05de\u05e7\u05e6\u05d5\u05e2\u05d9, \u05e9\u05dc\u05d7 \u05d8\u05d5\u05e4\u05e1 \u05d4\u05e2\u05e8\u05db\u05d4 \u05d0\u05d5 \u05d4\u05d6\u05df \u05e0\u05ea\u05d5\u05e0\u05d9\u05dd \u05e8\u05d0\u05e9\u05d5\u05e0\u05d9\u05dd.',
  addEvaluation: '\u05d4\u05d5\u05e1\u05e4\u05ea \u05d4\u05e2\u05e8\u05db\u05d4',
  filtersTitle: '\u05e1\u05d9\u05e0\u05d5\u05df \u05d9\u05db\u05d5\u05dc\u05d5\u05ea',
  filtersSubtitle: '\u05d4\u05ea\u05d0\u05dd \u05d0\u05ea \u05d4\u05ea\u05e6\u05d5\u05d2\u05d4 \u05dc\u05de\u05e1\u05da \u05d4\u05de\u05d5\u05d1\u05d9\u05d9\u05dc',
  domainsShown: '\u05d3\u05d5\u05de\u05d9\u05d9\u05e0\u05d9\u05dd \u05de\u05d5\u05e6\u05d2\u05d9\u05dd',
}

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
        <Typography level="title-sm">{TEXT.inviteCreated}</Typography>

        <Typography level="body-sm">
          {inviteResult?.invite?.link}
        </Typography>

        <Typography level="body-sm" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
          {inviteResult?.whatsappText}
        </Typography>
      </CardContent>
    </Card>
  ) : null

  const emptyIntro = filled === 0 && !hasActiveFilters ? (
    <Card variant="outlined" sx={{ mt: 1, mb: 1, bgcolor: 'background.surface', borderColor: 'divider' }}>
      <CardContent sx={{ display: 'flex', alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', gap: 1.25, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography level="title-sm" sx={{ fontWeight: 700 }}>{TEXT.noEvaluationTitle}</Typography>
          <Typography level="body-sm" sx={{ color: 'text.tertiary', mt: 0.25 }}>{TEXT.noEvaluationBody}</Typography>
        </Box>

        <Button size="sm" variant="solid" disabled={invitePending} onClick={handleOpenInvite} startDecorator={iconUi({ id: 'abilities' })} sx={{ flex: '0 0 auto' }}>
          {TEXT.addEvaluation}
        </Button>
      </CardContent>
    </Card>
  ) : null

  const emptyText = isMobile ? TEXT.emptyMobile : TEXT.emptyDesktop

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
      {emptyIntro}

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
      {emptyIntro}

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
        title={TEXT.filtersTitle}
        entity="player"
        subtitle={TEXT.filtersSubtitle}
        resultsText={`${filteredDomains.length} ${TEXT.domainsShown}`}
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
