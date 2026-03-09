// hub/components/HubStaffList.js
import React, { useMemo, useState } from 'react'
import { Sheet, List, ListItem, Box, Typography } from '@mui/joy'
import { hubPageSx } from '../../../ui/hubPage.sx'

import playerImage from '../../../../../ui/core/images/playerImage.jpg'

import EntityActionsMenu from '../../../sharedProfile/EntityActionsMenu.js'

import ScoutRow from './ScoutRow.js'

export default function HubScoutingList({ rows = [], onSelect }) {
  const [selectedId, setSelectedId] = useState(null)

  return (
    <Sheet sx={hubPageSx.listWrap}>
      <List sx={{ p: 0, display: 'grid', gap: 0.75 }}>
        {rows.map((r) => {
          const id = r?.id
          const title = r?.playerName || 'שחקן למעקב'
          const subline = `${r?.clubName} * ${r?.teamName}` || 'שם מועדון וקבוצה'
          const photo = r?.photo || playerImage

          const rowVm = {
            ...r,
            title,
            photo,
            idIcon: 'scouting',
            subline,
          }

          return (
            <ListItem key={id || title} sx={{ px: 0, py: 0 }}>
              <ScoutRow
                row={rowVm}
                selected={selectedId === id}
                onSelect={(picked) => {
                  setSelectedId(picked?.id || null)
                  onSelect(picked)
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
                      metaCounts={r?.metaCounts || null}
                      disabled={!id}
                      isArchived={r?.active === false}
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
