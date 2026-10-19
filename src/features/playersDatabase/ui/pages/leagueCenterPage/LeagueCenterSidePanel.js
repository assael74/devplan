// src/features/playersDatabase/ui/pages/leagueCenterPage/LeagueCenterSidePanel.js

import { Button, Divider } from '@mui/joy'
import PageSidePanel from '../../components/page/PageSidePanel.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import LeagueCenterWorkArea from './LeagueCenterWorkArea.js'
import { leagueCenterSidePanelSx as sx } from './sx/leagueCenterSidePanel.sx.js'

export default function LeagueCenterSidePanel({
  collapsible,
  collapsed,
  onCollapsedChange,
  onOpenLeague,
  openLeagueDisabled = false,
  onDownloadDocuments,
  downloadDisabled = false,
  tasks,
  loading,
  onOpenTask,
  onOpenTaskItem,
  onEditTask,
}) {
  return (
    <PageSidePanel
      scrollable
      collapsible={collapsible}
      collapsed={collapsed}
      onCollapsedChange={onCollapsedChange}
      collapsedIndicator={!loading && tasks.length > 0
        ? { label: 'יש משימות פתוחות', color: 'danger' }
        : null}
      collapsedActions={[
        { label: 'פתיחת ליגה חדשה', iconId: 'addLeague', onClick: onOpenLeague, disabled: openLeagueDisabled },
        { label: 'פתיחת משימה', iconId: 'add', onClick: onOpenTask },
      ]}
    >
      <Button
        size='sm'
        variant='outlined'
        startDecorator={iconUi({ id: 'addLeague', size: 'small' })}
        onClick={onOpenLeague}
        disabled={openLeagueDisabled}
        sx={sx.openLeagueButton}
      >
        פתיחת ליגה חדשה
      </Button>
      <Button
        size='sm'
        variant='outlined'
        startDecorator={iconUi({ id: 'download', size: 'small' })}
        aria-label='הורדת מסמכי העמוד כ־ZIP'
        onClick={onDownloadDocuments}
        disabled={downloadDisabled}
        sx={sx.openLeagueButton}
      >
        הורדת מסמכי העמוד
      </Button>
      <Divider sx={sx.divider} />
      <LeagueCenterWorkArea
        tasks={tasks}
        loading={loading}
        onOpenTask={onOpenTask}
        onOpenTaskItem={onOpenTaskItem}
        onEditTask={onEditTask}
      />
    </PageSidePanel>
  )
}
