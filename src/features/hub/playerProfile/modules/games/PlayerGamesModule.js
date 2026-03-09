import React, { useMemo, useState } from 'react'
import { Box, Typography, Sheet, Divider, Chip } from '@mui/joy'

import SectionPanel from '../../../sharedProfile/SectionPanel.js'
import EmptyState from '../../../sharedProfile/EmptyState.js'

import { buildFallbackAvatar } from '../../../../../ui/core/avatars/fallbackAvatar.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

import { FiltersDrawer, FiltersTrigger } from '../../../../../ui/patterns/filters'
import { gameFilterGroups } from '../../../../../shared/games/filters/gamesFilterGroups.js'
import { gameInitialFilters, gameFilterRules } from '../../../../../shared/games/filters/gameFilters.config.js'
import { useFilters } from '../../../../../ui/patterns/filters'

import GamesTimeline from '../../../../../ui/domains/games/GamesTimeline.js'
import PlayerGameEditModal from './components/PlayerGameEditModal.js'
import { playerGamesModuleSx as sx } from './games.sx.js'

import { resolvePlayerGames } from './playerGames.logic.js'
import { usePlayerGamesCrud } from './usePlayerGamesCrud.js'

export default function PlayerGamesModule({ entity, onEntityChange }) {
  const player = entity
  const src = buildFallbackAvatar({ entityType: 'club', id: player?.club?.id, name: player?.club?.clubName })
  const clubAvatarSrc = (player && player.club && player.club.photo) || src

  // --- Domain ---
  const domain = useMemo(() => resolvePlayerGames(player), [player])
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
  const crud = usePlayerGamesCrud(player, onEntityChange)

  if (!hasBase) {
    return (
      <SectionPanel>
        <EmptyState title="אין משחקים" desc="לא נמצאו משחקים לקבוצה. ניתן להוסיף משחק חדש." />

        <PlayerGameEditModal
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
    <Box sx={sx.root}>
      <Sheet variant="soft" sx={sx.kpiSheet}>
        <Box sx={sx.kpiRow}>
          <Box sx={sx.kpiLeft}>
            <Chip size="sm" variant="soft">
              משחקים: {summary.total}
            </Chip>
            <Chip size="sm" variant="soft" color="success">
              נצחונות: {summary.wins}
            </Chip>
            <Chip size="sm" variant="soft" color={summary.losses ? 'warning' : 'neutral'}>
              הפסדים: {summary.losses}
            </Chip>
            <Chip size="sm" variant="soft">
              תיקו: {summary.draws}
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

      <PlayerGameEditModal
        open={crud.editOpen}
        mode={crud.editMode}
        row={crud.editRow}
        onClose={crud.closeEdit}
        onSave={crud.onUpsert}
        onDelete={crud.onDelete}
      />
    </Box>
  )
}
