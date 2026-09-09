// src/features/playersDatabase/ui/pages/playerPage/PlayerActionsPanel.js

import {
  Box,
  Button,
  Divider,
  Menu,
  MenuItem,
  Typography,
} from '@mui/joy'
import * as React from 'react'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import PageSidePanel from '../../components/page/PageSidePanel.js'
import { WorkTaskList } from '../../components/modals/index.js'
import { playerActionsPanelSx as sx } from './sx/playerActionsPanel.sx.js'

export default function PlayerActionsPanel({
  tasks = [],
  tasksLoading,
  onAction = () => {},
  onTaskCreate,
  onTaskEdit,
  playerJsonLoading = false,
  searchIndexJsonLoading = false,
  teamJsonAvailable = false,
  teamSeasonJsonAvailable = false,
  playerSearchIndexJsonAvailable = false,
  teamSearchIndexJsonAvailable = false,
  onPlayerJson = () => {},
  onTeamJson = () => {},
  onTeamSeasonJson = () => {},
  onPlayerSearchIndexJson = () => {},
  onTeamSearchIndexJson = () => {},
  onDataRepair = () => {},
}) {
  const [downloadAnchor, setDownloadAnchor] = React.useState(null)

  return (
    <PageSidePanel>
      <Box sx={sx.recommendedBox}>
        <Box sx={sx.sectionHeading}>
          <Box sx={sx.sectionIcon}>
            {iconUi({id: 'targets', size: 'sm'})}
          </Box>

          <Box>
            <Typography level='title-sm' sx={sx.sectionTitle}>
              מידע מקצועי
            </Typography>

            <Typography level='body-xs' sx={sx.sectionSubtitle}>
              נתוני עונה והקישור למקור ההתאחדות
            </Typography>
          </Box>
        </Box>

        <Box sx={sx.recommendedList}>
          <Button
            size='sm'
            variant='solid'
            startDecorator={iconUi({id: 'goals', size: 'sm'})}
            sx={sx.primaryRecommendedButton}
            onClick={() => onAction('additional')}
          >
            פיזור שערים
          </Button>
          <Button
            size='sm'
            variant='outlined'
            startDecorator={iconUi({id: 'addLink', size: 'sm'})}
            sx={sx.secondaryRecommendedButton}
            onClick={() => onAction('link')}
          >
            קישור לאתר ההתאחדות
          </Button>
        </Box>
      </Box>

      <Divider sx={sx.divider} />

      <Box sx={sx.editableBox}>
        <Typography level='body-xs' sx={sx.editableLabel}>
          עדכון שחקן
        </Typography>

        <Typography level='body-xs' sx={sx.editableText}>
          סטטוס ופרטי קשר נשמרים ברמת מסמך השחקן.
        </Typography>

        <Button
          size='sm'
          variant='outlined'
          startDecorator={iconUi({id: 'phone', size: 'sm'})}
          onClick={() => onAction('agent')}
        >
          סוכן ופרטי קשר
        </Button>
      </Box>

      <Divider sx={sx.divider} />

      <Box sx={sx.actionList}>
        <Box sx={sx.dataActionsRow}>
          <Button size='sm' variant='plain' startDecorator={iconUi({id: 'download', size: 'sm'})} sx={sx.actionButton} loading={playerJsonLoading || searchIndexJsonLoading} onClick={event => setDownloadAnchor(event.currentTarget)}>
            הורדת נתונים
          </Button>
          <Button size='sm' variant='plain' startDecorator={iconUi({id: 'search', size: 'sm'})} sx={sx.actionButton} onClick={onDataRepair}>
            תיקוני דאטה
          </Button>
        </Box>

        <Menu
          anchorEl={downloadAnchor}
          open={Boolean(downloadAnchor)}
          placement='bottom-start'
          onClose={() => setDownloadAnchor(null)}
        >
          <MenuItem
            disabled={playerJsonLoading}
            onClick={() => {
              setDownloadAnchor(null)
              onPlayerJson()
            }}
          >
            {iconUi({id: 'playerDatabase', size: 'sm'})}
            מסמך שחקן
          </MenuItem>

          <MenuItem
            disabled={!teamJsonAvailable || playerJsonLoading}
            onClick={() => {
              setDownloadAnchor(null)
              onTeamJson()
            }}
          >
            {iconUi({id: 'team', size: 'sm'})}
            JSON שנתון
          </MenuItem>

          <MenuItem
            disabled={!teamSeasonJsonAvailable || playerJsonLoading}
            onClick={() => {
              setDownloadAnchor(null)
              onTeamSeasonJson()
            }}
          >
            {iconUi({id: 'team', size: 'sm'})}
            JSON נתוני קבוצה
          </MenuItem>

          <MenuItem
            disabled={!playerSearchIndexJsonAvailable || searchIndexJsonLoading}
            onClick={() => {
              setDownloadAnchor(null)
              onPlayerSearchIndexJson()
            }}
          >
            {iconUi({id: 'search', size: 'sm'})}
            אינדקס שחקן
          </MenuItem>

          <MenuItem
            disabled={!teamSearchIndexJsonAvailable || searchIndexJsonLoading}
            onClick={() => {
              setDownloadAnchor(null)
              onTeamSearchIndexJson()
            }}
          >
            {iconUi({id: 'search', size: 'sm'})}
            אינדקס קבוצה
          </MenuItem>
        </Menu>

      </Box>

      <Divider sx={sx.divider} />

      <WorkTaskList
        title='משימות לשחקן'
        emptyText='אין משימות פעילות לשחקן בהקשר הנוכחי'
        tasks={tasks}
        loading={tasksLoading}
        onCreate={onTaskCreate}
        onEdit={onTaskEdit}
      />
    </PageSidePanel>
  )
}
