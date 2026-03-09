// src/features/players/components/preview/PreviewDomainCard/domains/meetings/MeetingsDomainSummary.js
import React, { useMemo } from 'react'
import { Box } from '@mui/joy'
import { buildMeetingsCardKpis } from './logic/meetings.domain.logic'
import { sx } from './meetingsDomainModal.sx.js'
import { useCoreData } from '../../../../../../../coreData/CoreDataProvider.js'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { Chip, Typography } from '@mui/joy'
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

export default function MeetingsDomainSummary({ entity }) {
  const { meetingsByPlayerId } = useCoreData()

  const meetings = useMemo(() => {
    const pid = entity?.id
    if (!pid) return []
    return meetingsByPlayerId?.get(pid) || []
  }, [meetingsByPlayerId, entity?.id])

  const { lastLabel, nextLabel, lastIcon, nextIcon, hasNext, count } = useMemo(
    () => buildMeetingsCardKpis(meetings),
    [meetings]
  )

  const statusColor = count === 0 ? 'neutral' : hasNext ? 'primary' : 'success'

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.6, width: '100%' }}>
      <Row label="אחרון" value={lastLabel} color="neutral" icon={lastIcon} />
      <Row label="הבא" value={nextLabel} color={statusColor} icon={nextIcon} />
    </Box>
  )
}
