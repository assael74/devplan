// preview/previewDomainCard/domains/team/staff/TeamStaffDomainSummary.js
import React, { useMemo } from 'react'
import { Box, Chip, Typography } from '@mui/joy'
import { resolveStaffDomain } from './clubStaff.domain.logic'
import { domainBoxSx } from '../../domain.sx'

const Row = ({ label, value, color }) => {
  const has = value != null && String(value) !== ''
  return (
    <Box {...domainBoxSx}>
      <Typography level="body-xs" sx={{ fontSize: '0.5rem', fontWeight: 700, opacity: 0.9 }}>
        {label}
      </Typography>
      <Chip size="sm" variant="soft" color={has ? color : 'neutral'}>
        {has ? value : '—'}
      </Chip>
    </Box>
  )
}

export default function ClubStaffDomainSummary({ entity }) {
  const { summary } = useMemo(() => resolveStaffDomain(entity), [entity])

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.6, width: '100%'}}>
      <Row label="אנשי צוות:" value={`${summary?.total ?? 0}`} color="primary" />
      <Row label="פעילים:" value={`${summary?.active ?? 0}`} color="success" />
    </Box>
  )
}
