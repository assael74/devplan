// teamProfile/mobile/modules/games/components/insightsDrawer/TeamGamesInsightsDrawer.js

import React, { useMemo } from 'react'
import {
  Drawer,
  Box,
  Sheet,
  DialogContent,
  DialogTitle,
  ModalClose,
  Typography,
  Avatar,
} from '@mui/joy'

import { resolveEntityAvatar } from '../../../../../../../../ui/core/avatars/fallbackAvatar.js'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

import { InsightRowsList } from './InsightsRows.js'
import { StatCard, SectionBlock } from './InsightsBlocks.js'
import { insightsDrawersSx as sx } from './sx/insightsDrawer.sx.js'

const c = getEntityColors('teams')

function safeArray(v) {
  return Array.isArray(v) ? v : []
}

function countByResult(rows = []) {
  return safeArray(rows).reduce(
    (acc, row) => {
      const key = String(row?.result || '').toLowerCase().trim()
      if (key === 'win') acc.wins += 1
      else if (key === 'draw') acc.draws += 1
      else if (key === 'loss') acc.losses += 1
      return acc
    },
    { wins: 0, draws: 0, losses: 0 }
  )
}

function calcPoints({ wins = 0, draws = 0 }) {
  return wins * 3 + draws
}

function getGamePlayers(game) {
  return Array.isArray(game?.gamePlayers) ? game.gamePlayers : []
}

function getGoalsTotal(rows = []) {
  return safeArray(rows).reduce((sum, game) => {
    return (
      sum +
      getGamePlayers(game).reduce((inner, player) => inner + Number(player?.goals || 0), 0)
    )
  }, 0)
}

function getAssistsTotal(rows = []) {
  return safeArray(rows).reduce((sum, game) => {
    return (
      sum +
      getGamePlayers(game).reduce((inner, player) => inner + Number(player?.assists || 0), 0)
    )
  }, 0)
}

function buildTopStats(rows = []) {
  const totalGames = rows.length
  const playedGames = rows.filter((row) => !!row?.result).length
  const upcomingGames = totalGames - playedGames
  const resultStats = countByResult(rows)
  const points = calcPoints(resultStats)

  return [
    {
      id: 'games',
      title: 'משחקים',
      value: totalGames,
      sub: `${playedGames} שוחקו`,
      icon: 'game',
    },
    {
      id: 'points',
      title: 'נקודות',
      value: points,
      sub: `${resultStats.wins} ניצחונות · ${resultStats.draws} תיקו`,
      icon: 'result',
    },
    {
      id: 'goals',
      title: 'שערים',
      value: getGoalsTotal(rows),
      sub: 'סך שערי הקבוצה',
      icon: 'goals',
    },
    {
      id: 'assists',
      title: 'בישולים',
      value: getAssistsTotal(rows),
      sub: 'סך בישולי הקבוצה',
      icon: 'assists',
    },
    {
      id: 'future',
      title: 'עתידיים',
      value: upcomingGames,
      sub: 'טרם שוחקו',
      icon: 'calendar',
    },
    {
      id: 'losses',
      title: 'הפסדים',
      value: resultStats.losses,
      sub: 'במשחקים שהסתיימו',
      icon: 'danger',
    },
  ]
}

function buildCards(rows = []) {
  const played = rows.filter((row) => !!row?.result)
  const resultStats = countByResult(played)
  const totalPlayed = played.length || 1

  const winPct = Math.round((resultStats.wins / totalPlayed) * 100)
  const drawPct = Math.round((resultStats.draws / totalPlayed) * 100)
  const lossPct = Math.round((resultStats.losses / totalPlayed) * 100)

  return [
    {
      id: 'wins',
      title: 'אחוז ניצחונות',
      value: `${winPct}%`,
      subValue: `${resultStats.wins} מתוך ${played.length}`,
      icon: 'success',
      color: 'success',
    },
    {
      id: 'draws',
      title: 'אחוז תיקו',
      value: `${drawPct}%`,
      subValue: `${resultStats.draws} מתוך ${played.length}`,
      icon: 'result',
      color: 'warning',
    },
    {
      id: 'losses',
      title: 'אחוז הפסדים',
      value: `${lossPct}%`,
      subValue: `${resultStats.losses} מתוך ${played.length}`,
      icon: 'danger',
      color: 'danger',
    },
  ]
}

function buildHomeAwayItems(rows = []) {
  const home = rows.filter((row) => row?.homeKey === 'home')
  const away = rows.filter((row) => row?.homeKey === 'away')

  return [
    {
      id: 'home',
      title: 'משחקי בית',
      value: home.length,
      subValue: 'סך משחקי בית',
      icon: 'home',
      color: 'success',
    },
    {
      id: 'away',
      title: 'משחקי חוץ',
      value: away.length,
      subValue: 'סך משחקי חוץ',
      icon: 'away',
      color: 'danger',
    },
  ]
}

function buildDifficultyItems(rows = []) {
  const counts = safeArray(rows).reduce((acc, row) => {
    const key = row?.difficultyH || row?.difficulty || 'לא הוגדר'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  return Object.entries(counts).map(([label, value], index) => ({
    id: `difficulty-${index}`,
    title: 'רמת קושי',
    value,
    subValue: label,
    icon: 'difficulty',
    color: 'warning',
  }))
}

function buildFeedItems(rows = []) {
  const played = rows.filter((row) => !!row?.result)
  const home = rows.filter((row) => row?.homeKey === 'home')
  const away = rows.filter((row) => row?.homeKey === 'away')
  const withVideo = rows.filter((row) => !!row?.hasVideo)

  return [
    {
      id: 'played',
      title: 'משחקים שהסתיימו',
      value: played.length,
      subValue: 'כולל תוצאה סופית',
      icon: 'done',
      color: 'success',
    },
    {
      id: 'video',
      title: 'משחקים עם וידאו',
      value: withVideo.length,
      subValue: 'כולל קישור וידאו',
      icon: 'video',
      color: 'primary',
    },
    {
      id: 'split',
      title: 'התפלגות בית / חוץ',
      value: `${home.length} / ${away.length}`,
      subValue: 'בית מול חוץ',
      icon: 'home',
      color: 'neutral',
    },
  ]
}

function TeamDrawerHeader({ entity }) {
  const avatar = resolveEntityAvatar({
    entityType: 'team',
    entity,
    parentEntity: entity?.club,
    subline: entity?.club?.clubName || '',
  })

  const clubName = entity?.club?.clubName || 'מועדון'
  const teamName = entity?.teamName || 'קבוצה'
  const teamYear = entity?.teamYear ? `שנתון ${entity.teamYear}` : ''
  const league = entity?.league || ''

  return (
    <DialogTitle sx={sx.dialTit}>
      <Box sx={sx.box}>
        <Avatar src={avatar} sx={{ width: 40, height: 40, flexShrink: 0 }} />

        <Box sx={sx.boxWrap}>
          <Typography level="title-md" sx={sx.typoTit}>
            {clubName} · {teamName}
          </Typography>

          <Typography level="body-sm" sx={{ opacity: 0.7, fontSize: 12, lineHeight: 1.2 }}>
            {[teamYear, league].filter(Boolean).join(' · ')}
          </Typography>

          <Typography
            level="body-sm"
            sx={{ opacity: 0.8, fontSize: 12, lineHeight: 1.2 }}
            startDecorator={iconUi({ id: 'insights' })}
          >
            תובנות משחקי הקבוצה
          </Typography>
        </Box>
      </Box>

      <ModalClose sx={{ mr: 0.5, mt: 0.5 }} />
    </DialogTitle>
  )
}

export default function TeamGamesInsightsDrawer({
  open,
  onClose,
  games,
  team,
  entity,
}) {
  const liveTeam = team || entity || {}
  const rows = useMemo(() => safeArray(games), [games])

  const topStats = useMemo(() => buildTopStats(rows), [rows])
  const cards = useMemo(() => buildCards(rows), [rows])
  const homeAwayItems = useMemo(() => buildHomeAwayItems(rows), [rows])
  const difficultyItems = useMemo(() => buildDifficultyItems(rows), [rows])
  const feedItems = useMemo(() => buildFeedItems(rows), [rows])

  return (
    <Drawer
      size="lg"
      variant="plain"
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ content: { sx: sx.drawerSx } }}
    >
      <Sheet sx={sx.drawerSheet}>
        <TeamDrawerHeader entity={liveTeam} />

        <DialogContent sx={{ gap: 2 }}>
          <Box sx={sx.content} className="dpScrollThin">
            <SectionBlock title="מדדי על" icon="topParm">
              <Box sx={sx.boxGrid}>
                {topStats.map((item) => (
                  <StatCard
                    key={item.id}
                    title={item.title}
                    value={item.value}
                    sub={item.sub}
                    icon={item.icon}
                  />
                ))}
              </Box>
            </SectionBlock>

            <SectionBlock title="איכות הביצוע" icon="performance">
              <InsightRowsList items={cards} emptyText="אין כרטיסי תובנות להצגה" />
            </SectionBlock>

            <SectionBlock title="משחקי בית / חוץ" icon="home">
              <InsightRowsList items={homeAwayItems} emptyText="אין נתוני בית / חוץ להצגה" />
            </SectionBlock>

            <SectionBlock title="רמת קושי" icon="difficulty">
              <InsightRowsList items={difficultyItems} emptyText="אין נתוני רמת קושי להצגה" />
            </SectionBlock>

            <SectionBlock title="פיד תובנות" icon="feed">
              <InsightRowsList items={feedItems} emptyText="אין תובנות להצגה" />
            </SectionBlock>
          </Box>
        </DialogContent>
      </Sheet>
    </Drawer>
  )
}
