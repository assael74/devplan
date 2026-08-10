// src/features/playersDatabase/ui/pages/leagueCenterPage/LeagueCenterSidePanel.js

import { Divider } from '@mui/joy'

import PageSidePanel from '../../components/page/PageSidePanel.js'
import LeagueCenterContext from './LeagueCenterContext.js'
import LeagueCenterWorkArea from './LeagueCenterWorkArea.js'
import { leagueCenterSidePanelSx as sx } from './sx/leagueCenterSidePanel.sx.js'

export default function LeagueCenterSidePanel({
  model,
  tasks,
  loading,
  onOpenTask,
  onOpenTaskItem,
  onEditTask,
}) {
  return (
    <PageSidePanel scrollable>
      <LeagueCenterContext model={model} />

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
