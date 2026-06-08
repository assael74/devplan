// ui/forms/RoleCreateForm.js

import React, { useEffect, useMemo } from 'react'
import { useTheme } from '@mui/joy/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import Box from '@mui/joy/Box'

import { getRoleCreateFormLayout } from './layouts/roleCreateForm.layout.js'
import { createSx as sx } from './ui/clubs/sx/create.sx.js'

import ClubMultiSelectField from '../fields/selectUi/clubs/ClubMultiSelectField.js'
import TeamMultiSelectField from '../fields/selectUi/teams/TeamMultiSelectField.js'
import RoleTypeSelectField from '../fields/selectUi/roles/RoleTypeSelectField.js'
import RoleActiveSelector from '../fields/checkUi/roles/RoleActiveSelector.js'
import PhoneField from '../fields/inputUi/PhoneField.js'
import EmailField from '../fields/inputUi/EmailField.js'
import RoleFullNameField from '../fields/inputUi/RoleFullNameField.js'

import RoleAccessPanel from './ui/roles/RoleAccessPanel.js'
import {
  asIdArray,
  buildRoleCreateDraft,
  buildRoleDraft,
  isRoleCreateValid,
} from './ui/roles/roleForm.logic.js'

const pickOptions = (context, keyAll, keyFallback) => {
  return Array.isArray(context?.[keyAll]) ? context[keyAll] : (context?.[keyFallback] || [])
}

export default function RoleCreateForm({
  draft = {},
  onDraft,
  onValidChange,
  context = {},
  variant = 'modal',
  forceMobile = false,
}) {
  const theme = useTheme()
  const isMobileViewport = useMediaQuery(theme.breakpoints.down('sm'))
  const isMobile = forceMobile || isMobileViewport

  const formDraft = useMemo(() => buildRoleDraft(draft), [draft])
  const isValid = useMemo(() => isRoleCreateValid(formDraft), [formDraft])

  const clubsOptions = useMemo(() => pickOptions(context, 'allClubs', 'clubs'), [context])
  const teamsOptions = useMemo(() => pickOptions(context, 'allTeams', 'teams'), [context])

  useEffect(() => {
    if (typeof onValidChange === 'function') onValidChange(isValid)
  }, [isValid, onValidChange])

  useEffect(() => {
    if (typeof onDraft === 'function') {
      onDraft(buildRoleCreateDraft(formDraft))
    }
  }, [formDraft, onDraft])

  const layout = useMemo(() => {
    return getRoleCreateFormLayout({ variant, isMobile })
  }, [variant, isMobile])

  const setField = (key, value) => {
    if (typeof onDraft !== 'function') return
    onDraft(buildRoleCreateDraft({ ...formDraft, [key]: value }))
  }

  const setDraft = (updater) => {
    if (typeof onDraft !== 'function') return
    const next = typeof updater === 'function' ? updater(formDraft) : updater
    onDraft(buildRoleCreateDraft(next))
  }

  return (
    <Box sx={sx.root(layout)}>
      <Box sx={sx.block(layout.topCols, 1)}>
        <Box sx={{ minWidth: 0 }}>
          <RoleFullNameField
            value={formDraft.fullName}
            onChange={(v) => setField('fullName', v)}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <RoleTypeSelectField
            value={formDraft.type}
            onChange={(v) => setField('type', v)}
          />
        </Box>
      </Box>

      <Box sx={sx.block(layout.mainCols, 1)}>
        <Box sx={{ minWidth: 0 }}>
          <RoleActiveSelector
            value={formDraft.active}
            onChange={(v) => setField('active', !!v)}
          />
        </Box>
      </Box>

      <Box sx={sx.block({ xs: '1fr', md: '1fr 1fr' }, 1)}>
        <PhoneField
          value={formDraft.phone}
          onChange={(v) => setField('phone', v)}
        />

        <EmailField
          value={formDraft.email}
          onChange={(v) => setField('email', v)}
        />
      </Box>

      <Box sx={sx.block({ xs: '1fr', md: '1fr' }, 1)}>
        <ClubMultiSelectField
          value={formDraft.clubsId}
          onChange={(v) => setField('clubsId', asIdArray(v))}
          clubs={clubsOptions}
        />

        <TeamMultiSelectField
          teams={teamsOptions}
          value={formDraft.teamsId}
          clubs={clubsOptions}
          onChange={(v) => setField('teamsId', asIdArray(v))}
        />
      </Box>

      <Box sx={sx.block({ xs: '1fr', md: '1fr' }, 1)}>
        <RoleAccessPanel
          draft={formDraft}
          setDraft={setDraft}
        />
      </Box>
    </Box>
  )
}
