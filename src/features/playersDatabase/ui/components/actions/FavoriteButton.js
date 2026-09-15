// src/features/playersDatabase/ui/components/actions/FavoriteButton.js

import {
  CircularProgress,
  IconButton,
} from '@mui/joy'
import {
  Star,
  StarBorder,
} from '@mui/icons-material'

import { favoriteButtonSx as sx } from './sx/favoriteButton.sx.js'

export default function FavoriteButton({
  favorite = false,
  loading = false,
  onToggle,
  label = '',
  sx: rootSx,
}) {
  const actionLabel = favorite ? 'הסרה מהמועדפים' : 'הוספה למועדפים'
  const accessibleLabel = label
    ? `${actionLabel}: ${label}`
    : actionLabel

  return (
    <IconButton
        size='sm'
        variant='plain'
        aria-label={accessibleLabel}
        disabled={loading}
        sx={[sx.button({ favorite }), rootSx]}
        onClick={event => {
          event.stopPropagation()
          onToggle?.()
        }}
      >
        {loading ? (
          <CircularProgress size='sm' sx={sx.progress} />
        ) : favorite ? (
          <Star />
        ) : (
          <StarBorder />
        )}
      </IconButton>
  )
}
