// teamProfile/desktop/modules/players/TeamPlayersModule.js

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Box } from '@mui/joy'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'
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
  mergeRowsWithPerformance,
  mergeSummaryWithPerformanceBuckets,
  scheduleIdle,
  cancelIdle,
} from '../../../sharedLogic/players'

import {
  useTeamPlayersInsightsModel,
} from '../../../sharedUi/insights/teamPlayers/useTeamPlayersInsightsModel.js'

import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

const performanceScopeInitial = {
  mode: 'season',
  limit: null,
  fromGameKey: null,
  toGameKey: null,
}

const emptyFilters = {
  search: '',
  onlyActive: false,
  squadRole: '',
  projectStatus: '',
  positionCode: '',
  generalPositionKey: '',
  performanceProfile: '',
}

const getInsightsStatus = ({ rows, enabled, model }) => {
  if (!rows.length) return 'empty'
  if (!enabled || model?.isBuilding !== false) return 'loading'

  return 'ready'
}

export default function TeamPlayersModule({
  entity,
  onEntityChange,
  onOpenPlayer,
  context,
  profileData,
  playersInsightsRequest = 0,
  onPlayersInsightsStatusChange,
}) {
  const initialInsightsRequestRef = useRef(playersInsightsRequest)
  const didMountRef = useRef(false)
  const lastInsightsStatusRef = useRef('')

  const liveTeam = useMemo(() => {
    const teams = Array.isArray(context?.teams) ? context.teams : []
    return teams.find(t => t?.id === entity?.id) || entity || null
  }, [context?.teams, entity])

  const calculationGames = useMemo(() => {
    return profileData?.games?.playedLeagueGames || []
  }, [profileData?.games?.playedLeagueGames])

  const [imgRow, setImgRow] = useState(null)
  const [openImg, setOpenImg] = useState(false)
  const [rowPhoto, setRowPhoto] = useState('')
  const [insightsOpen, setInsightsOpen] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [editingPosition, setEditingPosition] = useState(null)
  const [filters, setFilters] = useState(emptyFilters)
  const [insightsEnabled, setInsightsEnabled] = useState(false)

  const [sort, setSort] = useState({
    by: 'level',
    direction: 'desc',
  })

  const rows = profileData?.players?.rows || []
  const summary = profileData?.players?.summary || {}

  useEffect(() => {
    setInsightsEnabled(false)

    if (!liveTeam || !rows.length) return undefined

    const handle = scheduleIdle(() => {
      setInsightsEnabled(true)
    })

    return () => {
      cancelIdle(handle)
    }
  }, [liveTeam?.id, rows.length])

  const insightsModel = useTeamPlayersInsightsModel({
    rows,
    summary,
    team: liveTeam,
    enabled: insightsEnabled,
    defer: false,
    performanceScope: performanceScopeInitial,
  })

  const playersInsightsStatus = getInsightsStatus({
    rows,
    enabled: insightsEnabled,
    model: insightsModel,
  })

  const insightsReady = playersInsightsStatus === 'ready'

  useEffect(() => {
    if (typeof onPlayersInsightsStatusChange !== 'function') return
    if (lastInsightsStatusRef.current === playersInsightsStatus) return

    lastInsightsStatusRef.current = playersInsightsStatus
    onPlayersInsightsStatusChange(playersInsightsStatus)
  }, [playersInsightsStatus, onPlayersInsightsStatusChange])

  const rowsWithPerformance = useMemo(() => {
    return mergeRowsWithPerformance({
      rows,
      performanceRows: insightsModel?.playerPerformanceRows,
    })
  }, [rows, insightsModel?.playerPerformanceRows])

  const summaryWithPerformance = useMemo(() => {
    return mergeSummaryWithPerformanceBuckets({
      summary,
      rows: rowsWithPerformance,
    })
  }, [summary, rowsWithPerformance])

  const filteredRows = useMemo(() => {
    const filtered = filterTeamPlayersRows(rowsWithPerformance, filters)
    return sortTeamPlayersRows(filtered, sort)
  }, [rowsWithPerformance, filters, sort])

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }

    if (
      playersInsightsRequest > 0 &&
      playersInsightsRequest !== initialInsightsRequestRef.current &&
      insightsReady
    ) {
      setInsightsOpen(true)
    }
  }, [playersInsightsRequest, insightsReady])

  const handleChangeFilters = patch => {
    setFilters(prev => ({ ...prev, ...patch }))
  }

  const handleResetFilters = () => {
    setFilters(emptyFilters)
  }

  return (
    <SectionPanel>
      <Box
        sx={{
          position: 'sticky',
          top: -8,
          zIndex: 5,
          display: 'grid',
          gap: 1,
          borderRadius: 12,
          bgcolor: 'background.body',
          mb: 0.5,
          boxShadow: `inset 0 0 1px 2px ${c.accent}33`,
        }}
      >
        <TeamPlayersToolbar
          filters={filters}
          summary={summaryWithPerformance}
          filteredCount={filteredRows.length}
          totalCount={rowsWithPerformance.length}
          onChangeSearch={value =>
            handleChangeFilters({ search: value })
          }
          onToggleOnlyActive={() =>
            handleChangeFilters({ onlyActive: !filters.onlyActive })
          }
          onChangeSquadRole={value =>
            handleChangeFilters({ squadRole: value || '' })
          }
          onChangeProjectStatus={value =>
            handleChangeFilters({ projectStatus: value || '' })
          }
          onChangePositionCode={value =>
            handleChangeFilters({ positionCode: value || '' })
          }
          onChangeGeneralPositionKey={value =>
            handleChangeFilters({ generalPositionKey: value || '' })
          }
          onChangePerformanceProfile={value =>
            handleChangeFilters({ performanceProfile: value || '' })
          }
          onResetFilters={handleResetFilters}
          sortBy={sort.by}
          sortDirection={sort.direction}
          onChangeSortBy={value => setSort(prev => ({ ...prev, by: value }))}
          onChangeSortDirection={value =>
            setSort(prev => ({ ...prev, direction: value }))
          }
        />
      </Box>

      {filteredRows.length === 0 ? (
        <EmptyState
          title="אין שחקנים להצגה"
          subtitle="בדוק פילטרים או הוסף שחקן חדש"
        />
      ) : (
        <TeamPlayersList
          rows={filteredRows}
          loaded={insightsReady}
          onOpenPlayer={onOpenPlayer}
          onAvatarClick={row => {
            setImgRow(row)
            setRowPhoto(row?.photo || '')
            setOpenImg(true)
          }}
          onEditPlayer={row => setEditingPlayer(row?.player || null)}
          onEditPosition={row => setEditingPosition(row?.player || null)}
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
        rows={rowsWithPerformance}
        summary={summaryWithPerformance}
        entity={liveTeam}
        model={insightsModel}
        resetKey={playersInsightsRequest}
      />

      <EntityImageModal
        open={openImg}
        onClose={() => setOpenImg(false)}
        entityType="players"
        id={imgRow?.id}
        entityName={imgRow?.playerFullName}
        currentPhotoUrl={rowPhoto}
        uploadImageOnly={uploadImageOnly}
        onAfterSave={url => {
          const next = `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`
          setRowPhoto(next)
        }}
      />
    </SectionPanel>
  )
}
