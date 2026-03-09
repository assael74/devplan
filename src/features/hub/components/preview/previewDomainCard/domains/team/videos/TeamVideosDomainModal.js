// domains/team/games/TeamVideosDomainModal.js

import React, { useMemo, useState } from 'react'
import { Box } from '@mui/joy'

import { resolveTeamVideosDomain } from './logic/teamVideos.domain.logic.js'
import TeamVideosKpi from './components/TeamVideosKpi.js'
import TeamVideosFilters from './components/TeamVideosFilters.js'
import TeamVideosTable from './components/TeamVideosTable.js'

export default function TeamVideosDomainModal({
  entity,
  context,
  videoActions,
  onClose,
}) {
  const team = entity || null

  const [q, setQ] = useState('')
  const [month, setMonth] = useState('all')
  const [onlyTagged, setOnlyTagged] = useState(false)
  const [onlyKey, setOnlyKey] = useState(false)

  const tags = useMemo(() => {
    const t1 = context?.tags
    const t2 = context?.tagsArr
    return Array.isArray(t1) ? t1 : Array.isArray(t2) ? t2 : []
  }, [context?.tags, context?.tagsArr])

  const resolved = useMemo(
    () =>
      resolveTeamVideosDomain(
        team,
        {
          q,
          month: month === 'all' ? '' : month,
          onlyTagged,
          onlyKey,
        },
        { tags }
      ),
    [team, q, month, onlyTagged, onlyKey, tags]
  )

  const { summary, options, videos } = resolved

  const actions = useMemo(() => {
    const v = videoActions || {}

    return {
      onWatch: typeof v.watch === 'function' ? v.watch : null,
      onEdit: typeof v.edit === 'function' ? v.edit : null,
      onLink: typeof v.link === 'function' ? v.link : null,
      onShare: typeof v.share === 'function' ? v.share : null,
    }
  }, [videoActions])

  const handoff = (fn, payload) => {
    if (!fn) return
    onClose?.()
    queueMicrotask(() => fn(payload))
  }

  const handleWatch = (row) => handoff(actions.onWatch, { video: row?.video || row, entity: team, context })
  const handleEdit = (row) => handoff(actions.onEdit, { video: row?.video || row, entity: team, context })
  const handleLink = (row) => handoff(actions.onLink, { video: row?.video || row, entity: team, context })
  const handleShare = (row) => handoff(actions.onShare, { video: row?.video || row, entity: team, context })

  const handleReset = () => {
    setQ('')
    setMonth('all')
    setOnlyTagged(false)
    setOnlyKey(false)
  }

  return (
    <Box sx={{ minWidth: 0, display: 'grid', gap: 1 }}>
      <Box
        sx={{
          position: 'sticky',
          top: -15,
          zIndex: 5,
          borderRadius: 'xl',
          bgcolor: 'background.body',
        }}
      >
        <TeamVideosKpi
          entity={team}
          summary={summary}
          filteredCount={videos.length}
        />

        <TeamVideosFilters
          q={q}
          month={month}
          monthOptions={options?.months || []}
          onlyTagged={onlyTagged}
          onlyKey={onlyKey}
          onChangeQ={setQ}
          onChangeMonth={setMonth}
          onChangeOnlyTagged={setOnlyTagged}
          onChangeOnlyKey={setOnlyKey}
          onReset={handleReset}
        />
      </Box>

      <TeamVideosTable
        rows={videos}
        onWatch={handleWatch}
        onEdit={handleEdit}
        onLink={handleLink}
        onShare={handleShare}
      />
    </Box>
  )
}
