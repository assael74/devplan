// ui/forms/players/edit/PlayerStatusFields.js

import React from 'react'
import { Box } from '@mui/joy'

import PlayerActiveSelector from '../../../fields/players/PlayerActiveSelector.js'
import PlayerTypeSelector from '../../../fields/players/PlayerTypeSelector.js'
import ProjectStatusSelectField from '../../../fields/players/ProjectStatusSelectField.js'
import SeasonPlanStatusSelect from '../../../fields/players/SeasonPlanStatusSelect.js'
import SquadRoleSelectField from '../../../fields/players/SquadRoleSelectField.js'

export default function PlayerStatusFields({
  draft,
  onField,
  disabled = false,
  statusLayout,
  planLayout,
  size = 'md',
}) {
  return (
    <>
      <Box sx={statusLayout}>
        <PlayerActiveSelector
          size={size}
          value={draft?.active === true}
          onChange={() => onField('active', draft?.active !== true)}
          disabled={disabled}
        />

        <PlayerTypeSelector
          size={size}
          value={draft?.type}
          onChange={(value) => onField('type', value)}
          disabled={disabled}
        />
      </Box>

      <Box sx={planLayout}>
        <SeasonPlanStatusSelect
          size={size}
          value={draft?.seasonPlanStatus || ''}
          onChange={(value) => onField('seasonPlanStatus', value)}
          disabled={disabled}
          emptyLabel="ללא תוכנית"
        />

        <SquadRoleSelectField
          size={size}
          label="מעמד"
          value={draft?.squadRole || ''}
          onChange={(value) => onField('squadRole', value)}
          disabled={disabled}
          emptyLabel="ללא מעמד"
        />
      </Box>

      <ProjectStatusSelectField
        label="סטטוס פרויקט"
        size={size}
        value={draft?.projectStatus || ''}
        onChange={(value) => onField('projectStatus', value)}
        disabled={disabled}
        emptyLabel="ללא סטטוס פרויקט"
      />
    </>
  )
}
