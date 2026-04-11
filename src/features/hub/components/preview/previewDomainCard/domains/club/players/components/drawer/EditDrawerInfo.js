import React from 'react'
import { Box } from '@mui/joy'
import {
  PlayerIfaLinkField,
  PlayerFirstNameField,
  PlayerLastNameField,
  PlayerShortNameField,
  DateInputField,
} from '../../../../../../../../../../ui/fields'
import { drawerSx as sx } from '../../sx/editDrawer.sx.js'

export default function EditDrawerInfo({ draft, setDraft }) {
  return (
    <Box sx={sx.sectionCardSx}>
      <Box sx={sx.boolRowSx}>
        <PlayerFirstNameField
          size="sm"
          value={draft.playerFirstName}
          onChange={(v) => setDraft((p) => ({ ...p, playerFirstName: v }))}
        />

        <PlayerLastNameField
          size="sm"
          value={draft.playerLastName}
          onChange={(v) => setDraft((p) => ({ ...p, playerLastName: v }))}
        />

        <PlayerShortNameField
          size="sm"
          value={draft.playerShortName}
          onChange={(v) => setDraft((p) => ({ ...p, playerShortName: v }))}
        />

        <DateInputField
          value={draft.birthDay}
          onChange={(v) => setDraft((p) => ({ ...p, birthDay: v }))}
          label="יום הולדת"
          size="sm"
        />
      </Box>

      <PlayerIfaLinkField
        size="sm"
        value={draft.ifaLink}
        onChange={(v) => setDraft((p) => ({ ...p, ifaLink: v }))}
      />
    </Box>
  )
}
