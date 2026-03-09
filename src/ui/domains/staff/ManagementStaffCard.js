import React, { useMemo, useState, useCallback } from 'react'
import { Sheet } from '@mui/joy'

import StaffToolbar from './ui/StaffToolbar.js'
import StaffList from './ui/StaffList.js'
import StaffPickerModal from './ui/StaffPickerModal.js'
import StaffFiltersBar from './ui/StaffFiltersBar.js'
import StaffSummaryBar from './ui/StaffSummaryBar.js'

import { useDynamicUpdateAction } from '../entityActions/useDynamicUpdateAction.js'

import {
  buildMembershipPatch,
  createDefaultStaffFilters,
  filterStaffRows,
  buildStaffSummary,
  buildStaffRoleOptions,
  STAFF_CONTACT_OPTIONS,
} from './logic/staff.logic.js'

import { buildStaffRowsFromRoles, buildExcludeIds } from './logic/staff.selectors.js'
import { staffSx } from './ui/staff.sx.js'

export default function ManagementStaffCard({
  title = 'צוות מקצועי',
  subtitle,
  teamId,
  clubId,
  roles = [],
  disabled = false,
  slotProps,
  context,
  compact = false,
}) {

  const [open, setOpen] = useState(false)

  const [filters, setFilters] = useState(createDefaultStaffFilters())

  const staffRows = useMemo(
    () => buildStaffRowsFromRoles({ roles, teamId, clubId }),
    [roles, teamId, clubId]
  )

  const filteredRows = useMemo(
    () => filterStaffRows(staffRows, filters),
    [staffRows, filters]
  )

  const summary = useMemo(
    () => buildStaffSummary(staffRows),
    [staffRows]
  )

  const roleOptions = useMemo(
    () => buildStaffRoleOptions(staffRows),
    [staffRows]
  )

  const excludeIds = useMemo(
    () => buildExcludeIds(staffRows),
    [staffRows]
  )

  const { runUpdate, pending } = useDynamicUpdateAction({
    routerEntityType: 'roles',
    snackEntityType: 'role',
  })

  const handleFiltersChange = useCallback((patch) => {
    setFilters((prev) => ({ ...prev, ...patch }))
  }, [])

  const handleOpen = useCallback(() => {
    if (disabled || pending) return
    setOpen(true)
  }, [disabled, pending])

  const handleClose = useCallback(() => {
    if (pending) return
    setOpen(false)
  }, [pending])

  const handleAdd = useCallback(
    async (role) => {

      if (!role?.id) return

      const patch = buildMembershipPatch(role, { teamId, clubId }, 'add')

      if (!Object.keys(patch).length) return

      await runUpdate({
        id: role.id,
        entityName: role.fullName || 'איש צוות',
        fieldsPatch: patch,
        meta: { section: 'staff:add', context },
      })

      setOpen(false)

    },
    [runUpdate, teamId, clubId, context]
  )

  const handleRemove = useCallback(
    async (role) => {

      if (!role?.id) return

      const patch = buildMembershipPatch(role, { teamId, clubId }, 'remove')

      if (!Object.keys(patch).length) return

      await runUpdate({
        id: role.id,
        entityName: role.fullName || 'איש צוות',
        fieldsPatch: patch,
        meta: { section: 'staff:remove', context },
      })

    },
    [runUpdate, teamId, clubId, context]
  )

  return (
    <>
      <Sheet variant="plain" sx={[staffSx.card(compact), slotProps?.rootSx]}>

        <StaffToolbar
          title={title}
          subtitle={subtitle || `${staffRows.length} אנשי צוות`}
          count={staffRows.length}
          disabled={disabled}
          pending={pending}
          onAdd={handleOpen}
          compact={compact}
          sx={slotProps?.headerSx}
        />

        <StaffSummaryBar summary={summary} />

        {!compact && (
          <StaffFiltersBar
            filters={filters}
            onChange={handleFiltersChange}
            roleOptions={roleOptions}
            compact={compact}
            contactOptions={STAFF_CONTACT_OPTIONS}
            resultCount={filteredRows.length}
            totalCount={staffRows.length}
          />
        )}        

        <Sheet
          variant="plain"
          className="dpScrollThin"
          sx={[staffSx.listShell(compact), slotProps?.listSx]}
        >

          <StaffList
            value={filteredRows}
            disabled={disabled}
            pending={pending}
            onRemove={handleRemove}
            compact={compact}
          />

        </Sheet>

      </Sheet>

      <StaffPickerModal
        open={open}
        onClose={handleClose}
        roles={roles}
        excludeIds={excludeIds}
        onSelect={handleAdd}
        loading={pending}
        disabled={disabled}
        title="הוספת איש צוות"
        subtitle={teamId ? 'שייך איש צוות לקבוצה' : 'שייך איש צוות למועדון'}
      />
    </>
  )
}
