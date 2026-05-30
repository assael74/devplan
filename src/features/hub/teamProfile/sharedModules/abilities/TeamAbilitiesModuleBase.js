// teamProfile/sharedModules/abilities/TeamAbilitiesModuleBase.js

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

import useTeamAbilitiesModuleModel from './useTeamAbilitiesModuleModel.js'

export default function TeamAbilitiesModuleBase({
  entity,
  context,
  abilitiesInsightsRequest = 0,

  isMobile = false,
  Section,
  rootSx,
  toolbarWrapSx,
  stickySx,

  TeamAbilitiesToolbar,
  AbilitiesFiltersContent,
  AbilitiesDomainCard,
  TeamAbilitiesInsightsDrawer,
}) {
  const model = useTeamAbilitiesModuleModel({
    entity,
    context,
    abilitiesInsightsRequest,
  })

  const {
    team,
    domains,
    summary,

    total,
    filled,
    avgAll,

    filteredDomains,
    indicators,
    hasActiveFilters,

    insightsOpen,
    filtersOpen,

    selectedDomains,
    showOnlyFilled,

    setInsightsOpen,
    setFiltersOpen,
    setSelectedDomains,
    setShowOnlyFilled,

    handleClearIndicator,
    handleResetFilters,
  } = model

  const emptyText = isMobile
    ? 'אין תוצאות לתצוגה. נקה פילטרים או בטל הצגה של מלאים בלבד.'
    : 'אין תוצאות לתצוגה — נסה לנקות את הסינון של הדומיינים.'

  const toolbar = (
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
      selectedDomains={selectedDomains}
      hasActiveFilters={hasActiveFilters}
      onOpenFilters={() => setFiltersOpen(true)}
      onClearIndicator={handleClearIndicator}
      onChangeSelectedDomains={setSelectedDomains}
    />
  )

  const emptyState = filteredDomains.length === 0 ? (
    <Card variant="outlined" sx={{ mt: 1 }}>
      <CardContent>
        <Typography level="body-sm" sx={{ color: 'neutral.500' }}>
          {emptyText}
        </Typography>
      </CardContent>
    </Card>
  ) : null

  const content = isMobile ? (
    <>
      <Box sx={rootSx}>
        {toolbar}
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

      {emptyState}

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
    </>
  ) : (
    <Box sx={toolbarWrapSx} className="dpScrollThin">
      <Box sx={stickySx}>
        {toolbar}
        <Divider sx={{ mt: 1 }} />
      </Box>

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

  const body = (
    <>
      {content}

      <TeamAbilitiesInsightsDrawer
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        entity={team}
        summary={summary}
        context={context}
      />
    </>
  )

  if (!Section) return body

  const Wrap = Section

  return <Wrap>{body}</Wrap>
}
