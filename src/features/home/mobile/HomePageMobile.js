// features/home/mobile/HomePageMobile.js

import React, { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Box } from '@mui/joy'

import usePersonalTasks from '../sharedHook/usePersonalTasks.js'
import {
  buildWorkspaceBuckets,
  buildInProgressBucket,
} from '../sharedLogic/home.workspace.js'

import HomeStateCard from './components/HomeStateCard.js'
import HomeEntryScreenMobile from './screens/HomeEntryScreenMobile.js'
import InProgressTasksScreenMobile from './screens/InProgressTasksScreenMobile.js'
import WorkspaceTasksScreenMobile from './screens/WorkspaceTasksScreenMobile.js'

import EditDrawer from './components/editDrawer/EditDrawer.js'

export default function HomePageMobile() {
  const { tasks, loading, error } = usePersonalTasks()

  const [searchParams, setSearchParams] = useSearchParams()
  const [editTask, setEditTask] = useState(null)
  const [createTaskContext, setCreateTaskContext] = useState(null)

  const homeView = searchParams.get('homeView')
  const workspaceId = searchParams.get('workspace')

  const buckets = useMemo(() => buildWorkspaceBuckets(tasks), [tasks])

  const inProgressBucket = useMemo(() => {
    return buildInProgressBucket(tasks)
  }, [tasks])

  const handleOpenInProgress = () => {
    setSearchParams({ homeView: 'inProgress' })
  }

  const handleOpenWorkspace = (id) => {
    setSearchParams({ homeView: 'workspace', workspace: id })
  }

  const handleBackHome = () => {
    setSearchParams({})
  }

  if (loading) {
    return (
      <Box sx={{ p: 1.25 }}>
        <HomeStateCard loading title="טוען סביבת עבודה אישית..." />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 1.25 }}>
        <HomeStateCard
          color="danger"
          title="שגיאה בטעינת משימות"
          description="לא ניתן היה לטעון את tasksShorts"
        />
      </Box>
    )
  }

  if (homeView === 'inProgress') {
    return (
      <>
        <InProgressTasksScreenMobile
          bucket={inProgressBucket}
          onBack={handleBackHome}
          onEditTask={setEditTask}
        />

        <EditDrawer
          open={!!editTask}
          task={editTask}
          onClose={() => setEditTask(null)}
          onSaved={() => setEditTask(null)}
        />
      </>
    )
  }

  if (homeView === 'workspace') {
    return (
      <>
        <WorkspaceTasksScreenMobile
          workspaceId={workspaceId}
          buckets={buckets}
          onBack={handleBackHome}
          onEditTask={setEditTask}
        />

        <EditDrawer
          open={!!editTask}
          task={editTask}
          onClose={() => setEditTask(null)}
          onSaved={() => setEditTask(null)}
        />
      </>
    )
  }

  return (
    <HomeEntryScreenMobile
      buckets={buckets}
      inProgressBucket={inProgressBucket}
      onOpenInProgress={handleOpenInProgress}
      onOpenWorkspace={handleOpenWorkspace}
    />
  )
}
