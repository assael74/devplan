import { Box, Typography } from '@mui/joy'

import futurePathUp from '../../../../../../ui/core/images/clubSignals/signal_futurePath_up.png'
import futurePathDown from '../../../../../../ui/core/images/clubSignals/signal_futurePath_down.png'
import leagueVsClubAbove from '../../../../../../ui/core/images/clubSignals/signal_leagueVsClub_above.png'
import leagueVsClubBelow from '../../../../../../ui/core/images/clubSignals/signal_leagueVsClub_below.png'
import squadTaskOffense from '../../../../../../ui/core/images/clubSignals/signal_squadTask_offense.png'
import squadTaskDefense from '../../../../../../ui/core/images/clubSignals/signal_squadTask_defense.png'

import { clubsPageSx as sx } from '../sx/clubsPage.sx.js'

const SIGNAL_ICON_BY_TYPE = Object.freeze({
  FUTURE_LEAGUE_PATH_RISE: futurePathUp,
  FUTURE_LEAGUE_PATH_DROP: futurePathDown,
  LEAGUE_ABOVE_CLUB_LEVEL: leagueVsClubAbove,
  LEAGUE_BELOW_CLUB_LEVEL: leagueVsClubBelow,
  OFFENSE_SQUAD_TASK: squadTaskOffense,
  DEFENSE_SQUAD_TASK: squadTaskDefense,
})

const SIGNAL_DIRECTION_WORD_BY_TYPE = Object.freeze({
  FUTURE_LEAGUE_PATH_RISE: 'עלייה',
  FUTURE_LEAGUE_PATH_DROP: 'ירידה',
  LEAGUE_ABOVE_CLUB_LEVEL: 'מעל',
  LEAGUE_BELOW_CLUB_LEVEL: 'מתחת',
})

const SIGNAL_DIRECTION_SX_BY_TYPE = Object.freeze({
  FUTURE_LEAGUE_PATH_RISE: sx.summarySpotlightDirectionRise,
  FUTURE_LEAGUE_PATH_DROP: sx.summarySpotlightDirectionDrop,
  LEAGUE_ABOVE_CLUB_LEVEL: sx.summarySpotlightDirectionRise,
  LEAGUE_BELOW_CLUB_LEVEL: sx.summarySpotlightDirectionBelow,
})

export function ClubSignalIcon({ model, variant = 'summary' }) {
  const signalIcon = SIGNAL_ICON_BY_TYPE[model?.type] || null

  if (!signalIcon) return null

  return (
    <Box
      component='img'
      src={signalIcon}
      alt=''
      aria-hidden='true'
      sx={variant === 'card' ? sx.ageGroupSignalIcon : sx.summarySpotlightSignalIcon}
    />
  )
}

export function ClubSignalTitle({ model, variant = 'summary' }) {
  const directionWord = SIGNAL_DIRECTION_WORD_BY_TYPE[model?.type]
  const [beforeDirection = '', afterDirection = ''] = directionWord
    ? String(model?.title || '').split(directionWord)
    : [model?.title || '']

  return (
    <Typography
      level='title-sm'
      sx={variant === 'card' ? sx.ageGroupSignalTitle : sx.summarySpotlightTitle}
    >
      {beforeDirection}
      {directionWord ? (
        <Box
          component='span'
          sx={[
            sx.summarySpotlightDirectionWord,
            SIGNAL_DIRECTION_SX_BY_TYPE[model.type],
          ]}
        >
          {directionWord}
        </Box>
      ) : null}
      {afterDirection}
    </Typography>
  )
}

export default function ClubSignalDisplay({ model, variant = 'summary' }) {
  const isCard = variant === 'card'

  return (
    <Box sx={isCard ? sx.ageGroupSignalContent : sx.summarySpotlightSignalLine}>
      <ClubSignalIcon model={model} variant={variant} />
      <ClubSignalTitle model={model} variant={variant} />
    </Box>
  )
}
