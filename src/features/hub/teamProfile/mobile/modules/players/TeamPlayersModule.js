// teamProfile/mobile/modules/players/TeamPlayersModule.js

import React, { useEffect, useMemo, useState } from 'react'
import { Box } from '@mui/joy'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'
import EmptyState from '../../../../sharedProfile/EmptyState.js'

import TeamPlayersToolbar from './components/toolbar/TeamPlayersToolbar.js'
import TeamPlayersList from './components/TeamPlayersList.js'

import TeamPlayerQuickEditDrawer from './components/drawer/TeamPlayerQuickEditDrawer.js'
import TeamPlayerPositionsDrawer from './components/drawer/TeamPlayerPositionsModal.js'
import TeamPlayersInsightsDrawer from './components/insightsDrawer/TeamPlayersInsightsDrawer.js'

import EntityImageModal from '../../../../../../ui/domains/entityImage/EntityImageModal.js'
import { uploadImageOnly } from '../../../../../../services/firestore/storage/uploadImageOnly.js'

import {
  resolveTeamPlayers,
  filterTeamPlayersRows,
  sortTeamPlayersRows,
} from '../../../sharedLogic/players'

import { profileSx as sx } from './../../sx/profile.sx'

const LEAGUE_GAME_TYPE = 'league'

const getGameObject = (row = {}) => {
  return row?.game || row
}

const isLeagueGame = (row = {}) => {
  const game = getGameObject(row)
  const type = String(row?.type || game?.type || '').toLowerCase()

  return type === LEAGUE_GAME_TYPE
}

const getTeamGamesRows = (team) => {
  const rows = Array.isArray(team?.teamGames) ? team.teamGames : []

  return rows.filter(isLeagueGame)
}

export default function TeamPlayersModule({
  entity,
  onEntityChange,
  onOpenPlayer,
  context,
  playersInsightsOpen,
  setPlayersInsightsOpen,
  playersInsightsRequest = 0,
}) {
  const liveTeam = useMemo(() => {
    const teams = Array.isArray(context?.teams) ? context.teams : []
    return teams.find((t) => t?.id === entity?.id) || entity || null
  }, [context?.teams, entity])

  const calculationGames = useMemo(() => {
    return getTeamGamesRows(liveTeam)
  }, [liveTeam])

  const [imgRow, setImgRow] = useState(null)
  const [openImg, setOpenImg] = useState(false)
  const [rowPhoto, setRowPhoto] = useState('')
  const [insightsOpen, setInsightsOpen] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [editingPosition, setEditingPosition] = useState(null)

  const [filters, setFilters] = useState({
    search: '',
    onlyActive: false,
    squadRole: '',
    projectStatus: '',
    positionCode: '',
    generalPositionKey: '',
  })

  const [sort, setSort] = useState({
    by: 'level',
    direction: 'desc',
  })

  const { rows, summary } = useMemo(() => {
    return resolveTeamPlayers({
      team: liveTeam,
      games: calculationGames,
    })
  }, [liveTeam, calculationGames])

  const filteredRows = useMemo(() => {
    const filtered = filterTeamPlayersRows(rows, filters)
    return sortTeamPlayersRows(filtered, sort)
  }, [rows, filters, sort])

  useEffect(() => {
    if (playersInsightsRequest > 0) {
      setInsightsOpen(true)
    }
  }, [playersInsightsRequest])

  const handleChangeFilters = (patch) => {
    setFilters((prev) => ({ ...prev, ...patch }))
  }

  const handleResetFilters = () => {
    setFilters({
      search: '',
      onlyActive: false,
      squadRole: '',
      projectStatus: '',
      positionCode: '',
      generalPositionKey: '',
    })
  }

  return (
    <SectionPanelMobile>
      <Box sx={sx.moduleRoot}>
        <TeamPlayersToolbar
          summary={summary}
          filters={filters}
          totalCount={rows.length}
          filteredCount={filteredRows.length}
          onChangeSearch={(value) => handleChangeFilters({ search: value })}
          onToggleOnlyActive={() =>
            handleChangeFilters({ onlyActive: !filters.onlyActive })
          }
          onChangeSquadRole={(value) =>
            handleChangeFilters({ squadRole: value || '' })
          }
          onChangeProjectStatus={(value) =>
            handleChangeFilters({ projectStatus: value || '' })
          }
          onChangePositionCode={(value) =>
            handleChangeFilters({ positionCode: value || '' })
          }
          onChangeGeneralPositionKey={(value) =>
            handleChangeFilters({ generalPositionKey: value || '' })
          }
          onResetFilters={handleResetFilters}
          sortBy={sort.by}
          sortDirection={sort.direction}
          onChangeSortBy={(value) => setSort((prev) => ({ ...prev, by: value }))}
          onChangeSortDirection={(value) =>
            setSort((prev) => ({ ...prev, direction: value }))
          }
        />
      </Box>

      {filteredRows.length === 0 ? (
        <EmptyState
          title="אין שחקנים להצגה"
          subtitle="בדוק את הפילטרים או אפס את הסינון"
        />
      ) : (
        <TeamPlayersList
          rows={filteredRows}
          onOpenPlayer={onOpenPlayer}
          onAvatarClick={(row) => {
            setImgRow(row)
            setRowPhoto(row?.photo || '')
            setOpenImg(true)
          }}
          onEditPlayer={(row) => setEditingPlayer(row?.player || row || null)}
          onEditPosition={(row) => setEditingPosition(row?.player || row || null)}
        />
      )}

      <TeamPlayerQuickEditDrawer
        open={!!editingPlayer}
        player={editingPlayer}
        onClose={() => setEditingPlayer(null)}
        onSaved={() => {}}
      />

      <TeamPlayerPositionsDrawer
        open={!!editingPosition}
        player={editingPosition}
        onClose={() => setEditingPosition(null)}
        onSaved={() => {}}
      />

      <TeamPlayersInsightsDrawer
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        rows={rows}
        summary={summary}
        entity={liveTeam}
      />

      <EntityImageModal
        open={openImg}
        onClose={() => setOpenImg(false)}
        entityType="players"
        id={imgRow?.id}
        entityName={imgRow?.fullName}
        currentPhotoUrl={rowPhoto}
        uploadImageOnly={uploadImageOnly}
        onAfterSave={(url) => {
          const next = `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`
          setRowPhoto(next)
        }}
      />
    </SectionPanelMobile>
  )
}
