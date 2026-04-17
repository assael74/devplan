// clubProfile/desktop/modules/players/ClubPlayersModule.js

import React, { useMemo, useState } from 'react'
import { Box } from '@mui/joy'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'
import EmptyState from '../../../../sharedProfile/EmptyState.js'

import { resolveClubPlayers } from './logic/clubPlayers.logic.js'
import {
  CLUB_PLAYERS_DEFAULT_FILTERS,
  applyClubPlayersFilters,
} from './logic/clubPlayers.filters.js'

import ClubPlayersToolbar from './components/ClubPlayersToolbar.js'
import ClubPlayersList from './components/ClubPlayersList.js'
import ClubPlayersInsightsDrawer from './components/insightsDrawer/ClubPlayersInsightsDrawer.js'

import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export default function ClubPlayersModule({
  entity,
  onOpenPlayer,
  context,
}) {
  const liveClub = useMemo(() => {
    const clubs = Array.isArray(context?.clubs) ? context.clubs : []
    return clubs.find((club) => club?.id === entity?.id) || entity || null
  }, [context?.clubs, entity])

  const [filters, setFilters] = useState(CLUB_PLAYERS_DEFAULT_FILTERS)
  const [insightsOpen, setInsightsOpen] = useState(false)

  const { rows, summary } = useMemo(() => {
    return resolveClubPlayers(liveClub)
  }, [liveClub])

  const filteredRows = useMemo(() => {
    return applyClubPlayersFilters(rows, filters)
  }, [rows, filters])

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
          <ClubPlayersToolbar
            summary={summary}
            filters={filters}
            filteredCount={filteredRows.length}
            onOpenInsights={() => setInsightsOpen(true)}
            onChangeSearch={(value) =>
              setFilters((prev) => ({ ...prev, search: value || '' }))
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
            onChangePositionLayer={(value) =>
              setFilters((prev) => ({ ...prev, positionLayer: value || '' }))
            }
            onResetFilters={() => setFilters(CLUB_PLAYERS_DEFAULT_FILTERS)}
          />
        </Box>

        {!filteredRows.length ? (
          <EmptyState
            title="אין שחקנים להצגה"
            subtitle="נסה לשנות פילטרים או לאפס את החיפוש"
          />
        ) : (
          <ClubPlayersList
            rows={filteredRows}
          />
        )}
      </SectionPanel>

      <ClubPlayersInsightsDrawer
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        rows={rows}
        summary={summary}
        entity={liveClub}
      />
    </>
  )
}
