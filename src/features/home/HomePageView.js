import React, { useMemo } from 'react'
import { Box, Typography } from '@mui/joy'
import { useNavigate } from 'react-router-dom'
import StatusSnapshot from './components/StatusSnapshot'
import EntitySection from './components/EntitySection'
import QuickActions from './components/QuickActions'
import { HOME_SECTIONS } from './home.models'
import { HOME_ROUTES } from './home.routes'
import { buildHomeSnapshot, buildEntityItems } from './home.selectors'
import { buildHomeTopCards, buildScoutingPreview } from './adapters'
import { iconUi } from '../../ui/core/icons/iconUi.js'

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 700px)')
    const apply = () => setIsMobile(!!mq.matches)
    apply()
    mq.addEventListener?.('change', apply)
    return () => mq.removeEventListener?.('change', apply)
  }, [])
  return isMobile
}

export default function HomePageView({ data, onAddPlayer, onAddVideo, onAddNote }) {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  //console.log(data)
  // Snapshot מגיע עם iconId → ממירים ל-react node כדי לא לשבור StatusSnapshot
  const snapshot = useMemo(() => {
    const raw = buildHomeTopCards(data)

    const iconIdByKey = {
      clubs: 'teams',
      teams: 'teams',
      players: 'players',
      projectPlayers: 'project',
      scouting: 'scouting',
    }

    return raw.map((it) => {
      const iconId = iconIdByKey[it.key]
      const node = iconId ? iconUi({ id: iconId, size: 'md' }) : null
      return { ...it, icon: node || it.icon }
    })
  }, [data])

  const entityItems = useMemo(() => {
    return {
      players: buildEntityItems('players', data, 5),
      scouting: buildScoutingPreview({ scouting: data.scouting }, 5),
      teams: buildEntityItems('teams', data, 5),
      videos: buildEntityItems('videos', data, 5),
      notes: buildEntityItems('notes', data, 5),
    }
  }, [data])

  const todayLabel = useMemo(() => {
    const d = new Date()
    return d.toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' })
  }, [])

  const openAllRoute = (entityKey) => {
    if (entityKey === 'players') return HOME_ROUTES.PLAYERS
    if (entityKey === 'videos') return HOME_ROUTES.VIDEOS
    if (entityKey === 'teams') return HOME_ROUTES.TEAMS
    if (entityKey === 'notes') return HOME_ROUTES.NOTES
    return '/'
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
        <Typography level="h2">תמונת מצב</Typography>
        <Typography level="body-sm" sx={{ opacity: 0.75 }}>
          {todayLabel}
        </Typography>
      </Box>

      {/* Status Snapshot */}
      <StatusSnapshot items={snapshot} isMobile={isMobile} />

      {/* Entity lanes */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: 1.2,
        }}
      >
        {HOME_SECTIONS.map((s) => (
          <EntitySection
            key={s.key}
            title={s.title}
            icon={iconUi({ id: s.iconId, size: 'md' })}
            items={entityItems[s.key] || []}
            emptyText="אין עדיין נתונים להצגה"
            onOpenAll={() => navigate(openAllRoute(s.key))}
          />
        ))}
      </Box>

      {/* Quiet actions */}
      <QuickActions onAddPlayer={onAddPlayer} onAddVideo={onAddVideo} onAddNote={onAddNote} />
    </Box>
  )
}
