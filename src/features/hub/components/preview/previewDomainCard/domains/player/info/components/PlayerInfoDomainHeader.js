// preview/previewDomainCard/domains/player/info/components/PlayerInfoDomainHeader.js

import React from 'react'
import { Box, Typography, Avatar, Chip } from '@mui/joy'
import playerImage from '../../../../../../../../../ui/core/images/playerImage.jpg'
import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'
import { buildPlayerName } from '../logic/playerInfo.domain.logic.js'
import { sx } from '../sx/playerInfo.domain.sx.js'

export default function PlayerInfoDomainHeader({ player }) {
  return (
    <Box sx={sx.header}>
      <Box sx={sx.headerIconWrap}>
        <Avatar src={player?.photo || playerImage} />
      </Box>

      <Box sx={{ minWidth: 0, display: 'grid', gap: 0.15 , flexGrow: 1 }}>
        <Typography level="title-sm" sx={sx.headerTitle}>
          מידע על שחקן
        </Typography>
        <Typography level="body-xs" sx={sx.headerSub}>
          {buildPlayerName(player)}
        </Typography>
      </Box>

      <Chip size="md" variant="outlined" color="primary" sx={{ flexShrink: 0, fontWeight: 700 }}>
        גיל: {player.age}
     </Chip>
    </Box>
  )
}
