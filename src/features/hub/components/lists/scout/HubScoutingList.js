// src/features/hub/components/lists/scout/HubScoutingList.js

import React, { useState } from 'react'
import { Sheet, List, ListItem, Box, Typography } from '@mui/joy'

import EntityActionsMenu from '../../../sharedProfile/EntityActionsMenu.js'
import ScoutRow from './ScoutRow.js'
import {
  buildScoutingRowVm,
  buildScoutingTitle,
} from './HubScoutList.logic.js'

export default function HubScoutingList({ rows = [], onSelect }) {
  const [selectedId, setSelectedId] = useState(null)

  return (
    <Sheet sx={{ p: 0.75 }}>
      <List sx={{ p: 0, display: 'grid', gap: 0.75 }}>
        {rows.map((row) => {
          const id = row?.id
          const title = buildScoutingTitle(row)
          const rowVm = buildScoutingRowVm(row)

          return (
            <ListItem key={id || title} sx={{ px: 0, py: 0 }}>
              <ScoutRow
                scout={rowVm}
                selected={selectedId === id}
                onSelect={(picked) => {
                  setSelectedId(picked?.id || null)
                  onSelect?.(picked)
                }}
                actions={
                  <Box
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <EntityActionsMenu
                      entityType="scouting"
                      entityId={id}
                      entityName={title}
                      metaCounts={row?.metaCounts || null}
                      disabled={!id}
                      isArchived={row?.active === false}
                    />
                  </Box>
                }
              />
            </ListItem>
          )
        })}

        {!rows.length ? (
          <Box sx={{ p: 2 }}>
            <Typography level="body-sm">אין שחקנים למעקב</Typography>
          </Box>
        ) : null}
      </List>
    </Sheet>
  )
}
