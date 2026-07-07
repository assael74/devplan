// features/playersDatabase/components/profilesPage/list/preview/PlayerLinksEditor.js

import React from 'react'
import { Box, Button, IconButton, Input, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { CollapseBox } from '../../../../../../ui/patterns/collapseBox/index.js'
import { clean } from '../../logic/utils.js'
import { linksSx as sx } from './sx/links.sx.js'

export default function PlayerLinksEditor({ row, open, saving, error, onToggle, onSave }) {
  const [playerUrl, setPlayerUrl] = React.useState('')
  const [teamUrl, setTeamUrl] = React.useState('')
  const [savedPlayerUrl, setSavedPlayerUrl] = React.useState('')
  const [savedTeamUrl, setSavedTeamUrl] = React.useState('')

  React.useEffect(() => {
    if (!row) return

    const nextPlayerUrl = clean(row.playerUrl || (row.source ? row.source.playerUrl : ''))
    const nextTeamUrl = clean(row.teamUrl || (row.source ? row.source.teamUrl : ''))

    setPlayerUrl(nextPlayerUrl)
    setTeamUrl(nextTeamUrl)
    setSavedPlayerUrl(nextPlayerUrl)
    setSavedTeamUrl(nextTeamUrl)
  }, [row])

  const resetLinks = () => {
    setPlayerUrl(savedPlayerUrl)
    setTeamUrl(savedTeamUrl)
  }

  return (
    <CollapseBox open={open} onToggle={onToggle} title="קישורים">
      <Box sx={sx.linksCollapse}>
        <Box sx={sx.linksFields}>
          <Box sx={sx.linksField}>
            <Typography sx={sx.linksLabel}>קישור לשחקן</Typography>
            <Input size="sm" value={playerUrl} placeholder="https://..." disabled={saving} onChange={event => setPlayerUrl(event.target.value)} />
          </Box>

          <Box sx={sx.linksField}>
            <Typography sx={sx.linksLabel}>קישור לקבוצה</Typography>
            <Input size="sm" value={teamUrl} placeholder="https://..." disabled={saving} onChange={event => setTeamUrl(event.target.value)} />
          </Box>
        </Box>

        {error ? <Typography sx={sx.linksError}>{error}</Typography> : null}

        <Box sx={sx.linksActions}>
          <Button size="sm" color="primary" loading={saving} sx={sx.saveButton} startDecorator={iconUi({ id: 'save' })} onClick={() => onSave({ playerUrl, teamUrl })}>
            שמור
          </Button>

          <IconButton size="sm" variant="soft" color="neutral" aria-label="איפוס קישורים" sx={sx.resetButton} disabled={saving} onClick={resetLinks}>
            {iconUi({ id: 'reset', size: 'sm' })}
          </IconButton>
        </Box>
      </Box>
    </CollapseBox>
  )
}
