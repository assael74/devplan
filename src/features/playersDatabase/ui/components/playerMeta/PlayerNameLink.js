// src/features/playersDatabase/ui/components/playerMeta/PlayerNameLink.js

import {
  Avatar,
  Box,
  Typography,
} from '@mui/joy'

import ExternalLinkIcon from '../modals/ExternalLinkIcon.js'
import { playerNameLinkSx as sx } from './sx/playerNameLink.sx.js'

export default function PlayerNameLink({
  name,
  url,
  internalHref,
  internalTarget,
  avatarSrc,
  avatarAlt = '',
}) {
  const hasInternalLink = Boolean(internalHref)

  return (
    <Box sx={sx.root}>
      {avatarSrc ? (
        <Avatar src={avatarSrc} alt={avatarAlt} sx={sx.avatar} />
      ) : null}

      <Typography
        component={hasInternalLink ? 'a' : 'span'}
        href={hasInternalLink ? internalHref : undefined}
        target={hasInternalLink ? internalTarget : undefined}
        rel={hasInternalLink && internalTarget === '_blank' ? 'noopener noreferrer' : undefined}
        level="body-sm"
        sx={[sx.name, hasInternalLink && sx.nameLink]}
      >
        {name || '-'}
      </Typography>

      <ExternalLinkIcon
        href={url}
        onClick={event => event.stopPropagation()}
      />
    </Box>
  )
}
