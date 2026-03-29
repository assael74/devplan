// playerProfile/modules/abilities/PlayerAbilitiesModule.js

import React, { useMemo, useState } from 'react'
import { Box, Grid, Typography, Divider, Card, CardContent } from '@mui/joy'

import { resolveAbilitiesDomain } from '../../../../../shared/abilities/abilities.domain.logic.js'

import AbilityHeader from './AbilityHeader'
import AbilityDomainCard from './AbilityDomainCard'
import AbilitiesInviteCreateDrawer from './components/AbilitiesInviteCreateDrawer'
import { isFilled } from './abilities.logic.js'
import useAbilitiesSummary from './useAbilitiesSummary.js'
import { abilitiesModuleSx, stickyHeaderWrapSx } from './Ability.module.sx'

export default function PlayerAbilitiesModule({ entity, context }) {
  const [inviteDrawerOpen, setInviteDrawerOpen] = useState(false)
  const [showOnlyFilled, setShowOnlyFilled] = useState(false)
  const [query, setQuery] = useState('')
  const [invitePending, setInvitePending] = useState(false)
  const [inviteResult, setInviteResult] = useState(null)

  const player = entity || null
  const domainResult = useMemo(() => resolveAbilitiesDomain(player || {}), [player])
  const domains = domainResult?.domains || []

  const { total, filled, avgAll } = useAbilitiesSummary(domains)

  const q = query.trim().toLowerCase()

  const filteredDomains = useMemo(() => {
    return domains
      .map((domain) => {
        const items = (domain?.items || []).filter((item) => {
          const passFilled = showOnlyFilled ? isFilled(item?.value) : true
          const passQuery = q
            ? (
                String(item?.label || '').toLowerCase().includes(q) ||
                String(item?.id || '').toLowerCase().includes(q)
              )
            : true

          return passFilled && passQuery
        })

        return {
          ...domain,
          items,
        }
      })
      .filter((domain) => domain?.items?.length > 0)
  }, [domains, showOnlyFilled, q])

  function handleOpenInvite() {
    setInviteDrawerOpen(true)
  }

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
          onOpenInvite={handleOpenInvite}
          invitePending={invitePending}
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
    </Box>
  )
}
