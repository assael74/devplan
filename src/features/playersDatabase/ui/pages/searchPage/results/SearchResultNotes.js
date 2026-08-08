// features/playersDatabase/ui/pages/searchPage/results/SearchResultNotes.js

import * as React from 'react'
import {
  Box,
  Button,
  Textarea,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { searchResultNotesSx as sx } from './sx/searchResultNotes.sx.js'

export default function SearchResultNotes({
  row,
  onSave,
}) {
  const editable = row?.entityType !== 'birthTeamSeason'
  const [editing, setEditing] = React.useState(false)
  const [value, setValue] = React.useState(String(row?.notes || ''))
  const [saveError, setSaveError] = React.useState('')
  const hasNotes = Boolean(String(row?.notes || '').trim())

  React.useEffect(() => {
    if (!editing) setValue(String(row?.notes || ''))
  }, [editing, row?.notes])

  const handleCancel = () => {
    setValue(String(row?.notes || ''))
    setSaveError('')
    setEditing(false)
  }

  const handleSave = async () => {
    setSaveError('')

    try {
      await onSave?.(row, value)
      setEditing(false)
    } catch (error) {
      setSaveError(error?.message || 'ההערה לא נשמרה')
    }
  }

  return (
    <Box sx={sx.root}>
      <Box sx={sx.header}>
        <Box sx={sx.titleWrap}>
          <Box sx={sx.icon}>{iconUi({
            id: 'notes',
            size: 'sm',
          })}</Box>
          <Typography level='title-sm' sx={sx.title}>הערות</Typography>
        </Box>

        {editable ? (
          <Box sx={sx.headerActions}>
            {editing ? (
              <>
                <Button
                  size='sm'
                  variant='plain'
                  color='neutral'
                  disabled={row?.notesPending}
                  sx={sx.cancelButton}
                  onClick={handleCancel}
                >
                  ביטול
                </Button>

                <Button
                  size='sm'
                  loading={Boolean(row?.notesPending)}
                  startDecorator={iconUi({
                    id: 'save',
                    size: 'xs',
                  })}
                  sx={sx.saveButton}
                  onClick={handleSave}
                >
                  שמירה
                </Button>
              </>
            ) : (
              <Button
                size='sm'
                variant='plain'
                startDecorator={iconUi({
                  id: 'edit',
                  size: 'sm',
                })}
                sx={sx.editButton}
                onClick={() => setEditing(true)}
              >
                עריכה
              </Button>
            )}
          </Box>
        ) : null}
      </Box>

      <Textarea
        minRows={3}
        maxRows={3}
        readOnly={!editing}
        value={editing ? value : String(row?.notes || '')}
        placeholder={editing ? 'הוספת הערות לעונת השחקן' : 'לא נוספו הערות.'}
        sx={sx.textarea({
          editing,
          hasNotes,
        })}
        onChange={event => setValue(event.target.value)}
      />

      <Typography
        level='body-xs'
        color='danger'
        sx={sx.saveError({ visible: Boolean(saveError) })}
      >
        {saveError || ' '}
      </Typography>
    </Box>
  )
}
