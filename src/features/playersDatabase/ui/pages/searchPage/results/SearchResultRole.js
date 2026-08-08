// features/playersDatabase/ui/pages/searchPage/results/SearchResultRole.js

import {
  Box,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { PlayerPositionChip } from '../../../components/playerPosition/index.js'
import { searchResultRoleSx as sx } from './sx/searchResultRole.sx.js'

export default function SearchResultRole({ row, onEdit }) {
  const positionLayer = row?.positionLayer || row?.position?.layer || ''
  const primaryPosition = row?.primaryPosition || row?.position?.primary || ''

  return (
    <Box sx={sx.root}>
      <Box sx={sx.header}>
        <Box sx={sx.titleWrap}>
          <Box sx={sx.icon}>{iconUi({
            id: 'playersDatabase',
            size: 'sm',
          })}</Box>
          <Typography level='title-sm' sx={sx.title}>
            חוליה ועמדה
          </Typography>
        </Box>
      </Box>

      <Box sx={sx.values}>
        <Box sx={sx.valueItem}>
          <Typography level='body-xs' sx={sx.label}>חוליה</Typography>
          <PlayerPositionChip
            type='layer'
            positionLayer={positionLayer}
            primaryPosition={primaryPosition}
            buttonLike
            onClick={() => onEdit?.(row)}
          />
        </Box>

        <Box sx={sx.valueItem}>
          <Typography level='body-xs' sx={sx.label}>עמדה</Typography>
          <PlayerPositionChip
            type='position'
            positionLayer={positionLayer}
            primaryPosition={primaryPosition}
            buttonLike
            onClick={() => onEdit?.(row)}
          />
        </Box>
      </Box>
    </Box>
  )
}
