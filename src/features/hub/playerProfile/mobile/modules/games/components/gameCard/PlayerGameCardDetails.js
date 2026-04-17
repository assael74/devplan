// playerProfile/mobile/modules/games/components/gameCard/PlayerGameCardDetails.js

import React from 'react'
import { Box, Typography, Chip, Button, Divider } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

import {
  getResultIcon,
  getResultLabel,
  getResultColor,
  getHomeAwayLabel,
  getHomeAwayIcon,
  getHomeAwayColor,
} from '../../../../../sharedLogic'

import { cardSx as sx } from '../../sx/card.mobile.sx.js'

function MetaItem({ icon, label, value, color = 'neutral' }) {
  return (
    <Box sx={sx.metaItem}>
      <Typography level="body-sm" color={color} startDecorator={iconUi({ id: icon, size: 'sm' })}>
        {value || '—'}
      </Typography>
    </Box>
  )
}

export default function PlayerGameCardDetails({ game, onEditEntry }) {
  return (
    <Box sx={{ display: 'grid', gap: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap', gap: 0.75 }}>
        <MetaItem icon="game" label="סוג משחק" value={game?.typeH || '—'} color="primary" />

        <MetaItem
          icon="difficulty"
          label="רמת קושי"
          value={game?.difficultyH || '—'}
          color="warning"
        />

        <MetaItem
          icon={getResultIcon(game)}
          label="תוצאה"
          value={getResultLabel(game)}
          color={getResultColor(game)}
        />

        <MetaItem
          icon={getHomeAwayIcon(game)}
          label="בית / חוץ"
          value={getHomeAwayLabel(game)}
          color={getHomeAwayColor(game)}
        />

        <Box sx={{ flex: 1 }} />

        {game?.hasVideo ? (
          <Chip
            size="sm"
            variant="soft"
            color="success"
            startDecorator={iconUi({id: 'video', size: 'sm'})}
            onClick={() => {
              if (game?.vLink) window.open(game.vLink, '_blank')
            }}
            sx={{ cursor: 'pointer' }}
          >
            וידאו
          </Chip>
        ) : (
          <Chip
            size="sm"
            variant="soft"
            color="danger"
            startDecorator={iconUi({id: 'noVideo', size: 'sm'})}
            onClick={() => {
              if (game?.vLink) window.open(game.vLink, '_blank')
            }}
            sx={{ cursor: 'pointer' }}
          >
            אין וידאו
          </Chip>
        )}
      </Box>

      <Divider />

      <Box sx={{ display: 'flex', gap: 0.6, justifyContent: 'space-between' }}>
        <Button
          size="sm"
          variant="soft"
          color="primary"
          startDecorator={iconUi({ id: 'entry' })}
          sx={{ border: '1px solid', borderColor: 'divider' }}
          onClick={() => onEditEntry(game)}
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

        <Chip
          size="sm"
          variant="soft"
          color="neutral"
          sx={{ border: '1px solid', borderColor: 'divider' }}
          startDecorator={iconUi({ id: 'result' })}
        >
          {game?.score || '—'}
        </Chip>
      </Box>
    </Box>
  )
}
