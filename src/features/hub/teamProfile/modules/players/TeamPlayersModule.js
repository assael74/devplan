// teamProfile/modules/players/TeamPlayersModule.js
import React, { useMemo, useState } from 'react'
import { Box, Chip, Avatar, Typography, IconButton, Tooltip, Divider } from '@mui/joy'
import EditRounded from '@mui/icons-material/EditRounded'
import ToggleOnRounded from '@mui/icons-material/ToggleOnRounded'
import PersonRounded from '@mui/icons-material/PersonRounded'

import SectionPanel from '../../../sharedProfile/SectionPanel'
import EmptyState from '../../../sharedProfile/EmptyState'

import { resolveTeamPlayers } from './teamPlayers.logic'
import { useTeamPlayersCrud } from './useTeamPlayersCrud'
import TeamPlayerEditModal from './components/TeamPlayerEditModal'
import TeamPlayerRow from './components/TeamPlayerRow'
import TeamPlayerPositionsModal from './components/TeamPlayerPositionsModal'
import { teamPlayersModuleSx as sx } from './players.sx'

import { FiltersDrawer, FiltersTrigger, useFilters } from '../../../../../ui/patterns/filters'
import { playerFilterGroups } from '../../../../../shared/players/filters/playerFilterGroups'
import { playerFilterRules, playerInitialFilters } from '../../../../../shared/players/filters/playerFilters.config'
import playerImage from '../../../../../ui/core/images/playerImage.jpg'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

import JoyStarRatingStatic from '../../../../../ui/domains/ratings/JoyStarRating'
import EntityImageModal from '../../../../../ui/domains/entityImage/EntityImageModal'
import { uploadImageOnly } from '../../../../../services/firestore/storage/uploadImageOnly.js'

const typeLabel = (t) => (t === 'project' ? 'פרויקט' : 'כללי')
const typeColor = (t) => (t === 'project' ? 'primary' : 'neutral')

export default function TeamPlayersModule({ entity, onEntityChange, onOpenPlayer }) {
  const [imgRow, setImgRow] = useState(null)
  const [openImg, setOpenImg] = useState(false)
  const [rowPhoto, setRowPhoto] = useState('')

  const { rows, summary } = useMemo(() => resolveTeamPlayers(entity), [entity])

  const [filtersOpen, setFiltersOpen] = useState(false)
  const { filters, filtered, onChange, onReset, hasActive } = useFilters(rows, playerInitialFilters, playerFilterRules)

  const crud = useTeamPlayersCrud(entity, onEntityChange)

  return (
    <Box sx={sx.root}>
      {/* KPI */}
      <Box sx={sx.kpiRow}>
        <Box sx={sx.kpiLeft}>
          <Chip startDecorator={iconUi({ id: 'team' })}>שחקנים: {summary?.total ?? 0}</Chip>
          <Chip startDecorator={iconUi({ id: 'active' })} color="success">
            פעילים: {summary?.active ?? 0}
          </Chip>
          <Chip startDecorator={iconUi({ id: 'notActive' })} color="danger">
            לא פעילים: {summary?.nonActive ?? 0}
          </Chip>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <FiltersTrigger hasActive={hasActive} onClick={() => setFiltersOpen(true)} label="פילטרים" />
        </Box>

        <FiltersDrawer
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          title="פילטר שחקנים"
          filters={filters}
          groups={playerFilterGroups}
          onChange={onChange}
          onReset={onReset}
        />
      </Box>

      <SectionPanel title="שחקנים">
        {filtered.length === 0 ? (
          <EmptyState title="אין שחקנים להצגה" subtitle="בדוק פילטרים או הוסף שחקן חדש" />
        ) : (
          <Box sx={sx.list}>
            {filtered.map((r) => (
              <TeamPlayerRow
                key={r.id}
                r={r}
                sx={sx}
                crud={crud}
                onAvatarClick={(row) => {
                  setImgRow(row)
                  setRowPhoto(row.photo || '')
                  setOpenImg(true)
                }}
              />
            ))}
          </Box>
        )}
      </SectionPanel>

      <TeamPlayerEditModal
        open={crud.editOpen}
        mode={crud.editMode}
        row={crud.editRow}
        onClose={crud.closeEdit}
        onSave={crud.upsert}
        onDelete={crud.remove}
        pending={crud.pending}
      />

      <TeamPlayerPositionsModal
        open={crud.posOpen}
        row={crud.posRow}
        onClose={crud.closePositions}
        onSave={crud.upsert}
        pending={crud.pending}
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
          const idx = filtered.findIndex((x) => x.id === imgRow?.id)
          if (idx !== -1) {
            filtered[idx].photo = next
          }
        }}
      />

    </Box>
  )
}
