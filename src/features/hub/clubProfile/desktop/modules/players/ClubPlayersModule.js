// clubProfile/desktop/modules/players/ClubPlayersModule.js

import React, { useMemo, useState, useEffect } from 'react'
import { Box } from '@mui/joy'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'
import EmptyState from '../../../../sharedProfile/EmptyState.js'

import {
  CLUB_PLAYERS_DEFAULT_FILTERS,
  filterClubPlayersRows,
  resolveClubPlayers,
  sortClubPlayersRows
} from '../../../sharedLogic/players/index.js'

import ClubPlayersToolbar from './components/toolbar/ClubPlayersToolbar.js'
import ClubPlayersList from './components/ClubPlayersList.js'
import ClubPlayersInsightsDrawer from './components/insightsDrawer/ClubPlayersInsightsDrawer.js'

import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

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

  const [insightsOpen, setInsightsOpen] = useState(false)
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
            onChangeSearch={(value) =>
              handleChangeFilters({ search: value })
            }
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
            onChangeSortDirection={(value) => setSort((prev) => ({ ...prev, direction: value }))}
          />
        </Box>

        {!filteredRows.length ? (
          <EmptyState
            title="אין שחקנים להצגה"
            subtitle="נסה לשנות פילטרים או לאפס את החיפוש"
          />
        ) : (
          <ClubPlayersList rows={filteredRows} />
        )}
      </SectionPanel>

      <ClubPlayersInsightsDrawer
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        rows={filteredRows}
        summary={summary}
        entity={liveClub}
      />
    </>
  )
}
