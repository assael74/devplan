// hub/components/HubStaffList.js
import React, { useMemo, useState } from 'react'
import { Sheet, List, ListItem, Box, Typography } from '@mui/joy'
import { STAFF_ROLE_OPTIONS } from '../../../../../shared/roles/roles.constants.js'
import roleImage from '../../../../../ui/core/images/roleImage.png'
import { hubPageSx } from '../../../ui/hubPage.sx'
import EntityActionsMenu from '../../../sharedProfile/EntityActionsMenu.js'

import StaffRow from './StaffRow.js'

const buildMetaMap = () => {
  const m = new Map()
  for (const opt of STAFF_ROLE_OPTIONS) m.set(opt.id, opt)
  return m
}

const buildOrgText = (r) => {
  const clubsArr = Array.isArray(r?.clubs) ? r.clubs.filter(Boolean) : []
  const teamsArr = Array.isArray(r?.teams) ? r.teams.filter(Boolean) : []

  const clubText =
    clubsArr.length === 1
      ? (clubsArr[0]?.clubName || clubsArr[0]?.name || 'מועדון')
      : clubsArr.length > 1
      ? `${clubsArr.length} מועדונים`
      : ''

  const teamText =
    teamsArr.length === 1
      ? (teamsArr[0]?.teamName || teamsArr[0]?.name || 'קבוצה')
      : teamsArr.length > 1
      ? `${teamsArr.length} קבוצות`
      : ''

  return [clubText, teamText].filter(Boolean).join(' • ')
}

export default function HubStaffList({ rows = [], onSelect }) {
  const metaById = useMemo(buildMetaMap, [])
  const [selectedId, setSelectedId] = useState(null)

  return (
    <Sheet sx={hubPageSx.listWrap}>
      <List sx={{ p: 0, display: 'grid', gap: 0.75 }}>
        {rows.map((r) => {
          const id = r?.id
          const title = r?.fullName || 'איש צוות'
          const subline = buildOrgText(r)
          const meta = r?.type ? metaById.get(r.type) : null

          const rowVm = {
            ...r,
            photo: r?.photo || roleImage,
            roleLabel: meta?.labelH || '',
            idIcon: meta?.idIcon || '',
            subline,
          }

          return (
            <ListItem key={id || title} sx={{ px: 0, py: 0 }}>
              <StaffRow
                row={rowVm}
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
            <Typography level="body-sm">אין אנשי צוות להצגה.</Typography>
          </Box>
        ) : null}
      </List>
    </Sheet>
  )
}
