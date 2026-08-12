// src/features/playersDatabase/ui/components/modals/workTask/cards/RouteChoiceCard.js

import * as React from 'react'
import {
  Button,
  Typography,
} from '@mui/joy'

import { workTaskCardsSx as sx } from '../sx/workTaskCards.sx.js'

export default function RouteChoiceCard({ title, description, selected, onClick }) {
  return (
    <Button
      variant={selected ? 'soft' : 'outlined'}
      sx={[
        sx.routeCard,
        selected && sx.routeCardSelected,
      ]}
      onClick={onClick}
    >
      <Typography sx={sx.routeCardTitle}>
        {title}
      </Typography>
      <Typography level='body-xs' sx={sx.routeCardDescription}>
        {description}
      </Typography>
    </Button>
  )
}
