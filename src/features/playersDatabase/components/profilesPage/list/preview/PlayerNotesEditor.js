// features/playersDatabase/components/profilesPage/list/preview/PlayerNotesEditor.js

import React from 'react'
import { Box, Button, IconButton, Textarea, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { clean } from '../../logic/utils.js'
import { updatePlayerSeasonPosition } from '../../../../services/pdbPlayers.firestore.js'
import { markLeagueBoardCacheDirty } from '../../../summary/hooks/leagueBoardCache.js'
import { notesSx as sx } from './sx/notes.sx.js'

export default function PlayerNotesEditor({ player, onSaved = null }) {
  const [comments, setComments] = React.useState('')
  const [savedComments, setSavedComments] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    const nextComments = clean(player ? player.comments || player.comment || player.notes : '')
    setComments(nextComments)
    setSavedComments(nextComments)
    setError('')
  }, [player])

  const hasDraft = clean(comments) !== clean(savedComments)

  const resetComments = () => {
    setComments(savedComments)
    setError('')
  }

  const saveComments = async () => {
    if (!player || saving || !hasDraft) return

    setSaving(true)
    setError('')

    try {
      await updatePlayerSeasonPosition(player, { comments: clean(comments) })
      markLeagueBoardCacheDirty()
      setSavedComments(clean(comments))
      await onSaved?.(player)
    } catch (err) {
      setError((err && err.message) || 'שמירת הערות נכשלה')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box sx={sx.previewSection}>
      <Box sx={sx.previewSectionHead}>
        <Typography sx={sx.previewSectionTitle}>הערות</Typography>

        <Box sx={sx.previewSectionHeadActions}>
          <IconButton
            size="sm"
            variant="soft"
            color="neutral"
            aria-label="איפוס הערות"
            sx={sx.resetButton}
            disabled={!hasDraft || saving}
            onClick={resetComments}
          >
            {iconUi({ id: 'reset', size: 'sm' })}
          </IconButton>

          <Button
            size="sm"
            loading={saving}
            disabled={!hasDraft || saving}
            onClick={saveComments}
            startDecorator={iconUi({ id: 'save' })}
            sx={sx.saveButton}
          >
            שמור הערות
          </Button>
        </Box>
      </Box>

      <Textarea
        minRows={3}
        maxRows={3}
        value={comments}
        onChange={event => setComments(event.target.value)}
        placeholder="הערת סקאוט..."
        sx={sx.previewNotesField}
      />

      {error ? <Typography sx={sx.previewSectionError}>{error}</Typography> : null}
    </Box>
  )
}
