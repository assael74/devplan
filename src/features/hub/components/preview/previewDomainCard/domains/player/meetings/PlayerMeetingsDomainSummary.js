import React, { useMemo } from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { resolvePlayerMeetingsDomain } from './logic/playerMeetings.domain.logic.js'
import { domainBoxSx } from '../../domain.sx'

const Row = ({ label, value, color }) => {
  const has = value != null && String(value) !== ''

  return (
    <Box {...domainBoxSx}>
      <Typography level="body-xs" sx={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.9 }}>
        {label}
      </Typography>

      <Chip size="sm" variant="soft" color={has ? color : 'neutral'}>
        {has ? value : '—'}
      </Chip>
    </Box>
  )
}

export default function PlayerMeetingsDomainSummary({ entity }) {
  const meetings = useMemo(() => {
    return Array.isArray(entity?.meetings) ? entity.meetings : []
  }, [entity])

  const { lastLabel, nextLabel, hasNext, count } = useMemo(
    () => resolvePlayerMeetingsDomain(meetings),
    [meetings]
  )

  const nextColor = count === 0 ? 'neutral' : hasNext ? 'primary' : 'success'

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.6, px: 0.5, width: '100%' }}>
      <Row label="אחרון" value={lastLabel} color="neutral" />
      <Row label="הבא" value={nextLabel} color={nextColor} />
    </Box>
  )
}
