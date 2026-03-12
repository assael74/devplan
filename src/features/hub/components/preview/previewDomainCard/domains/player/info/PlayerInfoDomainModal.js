// hub/components/preview/previewDomainCard/domains/player/info/PlayerInfoDomainModal.js

import React from 'react'
import { Box } from '@mui/joy'

import PlayerInfoDomainHeader from './components/PlayerInfoDomainHeader.js'
import PlayerInfoDomainActions from './components/PlayerInfoDomainActions.js'
import PlayerInfoTopSection from './components/PlayerInfoTopSection.js'
import PlayerInfoContactSection from './components/PlayerInfoContactSection.js'
import PlayerInfoProjectSection from './components/PlayerInfoProjectSection.js'

import { usePlayerInfoDomainForm } from './logic/usePlayerInfoDomainForm.js'
import { sx } from './sx/playerInfo.domain.sx.js'

export default function PlayerInfoDomainModal({ entity, onClose }) {
  const {
    player,
    form,
    pending,
    dirty,
    phoneOk,
    setField,
    onSave,
    onReset,
    onCloseAndReset,
  } = usePlayerInfoDomainForm({ entity, onClose })

  return (
    <Box sx={sx.root}>
      <PlayerInfoDomainHeader player={player} />

      <PlayerInfoTopSection
        form={form}
        pending={pending}
        setField={setField}
      />

      <PlayerInfoContactSection
        form={form}
        pending={pending}
        phoneOk={phoneOk}
        setField={setField}
      />

      <PlayerInfoProjectSection
        form={form}
        pending={pending}
        setField={setField}
      />

      <PlayerInfoDomainActions
        dirty={dirty}
        pending={pending}
        onSave={onSave}
        onReset={onReset}
        onClose={onCloseAndReset}
      />
    </Box>
  )
}
