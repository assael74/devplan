// src/features/home/HomePageView.js

import React, { useMemo, useState } from 'react'
import { Box } from '@mui/joy'

import { iconUi } from '../../ui/core/icons/iconUi.js'
import { homeSx as sx } from './sx/home.sx.js'

import { useCoreData } from '../coreData/CoreDataProvider.js'
import usePersonalTasks from './hooks/usePersonalTasks.js'

import { buildWorkspaceBuckets } from './logic/home.workspace.js'

import HomeStateCard from './components/HomeStateCard.js'
import HomeWorkspaceHeader from './components/HomeWorkspaceHeader.js'
import TasksSectionCard from './components/TasksSectionCard.js'
import EditDrawer from './components/editDrawer/EditDrawer.js'
import NewFormDrawer from './components/newFormDrawer/NewFormDrawer.js'

import { getEntityColors } from '../../ui/core/theme/Colors.js'
import { buildTaskContextFromSectionId } from './components/newFormDrawer/logic/newFormDrawer.utils.js'

const c = (entity) => getEntityColors(entity)

export default function HomePageView() {
  const [editTask, setEditTask] = useState(null)
  const [createTaskContext, setCreateTaskContext] = useState(null)

  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
  } = usePersonalTasks()

  const {
    loading: coreLoading,
  } = useCoreData()

  const buckets = useMemo(() => buildWorkspaceBuckets(tasks), [tasks])

  if (tasksLoading) {
    return (
      <Box sx={sx.loadBox}>
        <HomeStateCard loading title="טוען סביבת עבודה אישית..." />
      </Box>
    )
  }

  if (tasksError) {
    return (
      <Box sx={sx.loadBox}>
        <HomeStateCard
          color="danger"
          title="שגיאה בטעינת משימות"
          description="לא ניתן היה לטעון את tasksShorts"
        />
      </Box>
    )
  }

  const handleOpenCreateTask = (sectionId) => {
    setCreateTaskContext(buildTaskContextFromSectionId(sectionId))
  }

  return (
    <>
      <Box sx={sx.loadBox}>
        <HomeWorkspaceHeader coreLoading={coreLoading} />

        <Box sx={sx.taskSections}>
          <Box sx={sx.innerBox}>
            <TasksSectionCard
              id="taskAnalyst"
              title="אזור משימות אנליסט"
              icon={iconUi({ id: 'Analyst', size: 'lg', sx: { color: c('taskAnalyst').accent } })}
              subtitle="משימות עבודה שוטפות מול מועדון, שחקנים, פגישות ואנליזה"
              items={buckets.analyst}
              onEditTask={setEditTask}
              onCreateTask={handleOpenCreateTask}
            />
          </Box>

          <Box sx={sx.innerBox}>
            <TasksSectionCard
              id="taskApp"
              title="אזור משימות מפתח"
              icon={iconUi({ id: 'app', size: 'lg', sx: { color: c('taskApp').accent } })}
              subtitle="משימות פיתוח, UX, דאטה, ארכיטקטורה ושיפורי מערכת"
              items={buckets.app}
              onEditTask={setEditTask}
              onCreateTask={handleOpenCreateTask}
            />
          </Box>
        </Box>

        {buckets.other.length ? (
          <Box sx={{ flex: '0 0 auto' }}>
            <TasksSectionCard
              id="taskOther"
              title="משימות נוספות"
              subtitle="משימות שלא שויכו עדיין לאחד מאזורי העבודה הקבועים"
              items={buckets.other}
              onEditTask={setEditTask}
              onCreateTask={handleOpenCreateTask}
            />
          </Box>
        ) : null}
      </Box>

      <EditDrawer
        open={!!editTask}
        task={editTask}
        onClose={() => setEditTask(null)}
        onSaved={() => setEditTask(null)}
      />

      <NewFormDrawer
        open={!!createTaskContext}
        taskContext={createTaskContext}
        onClose={() => setCreateTaskContext(null)}
        onCreated={() => setCreateTaskContext(null)}
      />
    </>
  )
}
