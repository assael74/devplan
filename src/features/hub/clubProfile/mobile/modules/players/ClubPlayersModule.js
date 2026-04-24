// clubProfile/mobile/modules/players/ClubPlayersModule.js

import React, { useEffect, useMemo, useState } from 'react'
import { Box } from '@mui/joy'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'
import EmptyState from '../../../../sharedProfile/EmptyState.js'

import ClubPlayersToolbar from './components/toolbar/ClubPlayersToolbar.js'
import ClubPlayersList from './components/ClubPlayersList.js'
import ClubPlayersInsightsDrawer from './components/insightsDrawer/ClubPlayersInsightsDrawer.js'

import EntityImageModal from '../../../../../../ui/domains/entityImage/EntityImageModal.js'
import { uploadImageOnly } from '../../../../../../services/firestore/storage/uploadImageOnly.js'

import {
  CLUB_PLAYERS_DEFAULT_FILTERS,
  filterClubPlayersRows,
  resolveClubPlayers,
  sortClubPlayersRows,
} from '../../../sharedLogic/players/index.js'

import { profileSx as sx } from './../../sx/profile.sx'

export default function ClubPlayersModule({
  entity,
  onOpenPlayer,
  context,
  playersInsightsRequest = 0,
}) {
  const liveClub = useMemo(() => {
    const clubs = Array.isArray(context?.clubs) ? context.clubs : []
    return clubs.find((club) => club?.id === entity?.id) || entity || null
  }, [context?.clubs, entity])

  const [imgRow, setImgRow] = useState(null)
  const [openImg, setOpenImg] = useState(false)
  const [rowPhoto, setRowPhoto] = useState('')
  const [insightsOpen, setInsightsOpen] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState(null)

  const [filters, setFilters] = useState(CLUB_PLAYERS_DEFAULT_FILTERS)

  const [sort, setSort] = useState({
    by: 'level',
    direction: 'desc',
  })

  const { rows, summary } = useMemo(() => {
    return resolveClubPlayers(liveClub)
  }, [liveClub])

  const filteredRows = useMemo(() => {
    const filtered = filterClubPlayersRows(rows, filters)
    return sortClubPlayersRows(filtered, sort)
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
    setFilters(CLUB_PLAYERS_DEFAULT_FILTERS)
  }

  return (
    <SectionPanelMobile>
      <Box sx={sx.moduleRoot}>
        <ClubPlayersToolbar
          summary={summary}
          filters={filters}
          totalCount={rows.length}
          filteredCount={filteredRows.length}
          onChangeSearch={(value) => handleChangeFilters({ search: value || '' })}
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
          onChangeTeamId={(value) =>
            handleChangeFilters({ teamId: value || '' })
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

      {!filteredRows.length ? (
        <EmptyState
          title="אין שחקנים להצגה"
          subtitle="בדוק את הפילטרים או אפס את הסינון"
        />
      ) : (
        <ClubPlayersList
          rows={filteredRows}
          onOpenPlayer={onOpenPlayer}
          onAvatarClick={(row) => {
            setImgRow(row)
            setRowPhoto(row?.photo || '')
            setOpenImg(true)
          }}
          onEditPlayer={(row) => setEditingPlayer(row?.player || row || null)}
        />
      )}

      <ClubPlayersInsightsDrawer
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        rows={filteredRows}
        summary={summary}
        entity={liveClub}
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
