// src/features/playersDatabase/ui/components/playerMeta/PlayerNameLink.js

import {
  Box,
  Typography,
} from '@mui/joy'

import ExternalLinkIcon from '../modals/ExternalLinkIcon.js'
import { playerNameLinkSx as sx } from './sx/playerNameLink.sx.js'

export default function PlayerNameLink({
  name,
  url,
}) {
  return (
    <Box sx={sx.root}>
      <Typography level="body-sm" sx={sx.name}>
        {name || '-'}
      </Typography>

      <ExternalLinkIcon
        href={url}
        onClick={event => event.stopPropagation()}
      />
    </Box>
  )
}
