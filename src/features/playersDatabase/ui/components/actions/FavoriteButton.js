// src/features/playersDatabase/ui/components/actions/FavoriteButton.js

import {
  IconButton,
} from '@mui/joy'
import {
  StarBorder,
} from '@mui/icons-material'

import { favoriteButtonSx as sx } from './sx/favoriteButton.sx.js'

export default function FavoriteButton({
  label = '',
  sx: rootSx,
}) {
  const actionLabel = 'המועדפים אינם זמינים כרגע'
  const accessibleLabel = label
    ? `${actionLabel}: ${label}`
    : actionLabel

  return (
    <IconButton
      size='sm'
      variant='plain'
      aria-label={accessibleLabel}
      disabled
      title={actionLabel}
      sx={[sx.button(), rootSx]}
    >
      <StarBorder />
    </IconButton>
  )
}
