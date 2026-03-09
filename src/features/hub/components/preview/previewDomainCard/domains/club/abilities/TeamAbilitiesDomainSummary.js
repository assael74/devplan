// src/features/players/components/preview/PreviewDomainCard/domains/team/abilities/TeamAbilitiesDomainSummary.js

import React, { useMemo } from 'react'
import { Box, Chip, Typography } from '@mui/joy'
import { resolveTeamAbilitiesDomain } from './abilities.team.domain.logic'
import { domainBoxSx } from './domainModal.sx'

function hasDomains(summary) {
  return Boolean(summary && (summary.strongest || summary.weakest))
}

const Stat = ({ label, value, value2, color = 'neutral' }) => {
  const has = value != null && String(value) !== ''
  return (
    <Box {...domainBoxSx}>
      <Typography level="body-xs" sx={{ fontWeight: 700, opacity: 0.9 }}>
        {label}
      </Typography>
      <Chip size="sm" variant="soft" color={has ? color : 'neutral'}>
        {has ? value : '—'}
      </Chip>
    </Box>
  )
}

export default function TeamAbilitiesDomainSummary({ entity, scope = 'global', scopeKey = null }) {
  const model = useMemo(() => resolveTeamAbilitiesDomain({ entity, scope, key: scopeKey }), [entity, scope, scopeKey])
  //console.log(model)
  const summary = model?.summary || {}
  const cov = model?.coverageSummary || { count: 0, total: 0, pct: 0 }
  const showDomains = hasDomains(summary)

  if (!showDomains) {
    return (
      <Box sx={{ mt: 2, mx: 1 }}>
        <Chip size="sm" variant="soft">
          {`אין מספיק נתונים לחישוב ממוצעים. כיסוי: ${cov.count}/${cov.total} (${cov.pct}%)`}
        </Chip>
      </Box>
    )
  }

  return (
    <Box sx={{ mt: 3, ml: 1 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0.6 }}>
        <Stat
          label="חוזקה:"
          value={summary?.strongest ? `${summary.strongest.domainLabel} (${summary.strongest.avg})` : '—'}
          color="success"
        />
        <Stat
          label="חולשה:"
          value={summary?.weakest ? `${summary.weakest.domainLabel} (${summary.weakest.avg})` : '—'}
          color="danger"
        />
      </Box>
    </Box>
  )
}
