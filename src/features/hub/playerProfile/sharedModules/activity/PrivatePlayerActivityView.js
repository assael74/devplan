import React, { useMemo, useState } from 'react'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import {
  Box,
  Button,
  Chip,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Textarea,
  Typography,
} from '@mui/joy'

import { usePlayerHubUpdate } from '../../../hooks/players/usePlayerHubUpdate.js'
import { AnimatedModal } from '../../../../../ui/patterns/modals/index.js'
import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { makeId } from '../../../../../utils/id.js'

const FOLLOW_UP_STATUS = {
  OPEN: 'open',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

const asArray = value => Array.isArray(value) ? value : []
const clean = value => String(value == null ? '' : value).trim()
const dateValue = value => value ? String(value).slice(0, 10) : ''
const todayValue = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDate = value => {
  if (!value) return 'ללא תאריך'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('he-IL', { dateStyle: 'short' }).format(date)
}

const buttonSx = {
  bgcolor: devPlanColors.primary,
  color: '#fff',
  '&:hover': { bgcolor: devPlanColors.primaryDark },
}

export default function PrivatePlayerActivityView({ player }) {
  const { run, pending } = usePlayerHubUpdate(player)
  const [followUpOpen, setFollowUpOpen] = useState(false)
  const [followUpDraft, setFollowUpDraft] = useState({ title: '', note: '', dueDate: todayValue() })
  const [notesEditing, setNotesEditing] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [notesDraft, setNotesDraft] = useState(String(player?.personalNotes || ''))

  const activityItems = useMemo(() => asArray(player?.followUps), [player?.followUps])

  const followUps = useMemo(
    () => activityItems
      .filter(item => item?.kind === 'followUp' || !item?.kind)
      .sort((a, b) => {
        const aOpen = a?.status === FOLLOW_UP_STATUS.OPEN ? 0 : 1
        const bOpen = b?.status === FOLLOW_UP_STATUS.OPEN ? 0 : 1
        if (aOpen !== bOpen) return aOpen - bOpen
        return String(a?.dueDate || '').localeCompare(String(b?.dueDate || ''))
      }),
    [activityItems]
  )

  const openFollowUps = followUps.filter(item => item?.status === FOLLOW_UP_STATUS.OPEN)
  const closedFollowUps = followUps
    .filter(item => item?.status !== FOLLOW_UP_STATUS.OPEN)
    .sort((a, b) => Number(b?.updatedAt || b?.createdAt || 0) - Number(a?.updatedAt || a?.createdAt || 0))

  const nowDate = dateValue(Date.now())
  const overdueCount = openFollowUps.filter(item => item?.dueDate && item.dueDate < nowDate).length

  const saveActivityItems = next => run(
    { followUps: next },
    { player, id: player?.id, createIfMissing: true, section: 'privatePlayerFollowUps' }
  )

  const handleCreateFollowUp = async () => {
    const title = clean(followUpDraft.title)
    if (!title || !followUpDraft.dueDate) return
    const now = Date.now()
    const next = [
      ...activityItems,
      {
        id: makeId(),
        kind: 'followUp',
        title,
        note: clean(followUpDraft.note),
        dueDate: followUpDraft.dueDate,
        status: FOLLOW_UP_STATUS.OPEN,
        completedAt: null,
        createdAt: now,
        updatedAt: now,
      },
    ]
    await saveActivityItems(next)
    setFollowUpDraft({ title: '', note: '', dueDate: todayValue() })
    setFollowUpOpen(false)
  }

  const deleteFollowUp = async () => {
    if (!deleteTarget?.id) return
    const next = activityItems.filter(item => item?.id !== deleteTarget.id)
    await saveActivityItems(next)
    setDeleteTarget(null)
  }

  const updateFollowUpStatus = async (id, status) => {
    const now = Date.now()
    const next = activityItems.map(item => item?.id === id
      ? {
          ...item,
          status,
          completedAt: status === FOLLOW_UP_STATUS.COMPLETED ? now : null,
          updatedAt: now,
        }
      : item)
    await saveActivityItems(next)
  }


  const startNotesEdit = () => {
    setNotesDraft(String(player?.personalNotes || ''))
    setNotesEditing(true)
  }

  const cancelNotesEdit = () => {
    setNotesDraft(String(player?.personalNotes || ''))
    setNotesEditing(false)
  }

  const savePersonalNotes = async () => {
    const now = Date.now()
    await run(
      {
        personalNotes: notesDraft,
        personalNotesUpdatedAt: now,
      },
      { player, id: player?.id, createIfMissing: true, section: 'privatePlayerFollowUps' }
    )
    setNotesEditing(false)
  }

  return (
    <Box sx={{ p: { xs: 1, md: 1.25 }, height: '100%', overflowY: 'auto' }} className='dpScrollThin'>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={0.75} justifyContent='space-between' alignItems={{ xs: 'stretch', md: 'center' }} sx={{ mb: 1 }}>
        <Stack direction='row' spacing={0.75} alignItems='center' sx={{ flexWrap: 'wrap' }}>
          <Typography level='title-md'>עדכונים ומעקב</Typography>
          <Chip size='sm' variant='soft' color={openFollowUps.length ? 'primary' : 'neutral'}>פתוחות: {openFollowUps.length}</Chip>
          <Chip size='sm' variant='soft' color={overdueCount ? 'danger' : 'neutral'}>באיחור: {overdueCount}</Chip>
        </Stack>
        <Button size='sm' variant='outlined' startDecorator={iconUi({ id: 'addMeeting', size: 'sm' })} onClick={() => {
          setFollowUpDraft({ title: '', note: '', dueDate: todayValue() })
          setFollowUpOpen(true)
        }} sx={{ borderColor: devPlanColors.primary, color: devPlanColors.primary }}>
          משימת מעקב
        </Button>
      </Stack>

      <Stack spacing={0.75} sx={{ mb: 1 }}>
        {openFollowUps.map(item => {
          const overdue = item?.dueDate && item.dueDate < nowDate
          return (
            <Box key={item.id} sx={{ p: 0.9, border: '1px solid', borderColor: overdue ? 'danger.200' : 'neutral.200', borderInlineStart: '4px solid', borderInlineStartColor: overdue ? 'danger.500' : devPlanColors.tertiary, borderRadius: 'md', bgcolor: '#fff' }}>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent='space-between' spacing={0.75} alignItems={{ xs: 'stretch', md: 'center' }}>
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction='row' spacing={0.5} alignItems='center' sx={{ flexWrap: 'wrap' }}>
                    <Typography level='title-sm'>{item.title}</Typography>
                    {overdue ? <Chip size='sm' color='danger' variant='soft'>באיחור</Chip> : null}
                    <Typography level='body-xs' textColor={overdue ? 'danger.600' : 'neutral.500'}>יעד: {formatDate(item.dueDate)}</Typography>
                  </Stack>
                  {item.note ? <Typography level='body-xs' textColor='neutral.600' sx={{ mt: 0.25 }}>{item.note}</Typography> : null}
                </Box>
                <Stack direction='row' spacing={0.5}>
                  <Button size='sm' onClick={() => updateFollowUpStatus(item.id, FOLLOW_UP_STATUS.COMPLETED)} disabled={pending} sx={buttonSx}>הושלם</Button>
                  <Button size='sm' variant='plain' color='neutral' onClick={() => updateFollowUpStatus(item.id, FOLLOW_UP_STATUS.CANCELLED)} disabled={pending}>ביטול</Button>
                  <Button
                    size='sm'
                    variant='plain'
                    color='danger'
                    startDecorator={<DeleteOutlineRoundedIcon />}
                    onClick={() => setDeleteTarget(item)}
                    disabled={pending}
                  >
                    מחיקה
                  </Button>
                </Stack>
              </Stack>
            </Box>
          )
        })}
      </Stack>

      <Box sx={{ mb: 1, border: '1px solid', borderColor: 'neutral.200', borderRadius: 'md', bgcolor: '#fff', p: 1 }}>
        <Stack direction='row' justifyContent='space-between' alignItems='center' spacing={1} sx={{ mb: 0.75 }}>
          <Box>
            <Typography level='title-sm'>הערות אישיות</Typography>
            <Typography level='body-xs' textColor='neutral.500'>
              עודכן לאחרונה: {player?.personalNotesUpdatedAt ? formatDate(player.personalNotesUpdatedAt) : 'לא עודכן'}
            </Typography>
          </Box>
          <Stack direction='row' spacing={0.5}>
            {notesEditing ? (
              <>
                <Button
                  size='sm'
                  startDecorator={iconUi({ id: 'save', size: 'sm' })}
                  onClick={savePersonalNotes}
                  disabled={pending}
                  sx={buttonSx}
                >
                  שמור
                </Button>
                <Button size='sm' variant='plain' color='neutral' onClick={cancelNotesEdit} disabled={pending}>ביטול</Button>
              </>
            ) : (
              <Button size='sm' variant='outlined' onClick={startNotesEdit} sx={{ borderColor: devPlanColors.primary, color: devPlanColors.primary }}>ערוך</Button>
            )}
          </Stack>
        </Stack>
        <Textarea
          value={notesEditing ? notesDraft : String(player?.personalNotes || '')}
          onChange={event => setNotesDraft(event.target.value)}
          readOnly={!notesEditing}
          minRows={5}
          maxRows={10}
          placeholder='הוסף הערות אישיות על השחקן...'
          sx={{ bgcolor: notesEditing ? '#fff' : 'neutral.50' }}
        />
      </Box>

      {closedFollowUps.length ? (
        <Box sx={{ mb: 1 }}>
          <Typography level='title-sm' sx={{ mb: 0.5 }}>היסטוריית מעקב</Typography>
          <Stack spacing={0.5}>
            {closedFollowUps.map(item => (
              <Box key={item.id} sx={{ py: 0.65, px: 0.9, borderBottom: '1px solid', borderColor: 'neutral.200' }}>
                <Stack direction='row' justifyContent='space-between' spacing={1} alignItems='flex-start'>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography level='body-sm' sx={{ whiteSpace: 'pre-wrap' }}>{item.title}</Typography>
                    {item.note ? <Typography level='body-xs' textColor='neutral.500' sx={{ whiteSpace: 'pre-wrap' }}>{item.note}</Typography> : null}
                  </Box>
                  <Stack alignItems='flex-end' spacing={0.25}>
                    <Chip size='sm' variant='soft' color={item.status === FOLLOW_UP_STATUS.COMPLETED ? 'success' : 'neutral'}>
                      {item.status === FOLLOW_UP_STATUS.COMPLETED ? 'הושלם' : 'בוטל'}
                    </Chip>
                    <Typography level='body-xs' textColor='neutral.500' sx={{ whiteSpace: 'nowrap' }}>
                      {formatDate(item.completedAt || item.updatedAt || item.dueDate)}
                    </Typography>
                    <Button
                      size='sm'
                      variant='plain'
                      color='danger'
                      startDecorator={<DeleteOutlineRoundedIcon />}
                      onClick={() => setDeleteTarget(item)}
                      disabled={pending}
                      sx={{ minHeight: 24, px: 0.5 }}
                    >
                      מחיקה
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      ) : null}

      <AnimatedModal
        open={Boolean(deleteTarget)}
        title='מחיקת משימת מעקב'
        description='המשימה תימחק לצמיתות מהיסטוריית המעקב.'
        size='sm'
        confirmLabel='מחיקה'
        confirmColor='danger'
        busy={pending}
        onConfirm={deleteFollowUp}
        onClose={() => setDeleteTarget(null)}
      />

      <AnimatedModal
        open={followUpOpen}
        title='משימה או הערה למעקב'
        description='תיעוד משימה או הערה שדורשת מעקב.'
        size='md'
        confirmLabel='שמירה'
        busy={pending}
        disabled={!clean(followUpDraft.title) || !followUpDraft.dueDate}
        onConfirm={handleCreateFollowUp}
        onClose={() => setFollowUpOpen(false)}
      >
        <Stack spacing={1.5}>
          <FormControl required>
            <FormLabel>משימה או הערה למעקב</FormLabel>
            <Input value={followUpDraft.title} onChange={event => setFollowUpDraft(prev => ({ ...prev, title: event.target.value }))} />
          </FormControl>
          <FormControl required>
            <FormLabel>תאריך יעד</FormLabel>
            <Input type='date' value={followUpDraft.dueDate} onChange={event => setFollowUpDraft(prev => ({ ...prev, dueDate: event.target.value }))} />
          </FormControl>
          <FormControl>
            <FormLabel>הערה</FormLabel>
            <Textarea minRows={3} value={followUpDraft.note} onChange={event => setFollowUpDraft(prev => ({ ...prev, note: event.target.value }))} />
          </FormControl>
        </Stack>
      </AnimatedModal>
    </Box>
  )
}
