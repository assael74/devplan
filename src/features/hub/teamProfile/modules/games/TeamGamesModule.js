// teamProfile/modules/games/TeamGamesModule.js
import React, { useMemo, useState } from 'react'
import { Box, Typography, Sheet, Divider, Button, Chip } from '@mui/joy'
import AddRounded from '@mui/icons-material/AddRounded'

import SectionPanel from '../../../sharedProfile/SectionPanel.js'
import EmptyState from '../../../sharedProfile/EmptyState.js'
import { buildFallbackAvatar } from '../../../../../ui/core/avatars/fallbackAvatar.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

import { FiltersDrawer, FiltersTrigger, useFilters } from '../../../../../ui/patterns/filters'
import { gameFilterGroups } from '../../../../../shared/games/filters/gamesFilterGroups.js'
import { gameInitialFilters, gameFilterRules } from '../../../../../shared/games/filters/gameFilters.config.js'

import { resolveTeamGames } from './teamGames.logic.js'
import { useTeamGamesCrud } from './useTeamGamesCrud.js'

import GamesTimeline from '../../../../../ui/domains/games/GamesTimeline.js'
import TeamGameEditModal from './components/TeamGameEditModal.js'

import { teamGamesModuleSx as sx } from './games.sx.js'

export default function TeamGamesModule({ entity, onEntityChange }) {
  const team = entity
  const src = buildFallbackAvatar({ entityType: 'club', id: team?.club?.id, name: team?.club?.clubName })
  const clubAvatarSrc = (team && team.club && team.club.photo) || src

  // --- Domain ---
  const domain = useMemo(() => resolveTeamGames(team), [team])
  const rows = domain?.rows || []
  const summary = domain?.summary
  const hasBase = rows.length > 0

  // --- Filters (global) ---
  const [filtersOpen, setFiltersOpen] = useState(false)
  const { filters, filtered, onChange, onReset, hasActive } = useFilters(rows, gameInitialFilters, gameFilterRules)

  // Partition filtered -> played/upcoming לפי הדומיין (בלי לשכפל לוגיקת זמן)
  const playedIds = useMemo(() => new Set((domain?.playedGames || []).map((x) => x.id)), [domain])
  const upcomingIds = useMemo(() => new Set((domain?.upcomingGames || []).map((x) => x.id)), [domain])

  const played = useMemo(() => (filtered || []).filter((x) => playedIds.has(x.id)), [filtered, playedIds])
  const upcoming = useMemo(() => (filtered || []).filter((x) => upcomingIds.has(x.id)), [filtered, upcomingIds])

  // --- CRUD ---
  const crud = useTeamGamesCrud(team, onEntityChange)

  if (!hasBase) {
    return (
      <SectionPanel>
        <EmptyState title="אין משחקים" desc="לא נמצאו משחקים לקבוצה. ניתן להוסיף משחק חדש." />
        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
          <Button startDecorator={<AddRounded />} onClick={crud.openCreate}>
            הוסף משחק
          </Button>
        </Box>

        <TeamGameEditModal
          open={crud.editOpen}
          mode={crud.editMode}
          row={crud.editRow}
          onClose={crud.closeEdit}
          onSave={crud.onUpsert}
          onDelete={crud.onDelete}
        />
      </SectionPanel>
    )
  }

  return (
    <SectionPanel>
      <Box sx={sx.root}>
        <Sheet variant="soft" sx={sx.kpiSheet}>
          <Box sx={sx.kpiRow}>
            <Box sx={sx.kpiLeft}>
              <Chip size="sm" variant="soft">
                משחקים: {summary?.total ?? rows.length}
              </Chip>
              <Chip size="sm" variant="soft" color="success">
                נצחונות: {summary?.wins ?? 0}
              </Chip>
              <Chip size="sm" variant="soft" color={(summary?.losses ?? 0) ? 'warning' : 'neutral'}>
                הפסדים: {summary?.losses ?? 0}
              </Chip>
              <Chip size="sm" variant="soft">
                נקודות: {summary?.points ?? 0}
              </Chip>
              <Chip size="sm" variant="soft">
                יחס: {(summary?.gf ?? 0)} - {(summary?.ga ?? 0)}
              </Chip>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <FiltersTrigger hasActive={hasActive} onClick={() => setFiltersOpen(true)} label="פילטרים" />
            </Box>
          </Box>
        </Sheet>

        <Divider />

        <Box sx={sx.gamesGrid}>
          <Sheet variant="outlined" sx={sx.panel}>
            <Box sx={sx.panelHeader}>
              <Typography level="title-sm" startDecorator={iconUi({ id: 'games' })}>
                משחקים ששוחקו
              </Typography>
              <Typography level="body-xs" sx={{ opacity: 0.65 }}>
                {played.length}
              </Typography>
            </Box>

            <GamesTimeline
              events={played}
              variant="played"
              clubAvatarSrc={clubAvatarSrc}
              onEdit={crud.openEdit}
              emptyText="אין משחקים ששוחקו לפי הסינון."
            />
          </Sheet>

          <Sheet variant="outlined" sx={sx.panel}>
            <Box sx={sx.panelHeader}>
              <Typography level="title-sm" startDecorator={iconUi({ id: 'calendar' })}>
                משחקים קרובים
              </Typography>
              <Typography level="body-xs" sx={{ opacity: 0.65 }}>
                {upcoming.length}
              </Typography>
            </Box>

            <GamesTimeline
              events={upcoming}
              variant="upcoming"
              clubAvatarSrc={clubAvatarSrc}
              onEdit={crud.openEdit}
              emptyText="אין משחקים קרובים לפי הסינון."
            />
          </Sheet>
        </Box>

        <FiltersDrawer
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          title="פילטר משחקים"
          filters={filters}
          groups={gameFilterGroups}
          onChange={onChange}
          onReset={onReset}
        />

        <TeamGameEditModal
          open={crud.editOpen}
          mode={crud.editMode}
          row={crud.editRow}
          onClose={crud.closeEdit}
          onSave={crud.onUpsert}
          onDelete={crud.onDelete}
        />
      </Box>
    </SectionPanel>
  )
}
