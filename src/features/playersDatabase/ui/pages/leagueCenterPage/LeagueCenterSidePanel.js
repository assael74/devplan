// src/features/playersDatabase/ui/pages/leagueCenterPage/LeagueCenterSidePanel.js

import PageSidePanel from '../../components/page/PageSidePanel.js'
import LeagueCenterWorkArea from './LeagueCenterWorkArea.js'

export default function LeagueCenterSidePanel({
  collapsible,
  collapsed,
  onCollapsedChange,
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
    >
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
