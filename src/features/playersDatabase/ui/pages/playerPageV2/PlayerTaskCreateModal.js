import * as React from 'react'
import {
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
} from '../../../../../shared/tasks/tasks.constants.js'
import RegularModal from '../../components/modals/RegularModal.js'
import { taskEditModalSx as sx } from '../../components/modals/workTask/sx/taskEditModal.sx.js'

const INITIAL_DRAFT = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'new',
}

export default function PlayerTaskCreateModal({
  open,
  busy = false,
  onClose,
  onCreate,
}) {
  const [draft, setDraft] = React.useState(INITIAL_DRAFT)

  React.useEffect(() => {
    if (open) setDraft(INITIAL_DRAFT)
  }, [open])

  const update = (key, value) => setDraft(current => ({ ...current, [key]: value }))
  const title = String(draft.title || '').trim()

  return (
    <RegularModal
      open={open}
      title='פתיחת משימה לשחקן'
      description='המשימה תשויך לשחקן ולעונה המוצגת.'
      confirmLabel='יצירת משימה'
      confirmIconId='add'
      busy={busy}
      disabled={!title}
      size='md'
      onConfirm={() => onCreate({
        title,
        description: String(draft.description || '').trim(),
        priority: draft.priority,
        status: draft.status,
      })}
      onClose={onClose}
    >
      <Stack sx={sx.form}>
        <FormControl required>
          <FormLabel>כותרת</FormLabel>
          <Input
            autoFocus
            value={draft.title}
            onChange={event => update('title', event.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>תיאור</FormLabel>
          <Textarea
            minRows={2}
            maxRows={4}
            value={draft.description}
            onChange={event => update('description', event.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>סטטוס</FormLabel>
          <Select value={draft.status} onChange={(_, value) => value && update('status', value)}>
            {taskStatusOptions.map(option => (
              <Option key={option.id} value={option.id}>{option.label}</Option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>עדיפות</FormLabel>
          <Select value={draft.priority} onChange={(_, value) => value && update('priority', value)}>
            {taskPriorityOptions.map(option => (
              <Option key={option.id} value={option.id}>{option.label}</Option>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </RegularModal>
  )
}
