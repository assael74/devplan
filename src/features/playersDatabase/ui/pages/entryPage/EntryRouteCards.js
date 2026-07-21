// features/playersDatabase/ui/pages/entryPage/EntryRouteCards.js

import { Box, Button, Card, Stack, Typography } from '@mui/joy'

import { RouteCardVisual } from './EntryVisuals.js'
import { entryContentSx as sx } from './sx/entryContent.sx.js'

function ActionHeroCard({ title, text, buttonLabel, onClick, variant }) {
  return (
    <Card sx={sx.actionCard}>
      <RouteCardVisual variant={variant} />

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

export default function EntryRouteCards({ onNavigateToLeagues, onNavigateToSearch }) {
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
        title='חיפוש מועמדים'
        text='חיפוש, הצלבות ופרופילי סקאוט לפי נתונים שהוטענו.'
        buttonLabel='התחל חיפוש'
        variant='search'
        onClick={onNavigateToSearch}
      />
    </Box>
  )
}
