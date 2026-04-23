// ui/forms/ui/players/PlayerEditFields.js

import React from 'react'
import { Box } from '@mui/joy'

import {
  PlayerIfaLinkField,
  PlayerFirstNameField,
  PlayerLastNameField,
  PlayerShortNameField,
  DateInputField,
} from '../../../fields'

import PlayerTypeSelector from '../../../fields/checkUi/players/PlayerTypeSelector.js'
import PlayerActiveSelector from '../../../fields/checkUi/players/PlayerActiveSelector.js'
import SquadRoleSelectField from '../../../fields/selectUi/players/SquadRoleSelectField.js'
import ProjectStatusSelectField from '../../../fields/selectUi/players/ProjectStatusSelectField.js'

import { editSx as sx } from './sx/edit.sx.js'

export default function PlayerEditFields({
  draft,
  setDraft,
  fieldDisabled = {},
}) {
  return (
    <Box sx={{ display: 'grid', gap: 1 }}>
      <Box sx={sx.sectionCard}>
        <Box sx={sx.infoGrid}>
          <PlayerFirstNameField
            size="sm"
            value={draft?.playerFirstName || ''}
            onChange={(value) =>
              setDraft((prev) => ({
                ...prev,
                playerFirstName: value,
              }))
            }
          />

          <PlayerLastNameField
            size="sm"
            value={draft?.playerLastName || ''}
            onChange={(value) =>
              setDraft((prev) => ({
                ...prev,
                playerLastName: value,
              }))
            }
          />

          <PlayerShortNameField
            size="sm"
            value={draft?.playerShortName || ''}
            onChange={(value) =>
              setDraft((prev) => ({
                ...prev,
                playerShortName: value,
              }))
            }
          />

          <DateInputField
            value={draft?.birthDay || ''}
            onChange={(value) =>
              setDraft((prev) => ({
                ...prev,
                birthDay: value,
              }))
            }
            label="יום הולדת"
            size="sm"
          />
        </Box>

        <PlayerIfaLinkField
          size="sm"
          value={draft?.ifaLink || ''}
          onChange={(value) =>
            setDraft((prev) => ({
              ...prev,
              ifaLink: value,
            }))
          }
        />
      </Box>

      <Box sx={sx.sectionCard}>
        <Box sx={sx.statusTopRow}>
          <Box sx={sx.activeWrap}>
            <PlayerActiveSelector
              size="sm"
              value={draft?.active === true}
              onChange={() =>
                setDraft((prev) => ({
                  ...prev,
                  active: !prev.active,
                }))
              }
            />
          </Box>

          <Box sx={sx.roleTypeWrap}>
            <Box sx={{ flex: 1, minWidth: 140, maxWidth: 180 }}>
              <SquadRoleSelectField
                size="sm"
                value={draft?.squadRole || ''}
                onChange={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    squadRole: value,
                  }))
                }
              />
            </Box>

            <PlayerTypeSelector
              size="sm"
              value={draft?.type === 'project'}
              onChange={(next) =>
                setDraft((prev) => ({
                  ...prev,
                  type: next ? 'project' : 'noneType',
                }))
              }
            />
          </Box>
        </Box>

        <ProjectStatusSelectField
          value={draft?.projectStatus || ''}
          onChange={(value) =>
            setDraft((prev) => ({
              ...prev,
              projectStatus: value,
            }))
          }
          size="sm"
        />
      </Box>
    </Box>
  )
}
