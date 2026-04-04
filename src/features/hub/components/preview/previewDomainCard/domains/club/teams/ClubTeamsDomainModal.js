// preview/previewDomainCard/domains/club/teams/ClubTeamsDomainModal.js

import React, { useMemo, useState } from 'react'
import { Box } from '@mui/joy'

import ClubTeamsKpi from './components/ClubTeamsKpi'
import ClubTeamsFilters from './components/ClubTeamsFilters'
import ClubTeamsTable from './components/ClubTeamsTable'
import EditDrawer from './components/drawer/EditDrawer.js'
import NewFormDrawer from './components/newForm/NewFormDrawer.js'

import { resolveClubTeamsDomain } from './logic/clubTeams.domain.logic.js'
import { modalRootSx } from './sx/clubTeamsModal.sx'

export default function ClubTeamsDomainModal({ entity, context }) {
  const liveClub = useMemo(() => {
    const clubs = Array.isArray(context?.clubs) ? context.clubs : []
    return clubs.find((c) => c?.id === entity?.id) || entity || null
  }, [context?.clubs, entity])

  const [q, setQ] = useState('')
  const [year, setYear] = useState('all')
  const [active, setActive] = useState('all')
  const [project, setProject] = useState('all')
  const [editingTeam, setEditingTeam] = useState(null)
  const [openCreateTeam, setOpenCreateTeam] = useState(false)

  const { summary, rows, options } = useMemo(() => {
    return resolveClubTeamsDomain(entity, {
      q,
      year,
      active,
      project,
    })
  }, [entity, q, year, active, project])

  if (!entity) return null

  const handleCreateClose = () => {
    setOpenCreateTeam(false)
  }

  const handleCreateOpen = () => {
    setOpenCreateTeam(true)
  }

  const handleCreateSaved = () => {
    setOpenCreateTeam(false)
  }

  return (
    <Box sx={modalRootSx}>
      <Box
        sx={{
          position: 'sticky',
          top: -15,
          zIndex: 5,
          borderRadius: 12,
          bgcolor: 'background.body',
        }}
      >
        <ClubTeamsKpi entity={entity} summary={summary} />

        <ClubTeamsFilters
          q={q}
          year={year}
          active={active}
          project={project}
          options={options}
          onChangeQ={setQ}
          onChangeYear={setYear}
          onChangeActive={setActive}
          onChangeProject={setProject}
          onCreateTeam={handleCreateOpen}
        />
      </Box>

      <ClubTeamsTable
        rows={rows}
        onEditTeam={(row) => setEditingTeam(row || null)}
      />

      <EditDrawer
        open={!!editingTeam}
        team={editingTeam}
        onClose={() => setEditingTeam(null)}
        onSaved={() => {}}
      />

      <NewFormDrawer
        open={openCreateTeam}
        onClose={handleCreateClose}
        onSaved={handleCreateSaved}
        context={{ ...context, clubId: entity?.id || '', club: liveClub }}
      />
    </Box>
  )
}
