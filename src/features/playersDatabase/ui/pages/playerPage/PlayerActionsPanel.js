// src/features/playersDatabase/ui/pages/playerPage/PlayerActionsPanel.js

import {
  Box,
  Button,
  Divider,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import PageSidePanel from '../../components/page/PageSidePanel.js'
import { WorkTaskList } from '../../components/modals/index.js'
import { playerActionsPanelSx as sx } from './sx/playerActionsPanel.sx.js'

const SECONDARY_ACTIONS = [
  {
    id: 'link',
    label: 'עריכת קישור שחקן',
    iconId: 'addLink',
  },
]

export default function PlayerActionsPanel({
  recommendedActions = [],
  tasks = [],
  tasksLoading,
  onAction = () => {},
  onTaskEdit,
}) {
  const primaryActions = recommendedActions.slice(0, 2)

  return (
    <PageSidePanel>
      <Box sx={sx.recommendedBox}>
        <Box sx={sx.sectionHeading}>
          <Box sx={sx.sectionIcon}>
            {iconUi({id: 'targets', size: 'sm'})}
          </Box>

          <Box>
            <Typography level='title-sm' sx={sx.sectionTitle}>
              פעולות מומלצות
            </Typography>

            <Typography level='body-xs' sx={sx.sectionSubtitle}>
              שתי הפעולות החשובות ביותר כרגע
            </Typography>
          </Box>
        </Box>

        <Box sx={sx.recommendedList}>
          {primaryActions.length ? primaryActions.map((action, index) => (
            <Button
              key={action.id || index}
              size='sm'
              variant={index === 0 ? 'solid' : 'outlined'}
              startDecorator={iconUi({id: index === 0 ? 'priorityHigh' : 'check', size: 'sm'})}
              sx={index === 0 ? sx.primaryRecommendedButton : sx.secondaryRecommendedButton}
              onClick={() => onAction('review')}
            >
              {action.title}
            </Button>
          )) : (
            <Typography level='body-xs' sx={sx.emptyRecommended}>
              אין כרגע פעולה דחופה שהמערכת ממליצה עליה.
            </Typography>
          )}
        </Box>
      </Box>

      <Divider sx={sx.divider} />

      <Box sx={sx.editableBox}>
        <Typography level='body-xs' sx={sx.editableLabel}>
          עדכון שחקן
        </Typography>

        <Typography level='body-xs' sx={sx.editableText}>
          Player Review, רמת עניין ידנית, מעברי קבוצה ופרטים מקצועיים מנוהלים מכאן.
        </Typography>

        <Button
          size='sm'
          variant='outlined'
          startDecorator={iconUi({id: 'edit', size: 'sm'})}
          onClick={() => onAction('review')}
        >
          פתח עריכה מקצועית
        </Button>
      </Box>

      <Divider sx={sx.divider} />

      <Box sx={sx.actionList}>
        {SECONDARY_ACTIONS.map(action => (
          <Button
            key={action.id}
            size='sm'
            variant='plain'
            startDecorator={iconUi({id: action.iconId, size: 'sm'})}
            sx={sx.actionButton}
            onClick={() => onAction(action.id)}
          >
            {action.label}
          </Button>
        ))}
      </Box>

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
