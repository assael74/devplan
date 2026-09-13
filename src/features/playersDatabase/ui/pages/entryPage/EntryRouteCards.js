// features/playersDatabase/ui/pages/entryPage/EntryRouteCards.js

import {
  Box,
  Button,
  Card,
  Stack,
  Typography,
} from '@mui/joy'

import leagueLogo from '../../../../../ui/core/images/leagueLogo.png'
import clubLogo from '../../../../../ui/core/images/clubLogo.png'
import playerSearch from '../../../../../ui/core/images/playerSearch.png'
import { entryRouteCardsSx as sx } from './sx/entryRouteCards.sx.js'

const ROUTE_CARD_IMAGES = {
  leagues: leagueLogo,
  clubs: clubLogo,
  search: playerSearch,
}

function ActionHeroCard({
  title,
  text,
  buttonLabel,
  onClick,
  variant,
}) {
  return (
    <Card sx={sx.actionCard}>
      <Box sx={sx.routeImageFrame}>
        <Box
          component='img'
          src={ROUTE_CARD_IMAGES[variant]}
          alt=''
          aria-hidden='true'
          sx={sx.routeImage(variant)}
        />
      </Box>

      <Stack spacing={0.75} sx={sx.actionContent}>
        <Typography level='h2' sx={sx.actionTitle}>
          {title}
        </Typography>

        <Typography level='body-md' sx={sx.actionText}>
          {text}
        </Typography>
      </Stack>

      <Button color='neutral' variant='solid' onClick={onClick} sx={sx.actionButton}>
        {buttonLabel}
      </Button>
    </Card>
  )
}

export default function EntryRouteCards({ onNavigateToLeagues, onNavigateToSearch, onNavigateToClubs }) {
  return (
    <Box sx={sx.actionsGrid}>
      <ActionHeroCard
        title='פריסת ליגות'
        text='ניתוח ליגות, ביצועי קבוצות וטעינת שחקנים.'
        buttonLabel='הצג ליגות'
        variant='leagues'
        onClick={onNavigateToLeagues}
      />


      <ActionHeroCard
        title='מועדונים'
        text='קטלוג מועדונים, דירוג פנימי והכנה לאיסוף נתונים ממוקד.'
        buttonLabel='הצג מועדונים'
        variant='clubs'
        onClick={onNavigateToClubs}
      />
      <ActionHeroCard
        title='חיפוש מועמדים'
        text='חיפוש, הצלבות ופרופילי סקאוט לפי נתונים שהוטענו.'
        buttonLabel='התחל חיפוש'
        variant='search'
        onClick={onNavigateToSearch}
      />
    </Box>
  )
}
