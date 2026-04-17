// src/features/hub/components/lists/staff/HubStaffList.js

import React, { useMemo, useState } from 'react'
import { Sheet, List, ListItem, Box, Typography } from '@mui/joy'

import EntityActionsMenu from '../../../sharedProfile/EntityActionsMenu.js'
import StaffRow from './StaffRow.js'
import {
  buildStaffMetaMap,
  buildStaffRowVm,
} from './HubStaffList.logic.js'

export default function HubStaffList({ rows = [], onSelect }) {
  const metaById = useMemo(buildStaffMetaMap, [])
  const [selectedId, setSelectedId] = useState(null)

  return (
    <Sheet sx={{ p: 0.75 }}>
      <List sx={{ p: 0, display: 'grid', gap: 0.75 }}>
        {rows.map((row) => {
          const id = row?.id
          const title = row?.fullName || 'איש צוות'
          const rowVm = buildStaffRowVm(row, metaById)

          return (
            <ListItem key={id || title} sx={{ px: 0, py: 0 }}>
              <StaffRow
                staff={rowVm}
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
                      entityType="role"
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
            <Typography level="body-sm">אין אנשי צוות להצגה.</Typography>
          </Box>
        ) : null}
      </List>
    </Sheet>
  )
}
