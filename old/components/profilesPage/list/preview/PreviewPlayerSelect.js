// features/playersDatabase/components/profilesPage/list/preview/PreviewPlayerSelect.js

import React from 'react'
import { Box } from '@mui/joy'

import PlayerLinksEditor from './PlayerLinksEditor'
import PlayerNotesEditor from './PlayerNotesEditor'
import PlayerProfileSummary from './PlayerProfileSummary'
import PlayerPositionEditor from './PlayerPositionEditor'
import { previewSx as sx } from './sx/preview.sx.js'

export default function PreviewPlayerSelect({
  profile,
  player,
  linksRow = null,
  rowLinks = null,
  onRemoveProfile = null,
  onSaved = null,
}) {
  const [linksOpen, setLinksOpen] = React.useState(false)

  React.useEffect(() => {
    setLinksOpen(Boolean(linksRow))
  }, [linksRow])

  const handleToggleLinks = () => {
    if (!rowLinks) return

    if (linksOpen) {
      setLinksOpen(false)
      rowLinks.close()
      return
    }

    if (!linksRow && player && profile) {
      rowLinks.open(profile, player)
    }

    setLinksOpen(true)
  }

  const handleSaveLinks = async value => {
    if (!rowLinks) return

    await rowLinks.save(value)
    setLinksOpen(false)
    rowLinks.close()
  }

  return (
    <Box sx={sx.previewPlayerSelect}>
      <PlayerPositionEditor player={player} onSaved={onSaved} />
      <PlayerProfileSummary player={player} onRemoveProfile={onRemoveProfile} />
      <PlayerNotesEditor player={player} onSaved={onSaved} />
      <PlayerLinksEditor
        row={linksRow}
        open={linksOpen}
        saving={rowLinks ? rowLinks.saving : false}
        error={rowLinks ? rowLinks.error : ''}
        onToggle={handleToggleLinks}
        onSave={handleSaveLinks}
      />
    </Box>
  )
}
