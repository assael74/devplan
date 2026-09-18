import { Box, Chip, Typography } from '@mui/joy'

import ClubSignalDisplay from './ClubSignalDisplay.js'
import { clubsPageSx as sx } from '../sx/clubsPage.sx.js'

const metaValue = value => (
  value === null || value === undefined || value === '' ? null : value
)

const buildCardMeta = context => {
  const rank = metaValue(context?.tableRank)
  const gamesPlayed = metaValue(context?.gamesPlayed)
  const points = metaValue(context?.points)
  const goalsFor = metaValue(context?.goalsFor)
  const goalsAgainst = metaValue(context?.goalsAgainst)

  return [
    rank ? `מקום ${rank}` : null,
    gamesPlayed ? `${gamesPlayed} מש׳` : null,
    points !== null ? `${points} נק׳` : null,
    goalsFor !== null && goalsAgainst !== null ? `${goalsFor}–${goalsAgainst}` : null,
  ].filter(Boolean).join(' · ')
}

const AgeGroupSignalCard = ({ card, isFocus = false }) => {
  const meta = buildCardMeta(card.context)

  return (
    <Box sx={[
      sx.ageGroupSignalCard,
      isFocus && sx.ageGroupSignalFocusCard,
    ]}>
      <Box sx={sx.ageGroupSignalCardHeader}>
        <Box sx={sx.ageGroupSignalCardIdentity}>
          <Typography level='title-sm' sx={sx.ageGroupSignalCardTitle}>
            {card.ageGroupLabel}
          </Typography>
          <Chip
            size='sm'
            variant='soft'
            color='neutral'
            sx={sx.ageGroupSignalBirthYear}
          >
            {card.birthYear || '—'}
          </Chip>
        </Box>
        {meta ? (
          <Typography level='body-xs' sx={sx.ageGroupSignalMeta}>
            {meta}
          </Typography>
        ) : null}
      </Box>

      <Box sx={sx.ageGroupSignalSection}>
        <Typography level='body-xs' sx={sx.ageGroupSignalSectionLabel}>
          איתותים
        </Typography>
        {card.signal ? (
          <ClubSignalDisplay model={card.signal} variant='card' />
        ) : (
          <Typography level='body-sm' sx={sx.ageGroupSignalEmpty}>
            אין איתותים
          </Typography>
        )}
      </Box>

      {card.coverage ? (
        <Box sx={sx.ageGroupSignalCoverage}>
          <Typography level='body-xs' sx={sx.ageGroupSignalSectionLabel}>
            כיסוי
          </Typography>
          <Box sx={sx.ageGroupSignalCoverageMessage}>
            <Typography level='body-xs' sx={sx.ageGroupSignalCoverageTitle}>
              {card.coverage.title}
            </Typography>
            <Typography level='body-xs' sx={sx.ageGroupSignalCoverageDetail}>
              {card.coverage.detail}
            </Typography>
          </Box>
        </Box>
      ) : null}
    </Box>
  )
}

export default function ClubAgeGroupSignalCards({ cards = [] }) {
  const focusCards = cards.slice(0, 2)
  const additionalCards = cards.slice(2)

  return (
    <Box sx={sx.ageGroupSignalCards}>
      <Box sx={sx.ageGroupSignalFocusCards}>
        {focusCards.map(card => (
          <AgeGroupSignalCard key={card.id} card={card} isFocus />
        ))}
      </Box>

      <Box sx={sx.ageGroupSignalAdditionalCards}>
        {additionalCards.map(card => (
          <AgeGroupSignalCard key={card.id} card={card} />
        ))}
      </Box>
    </Box>
  )
}
