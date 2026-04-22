// teamProfile/mobile/modules/games/components/gameCard/PlayerGameCardDetails.js

import React from 'react'
import { Box, Typography, Chip, Button, Divider, Avatar } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

import {
  getResultLabel,
  getResultColor,
  getHomeAwayLabel,
  getHomeAwayIcon,
  getHomeAwayColor,
  getGamePlayers,
  getSquadPlayers,
  getPlayedPlayers,
  getScorers,
  getAssisters,
} from '../../../../../sharedLogic'

import { cardSx as sx } from '../../sx/card.mobile.sx.js'

function MetaItem({ icon, value, color = 'neutral' }) {
  return (
    <Box sx={sx.metaItem}>
      <Typography
        level="body-sm"
        color={color}
        startDecorator={iconUi({ id: icon, size: 'sm' })}
      >
        {value || '—'}
      </Typography>
    </Box>
  )
}

function PlayersStatRow({ title, players = [], statKey = 'goals' }) {
  const list = Array.isArray(players) ? players : []

  if (!list.length) {
    return (
      <Box sx={{ display: 'grid', gap: 0.5 }}>
        <Typography level="body-sm" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>

        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
          לא נרשמו
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'grid', gap: 0.6 }}>
      <Typography level="body-sm" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {list.slice(0, 6).map((player) => {
          const value =
            statKey === 'goals'
              ? Number(player?.goals || 0)
              : Number(player?.assists || 0)

          return (
            <Chip
              key={player?.playerId || player?.id}
              size="sm"
              variant="soft"
              startDecorator={
                <Avatar src={player?.photo || ''} sx={{ width: 18, height: 18 }} />
              }
              endDecorator={
                <Typography level="body-xs" sx={{ fontWeight: 700 }}>
                  {value}
                </Typography>
              }
              sx={{ maxWidth: '100%' }}
            >
              <Typography level="body-xs" noWrap>
                {player?.playerFullName || 'ללא שם'}
              </Typography>
            </Chip>
          )
        })}

        {list.length > 6 ? (
          <Chip size="sm" variant="plain">
            +{list.length - 6}
          </Chip>
        ) : null}
      </Box>
    </Box>
  )
}

export default function TeamGameCardDetails({ game, onEditEntry }) {
  const players = getGamePlayers(game)
  const squad = getSquadPlayers(players)
  const played = getPlayedPlayers(players)
  const scorers = getScorers(players)
  const assisters = getAssisters(players)

  return (
    <Box sx={{ display: 'grid', gap: 1 }}>
      <Box sx={sx.box}>
        <MetaItem icon="game" value={game?.typeH || '—'} color="primary" />

        <MetaItem
          icon="difficulty"
          value={game?.difficultyH || '—'}
          color="warning"
        />

        <MetaItem
          icon={game?.resultIcon || 'result'}
          value={getResultLabel(game)}
          color={getResultColor(game)}
        />

        <MetaItem
          icon={getHomeAwayIcon(game)}
          value={getHomeAwayLabel(game)}
          color={getHomeAwayColor(game)}
        />
      </Box>

      <Divider />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        <Chip
          size="sm"
          variant="soft"
          color="primary"
          startDecorator={iconUi({ id: 'entry', size: 'sm' })}
        >
          סגל {squad.length}
        </Chip>

        <Chip
          size="sm"
          variant="soft"
          color="success"
          startDecorator={iconUi({ id: 'done', size: 'sm' })}
        >
          שותפו {played.length}
        </Chip>

        <Chip
          size="sm"
          variant="soft"
          color="neutral"
          startDecorator={iconUi({ id: 'result', size: 'sm' })}
        >
          {game?.score || '—'}
        </Chip>
      </Box>

      <Divider />

      <PlayersStatRow title="כובשים" players={scorers} statKey="goals" />
      <PlayersStatRow title="מבשלים" players={assisters} statKey="assists" />

      <Divider />

      <Box sx={sx.buttWrap}>
        <Button
          size="sm"
          variant="soft"
          color="primary"
          startDecorator={iconUi({ id: 'entry' })}
          sx={{ border: '1px solid', borderColor: 'divider' }}
          onClick={() => onEditEntry?.(game)}
        >
          עריכת רישום
        </Button>

        {game?.vLink ? (
          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            startDecorator={iconUi({ id: 'video' })}
            onClick={() => window.open(game.vLink, '_blank')}
          >
            פתיחת וידאו
          </Button>
        ) : null}
      </Box>
    </Box>
  )
}
