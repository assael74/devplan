// teamProfile/modules/players/TeamPlayersModule.js

import React, { useMemo, useState } from 'react'
import { Box } from '@mui/joy'

import SectionPanel from '../../../sharedProfile/SectionPanel.js'
import EmptyState from '../../../sharedProfile/EmptyState.js'

import { resolveTeamPlayers } from './logic/teamPlayers.logic.js'
import { useTeamPlayersCrud } from './logic/useTeamPlayersCrud.js'

import TeamPlayersHeaderStats from './components/TeamPlayersHeaderStats.js'
import TeamPlayersToolbar from './components/TeamPlayersToolbar.js'
import TeamPlayersList from './components/TeamPlayersList.js'

import TeamPlayerQuickEditDrawer from './components/drawer/TeamPlayerQuickEditDrawer.js'
import TeamPlayerPositionsDrawer from './components/drawer/TeamPlayerPositionsModal.js'

import TeamPlayersInsightsDrawer from './components/insightsDrawer/TeamPlayersInsightsDrawer.js'

import EntityImageModal from '../../../../../ui/domains/entityImage/EntityImageModal.js'
import { uploadImageOnly } from '../../../../../services/firestore/storage/uploadImageOnly.js'

import { getEntityColors } from '../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

const safe = (v) => (v == null ? '' : String(v))
const norm = (v) => safe(v).trim().toLowerCase()

export default function TeamPlayersModule({ entity, onEntityChange, onOpenPlayer }) {
  const [imgRow, setImgRow] = useState(null)
  const [openImg, setOpenImg] = useState(false)
  const [rowPhoto, setRowPhoto] = useState('')
  const [insightsOpen, setInsightsOpen] = useState(false)

  const [filters, setFilters] = useState({
    search: '',
    onlyActive: false,
    onlyKey: false,
    onlyProject: false,
    positionLayer: '',
  })

  const { rows, summary } = useMemo(() => resolveTeamPlayers(entity), [entity])
  const crud = useTeamPlayersCrud(entity, onEntityChange)

  const filteredRows = useMemo(() => {
    let next = Array.isArray(rows) ? [...rows] : []

    const q = norm(filters.search)
    if (q) {
      next = next.filter((row) => {
        const text = norm(row?.searchText)
        return text.includes(q)
      })
    }

    if (filters.onlyActive) {
      next = next.filter((row) => row?.active === true)
    }

    if (filters.onlyKey) {
      next = next.filter((row) => row?.isKey === true)
    }

    if (filters.onlyProject) {
      next = next.filter((row) => row?.type === 'project')
    }

    if (filters.positionLayer) {
      next = next.filter((row) => row?.generalPositionKey === filters.positionLayer)
    }

    return next
  }, [rows, filters])

  const onChangePositionLayer = (value) => {
    setFilters((prev) => ({ ...prev, positionLayer: value || '' }))
  }

  const handleResetFilters = () => {
    setFilters({
      search: '',
      onlyActive: false,
      onlyKey: false,
      onlyProject: false,
      positionLayer: '',
    })
  }

  return (
    <>
      <SectionPanel>
        <Box
          sx={{
            position: 'sticky',
            top: -6,
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
            summary={summary}
            filters={filters}
            filteredCount={filteredRows.length}
            onOpenInsights={() => setInsightsOpen(true)}
            onChangeSearch={(value) =>
              setFilters((prev) => ({ ...prev, search: value }))
            }
            onToggleOnlyActive={() =>
              setFilters((prev) => ({ ...prev, onlyActive: !prev.onlyActive }))
            }
            onToggleOnlyKey={() =>
              setFilters((prev) => ({ ...prev, onlyKey: !prev.onlyKey }))
            }
            onToggleOnlyProject={() =>
              setFilters((prev) => ({ ...prev, onlyProject: !prev.onlyProject }))
            }
            onChangePositionLayer={onChangePositionLayer}
            onResetFilters={handleResetFilters}
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
            onOpenPlayer={onOpenPlayer}
            onAvatarClick={(row) => {
              setImgRow(row)
              setRowPhoto(row.photo || '')
              setOpenImg(true)
            }}
            onOpenEdit={crud.openEdit}
            onOpenPositions={crud.openPositions}
            onToggleActive={crud.toggleActive}
          />
        )}
      </SectionPanel>

      <TeamPlayerQuickEditDrawer
        open={crud.editOpen}
        row={crud.editRow}
        pending={crud.pending}
        onClose={crud.closeEdit}
        onSave={crud.upsert}
        onRemove={crud.remove}
      />

      <TeamPlayerPositionsDrawer
        open={crud.posOpen}
        row={crud.posRow}
        pending={crud.pending}
        onClose={crud.closePositions}
        onSave={crud.upsert}
      />

      <TeamPlayersInsightsDrawer
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        rows={rows}
        summary={summary}
        entity={entity}
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
    </>
  )
}
