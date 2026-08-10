// src/features/playersDatabase/ui/pages/playerPage/PlayerActionsPanel.js

import {
  Box,
  Button,
  Divider,
  IconButton,
  Option,
  Select,
  Tooltip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import PageSidePanel from '../../components/page/PageSidePanel.js'
import { WorkTaskList } from '../../components/modals/index.js'
import { playerActionsPanelSx as sx } from './sx/playerActionsPanel.sx.js'

const PRIMARY_ACTION = {
  id: 'profile',
  label: 'פרופיל סקאוט',
  iconId: 'profile',
}

const SECONDARY_ACTIONS = [
  {
    id: 'report',
    label: 'תצוגה ופרסום דוח',
    iconId: 'print',
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
  tasks = [],
  tasksLoading,
  onSeasonChange,
  onAction = () => {},
  onTaskEdit,
}) {
  return (
    <PageSidePanel>
      <Box sx={sx.seasonBox}>
        <Typography level='body-xs' sx={sx.seasonLabel}>
          עונת משחקים
        </Typography>

        <Select
          size='sm'
          value={selectedSeasonKey || ''}
          onChange={(_, value) => onSeasonChange(value || '')}
          sx={sx.seasonSelect}
        >
          <Option value=''>
            כל העונות
          </Option>

          {seasonOptions.map(option => (
            <Option
              key={option.seasonKey}
              value={option.seasonKey}
            >
              {option.label}
            </Option>
          ))}
        </Select>
      </Box>

      <Divider sx={sx.divider} />

      <Box sx={sx.actionsRow}>
        <Button
          variant='outlined'
          size='sm'
          startDecorator={iconUi({id: PRIMARY_ACTION.iconId, size: 'md'})}
          sx={sx.primaryActionButton}
          onClick={() => onAction(PRIMARY_ACTION.id)}
        >
          {PRIMARY_ACTION.label}
        </Button>

        {SECONDARY_ACTIONS.map(action => {
          const linkDisabled = action.id === 'link' && !selectedSeasonKey
          const title = linkDisabled
            ? 'בחר עונה לעריכת קישור השחקן'
            : action.label

          return (
            <Tooltip key={action.id} title={title}>
              <span>
                <IconButton
                  variant='outlined'
                  size='sm'
                  aria-label={action.label}
                  disabled={linkDisabled}
                  sx={sx.secondaryIconButton}
                  onClick={() => onAction(action.id)}
                >
                  {iconUi({id: action.iconId, size: 'sm'})}
                </IconButton>
              </span>
            </Tooltip>
          )
        })}
      </Box>

      <Typography level='body-xs' sx={sx.placeholderNote}>
        פעולות אלו הן placeholders לחיבור עתידי.
      </Typography>

      <Divider sx={sx.divider} />

      <WorkTaskList
        title='משימות לשחקן'
        emptyText='אין משימות פעילות לשחקן בהקשר הנוכחי'
        tasks={tasks}
        loading={tasksLoading}
        onEdit={onTaskEdit}
      />
    </PageSidePanel>
  )
}
