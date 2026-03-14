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

import { drawerSx as sx } from '../../sx/editDrawer.sx.js'

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
            <GameRivelField
              size="sm"
              required
              value={draft.rivel}
              onChange={(value) =>
                setDraft((prev) => ({ ...prev, rivel: value || '' }))
              }
            />

            <GameHomeSelector
              size="sm"
              value={draft.home}
              onChange={(value) =>
                setDraft((prev) => ({ ...prev, home: value === true }))
              }
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.85 }}>
            <DateInputField
              size="sm"
              value={draft.gameDate}
              onChange={(value) =>
                setDraft((prev) => ({ ...prev, gameDate: value || '' }))
              }
            />

            <HourInputField
              size="sm"
              value={draft.gameHour}
              onChange={(value) =>
                setDraft((prev) => ({ ...prev, gameHour: value || '' }))
              }
            />
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
            <GameTypeSelectField
              size="sm"
              value={draft.type}
              onChange={(value) =>
                setDraft((prev) => ({ ...prev, type: value || '' }))
              }
            />

            <GameDifficultySelectField
              size="sm"
              value={draft.difficulty}
              onChange={(value) =>
                setDraft((prev) => ({ ...prev, difficulty: value || '' }))
              }
            />

            <GameDurationSelectField
              size="sm"
              value={draft.gameDuration}
              onChange={(value) =>
                setDraft((prev) => ({ ...prev, gameDuration: value || '' }))
              }
            />
          </Box>
        </Box>
      </Box>

      <Box sx={sx.sectionCardSx}>
        <GameVideoLinkField
          size="sm"
          value={draft.vLink || ''}
          onChange={(value) =>
            setDraft((prev) => ({ ...prev, vLink: value || '' }))
          }
        />
      </Box>

      <Box sx={sx.sectionCardSx}>
        <Typography sx={sx.sectionTitleSx}>תוצאת משחק</Typography>

        <Box sx={{ display: 'grid', gap: 0.85 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0.85 }}>
            <Input
              size="sm"
              type="number"
              value={draft.goalsFor}
              placeholder="שערי זכות"
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  goalsFor: e.target.value === '' ? '' : Number(e.target.value),
                }))
              }
              startDecorator={iconUi({ id: 'goals', size: 'sm' })}
            />

            <Input
              size="sm"
              type="number"
              value={draft.goalsAgainst}
              placeholder="שערי חובה"
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  goalsAgainst: e.target.value === '' ? '' : Number(e.target.value),
                }))
              }
              startDecorator={iconUi({ id: 'goals', size: 'sm' })}
            />

            <Select
              size="sm"
              value={draft.result}
              onChange={(e, value) =>
                setDraft((prev) => ({ ...prev, result: value || '' }))
              }
              placeholder="בחר תוצאה"
            >
              {resultOptions.map((o) => (
                <Option key={o.id || 'empty'} value={o.id}>
                  {o.label}
                </Option>
              ))}
            </Select>
          </Box>
        </Box>
      </Box>

      <EditDrawerStatus game={liveGame} />
    </Box>
  )
}
