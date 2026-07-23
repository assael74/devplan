// features/playersDatabase/ui/pages/playerPage/PlayerActionsPanel.js

import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Option,
  Select,
  Stack,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import {
  PLAYER_HISTORY_FILTER_OPTIONS,
} from './logic/playerPage.constants.js'
import { playerContentSx as sx } from './sx/playerContent.sx.js'

const PLACEHOLDER_ACTIONS = [
  {
    id: 'profile',
    label: 'פרופיל סקאוט',
    iconId: 'profile',
    primary: true,
  },
  {
    id: 'edit',
    label: 'עריכת פרטי שחקן',
    iconId: 'edit',
  },
  {
    id: 'link',
    label: 'עריכת קישור שחקן',
    iconId: 'addLink',
  },
]

export default function PlayerActionsPanel({
  selectedSeasonKey,
  seasonOptions = [],
  filter,
  onSeasonChange,
  onFilterChange,
  onAction = () => {},
}) {
  return (
    <Card sx={sx.actionsPanel}>
      <Box sx={sx.filtersBox}>
        <Typography level='body-xs' sx={sx.filtersLabel}>
          עונת משחקים
        </Typography>

        <Select
          size='sm'
          value={selectedSeasonKey || ''}
          onChange={(_, value) => onSeasonChange(value || '')}
          sx={sx.filterSeasonSelect}
        >
          {seasonOptions.length ? (
            seasonOptions.map(option => (
              <Option
                key={option.seasonKey}
                value={option.seasonKey}
              >
                {option.label}
              </Option>
            ))
          ) : (
            <Option value=''>
              אין עונות
            </Option>
          )}
        </Select>

        <Typography level='body-xs' sx={sx.filtersLabel}>
          טווח תצוגה
        </Typography>

        <Box sx={sx.filtersGrid}>
          {PLAYER_HISTORY_FILTER_OPTIONS.map(option => (
            <Chip
              key={option.id}
              variant={filter === option.id ? 'solid' : 'soft'}
              onClick={() => onFilterChange(option.id)}
              sx={filter === option.id ? sx.filterChipActive : sx.filterChip}
            >
              {option.label}
            </Chip>
          ))}
        </Box>
      </Box>

      <Divider sx={sx.actionDivider} />

      <Stack
        spacing={1}
        className='dpScrollThin'
        sx={sx.actionsList}
      >
        {PLACEHOLDER_ACTIONS.map(action => (
          <Button
            key={action.id}
            variant={action.primary ? 'solid' : 'outlined'}
            startDecorator={iconUi({
              id: action.iconId,
              size: 'sm',
            })}
            sx={action.primary ? sx.actionPrimaryButton : sx.actionButton}
            onClick={() => onAction(action.id)}
          >
            {action.label}
          </Button>
        ))}
      </Stack>

      <Typography
        level='body-xs'
        sx={sx.placeholderNote}
      >
        פעולות אלו הן placeholders לחיבור עתידי.
      </Typography>
    </Card>
  )
}
