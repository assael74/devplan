// previewDomainCard/domains/team/games/components/drawer/EditFormDrawer.js

import React from 'react'
import { Box, Typography, Input, Option, Select } from '@mui/joy'

import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'

import EditDrawerStatus from './EditDrawerStatus.js'

import GameHomeSelector from '../../../../../../../../../../ui/fields/checkUi/games/GameHomeSelector.js'
import DateInputField from '../../../../../../../../../../ui/fields/dateUi/DateInputField.js'
import HourInputField from '../../../../../../../../../../ui/fields/dateUi/HourInputField.js'
import GameDifficultySelectField from '../../../../../../../../../../ui/fields/selectUi/games/GameDifficultySelectField.js'
import GameDurationSelectField from '../../../../../../../../../../ui/fields/selectUi/games/GameDurationSelectField.js'
import GameTypeSelectField from '../../../../../../../../../../ui/fields/selectUi/games/GameTypeSelectField.js'
import GameRivelField from '../../../../../../../../../../ui/fields/inputUi/games/GameRivelField.js'
import GameVideoLinkField from '../../../../../../../../../../ui/fields/inputUi/games/GameVideoLinkField.js'

import { drawerFormrSx as sx } from '../../sx/editFormDrawer.sx.js'

const resultOptions = [
  { id: '', label: 'ללא תוצאה' },
  { id: 'win', label: 'ניצחון' },
  { id: 'draw', label: 'תיקו' },
  { id: 'loss', label: 'הפסד' },
]

export default function EditFormDrawer({ draft, setDraft, liveGame }) {
  return (
    <Box sx={sx.bodySx} className="dpScrollThin">
      <Box sx={sx.sectionCardSx}>
        <Typography sx={sx.sectionTitleSx}>פרטי משחק</Typography>

        <Box sx={{ display: 'grid', gap: 0.85 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1.5fr .5fr', gap: 0.85 }}>

          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.85 }}>

          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 0.75,
              flexWrap: 'nowrap',
              minWidth: 0,
              '& > *': {
                flex: '0 1 132px',
                minWidth: 0,
              },
            }}
          >

          </Box>
        </Box>
      </Box>

      <Box sx={sx.sectionCardSx}>

      </Box>

      <Box sx={sx.sectionCardSx}>
        <Typography sx={sx.sectionTitleSx}>תוצאת משחק</Typography>

        <Box sx={{ display: 'grid', gap: 0.85 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0.85 }}>

          </Box>
        </Box>
      </Box>
    </Box>
  )
}
