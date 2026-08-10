// src/features/playersDatabase/ui/components/modals/workTask/TaskEditModal.js

import * as React from 'react'
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Option,
  Select,
  Stack,
  Textarea,
} from '@mui/joy'

import {
  taskPriorityOptions,
  taskStatusOptions,
} from '../../../../../../shared/tasks/tasks.constants.js'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { useLifecycle } from '../../../../../../ui/domains/entityLifecycle/LifecycleProvider.js'
import RegularModal from '../RegularModal.js'
import { taskEditModalSx as sx } from './sx/taskEditModal.sx.js'

function resolveTaskTitle(task) {
  const action = String(task?.workContext?.action || '').trim()

  if (action === 'loadTeams') return 'הוספת קבוצות'
  if (action === 'loadRoster') return 'טעינת סגל'
  if (action === 'loadStats') return 'טעינת סטטיסטיקה'

  return task?.title || ''
}

function buildDraft(task) {
  return {
    title: resolveTaskTitle(task),
    description: task?.description || '',
    priority: task?.priority || 'medium',
    status: task?.status || 'new',
  }
}

export default function TaskEditModal({
  open,
  task,
  busy,
  onClose,
  onSave,
  onDone,
}) {
  const lifecycle = useLifecycle()
  const [draft, setDraft] = React.useState(() => buildDraft(task))

  React.useEffect(() => {
    if (!open) return
    setDraft(buildDraft(task))
  }, [open, task])

  const title = String(draft.title || '').trim()
  const disabled = !title

  const setField = (key, value) => {
    setDraft(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = () => {
    if (disabled) return

    onSave({
      title,
      description: String(draft.description || '').trim(),
      priority: draft.priority,
      status: draft.status,
    })
  }

  const handleDone = () => {
    if (!task?.id || busy) return
    onDone(task)
  }

  const handleDelete = () => {
    if (!task?.id || busy) return

    lifecycle.openLifecycle(
      {
        entityType: 'task',
        id: task.id,
        name: task.title || 'משימה',
      },
      {
        onAfterSuccess: ({ action, entityType, id }) => {
          if (action !== 'delete') return
          if (entityType !== 'task') return
          if (id !== task.id) return

          onClose()
        },
      }
    )
  }

  return (
    <RegularModal
      open={open}
      title='עריכת משימה'
      description={task?.workContext?.scope === 'league'
        ? 'עדכון פרטי משימת ליגה'
        : 'עדכון פרטי משימה'}
      confirmLabel='שמירת שינויים'
      cancelLabel='ביטול'
      confirmIconId='save'
      busy={busy}
      disabled={disabled}
      size='md'
      onConfirm={handleSave}
      onClose={onClose}
    >
      <Stack sx={sx.form}>
        <FormControl required>
          <FormLabel>כותרת</FormLabel>
          <Input
            value={draft.title}
            onChange={event => setField('title', event.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>תיאור</FormLabel>
          <Textarea
            minRows={2}
            maxRows={4}
            value={draft.description}
            onChange={event => setField('description', event.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>סטטוס</FormLabel>
          <Select
            value={draft.status}
            onChange={(event, value) => {
              if (!value) return
              setField('status', value)
            }}
          >
            {taskStatusOptions.map(option => (
              <Option key={option.id} value={option.id}>
                {option.label}
              </Option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>עדיפות</FormLabel>
          <Select
            value={draft.priority}
            onChange={(event, value) => {
              if (!value) return
              setField('priority', value)
            }}
          >
            {taskPriorityOptions.map(option => (
              <Option key={option.id} value={option.id}>
                {option.label}
              </Option>
            ))}
          </Select>
        </FormControl>

        <Stack direction='row' sx={sx.actions}>
          <Button
            size='sm'
            variant='soft'
            disabled={busy}
            startDecorator={iconUi({id: 'doneTask', size: 'sm'})}
            color='success'
            onClick={handleDone}
          >
            סמן כבוצע
          </Button>

          <Button
            size='sm'
            variant='soft'
            disabled={busy}
            startDecorator={iconUi({id: 'delete', size: 'sm'})}
            color='danger'
            onClick={handleDelete}
          >
            מחק משימה
          </Button>
        </Stack>
      </Stack>
    </RegularModal>
  )
}
