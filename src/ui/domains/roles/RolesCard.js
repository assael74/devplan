// src/ui/domains/roles/RolesCard.js

import React, { useCallback, useMemo, useState } from 'react'
import { Sheet } from '@mui/joy'

import RoleToolbar from './ui/RoleToolbar.js'
import RoleList from './ui/RoleList.js'
import RolePicker from './ui/RolePicker.js'
import RoleFilters from './ui/RoleFilters.js'
import RoleSummary from './ui/RoleSummary.js'
import RoleManagementDrawer from './ui/RoleManagementDrawer.js'

import { useDynamicUpdateAction } from '../entityActions/useDynamicUpdateAction.js'
import { useCreateModal } from '../../forms/create/CreateModalProvider.js'

import {
  buildMembershipPatch,
  buildRoleOptions,
  buildRoleSummary,
  buildTeamOptions,
  createRoleFilters,
  filterRoleRows,
  ROLE_ASSIGNMENT_OPTIONS,
  ROLE_CONTACT_OPTIONS,
} from './logic/roles.logic.js'

import { buildExcludeIds, buildRoleRows } from './logic/roles.selectors.js'
import { rolesSx } from './ui/roles.sx.js'

export default function RolesCard({
  title = 'צוות מקצועי',
  teamId,
  clubId,
  roles = [],
  context,
  compact = false,
  disabled = false,
  slotProps,
  pageMode = false,
}) {
  const [open, setOpen] = useState(false)
  const [managementDrawer, setManagementDrawer] = useState(null)
  const [filters, setFilters] = useState(createRoleFilters())
  const { openCreate } = useCreateModal()

  const globalMode = !teamId && !clubId

  const rows = useMemo(
    () => buildRoleRows({ roles, teamId, clubId, context }),
    [roles, teamId, clubId, context]
  )

  const filteredRows = useMemo(
    () => filterRoleRows(rows, filters),
    [rows, filters]
  )

  const summary = useMemo(() => buildRoleSummary(rows), [rows])
  const roleOptions = useMemo(() => buildRoleOptions(rows), [rows])
  const teamOptions = useMemo(() => buildTeamOptions(rows), [rows])
  const excludeIds = useMemo(() => buildExcludeIds(rows), [rows])

  const { runUpdate, pending } = useDynamicUpdateAction({
    routerEntityType: 'roles',
    snackEntityType: 'role',
  })

  const handleFilters = useCallback((patch) => {
    setFilters((prev) => ({ ...prev, ...patch }))
  }, [])

  const handleOpen = useCallback(() => {
    if (disabled || pending) return

    if (globalMode) {
      openCreate('role', {}, context)
      return
    }

    setOpen(true)
  }, [disabled, pending, globalMode, openCreate, context])

  const handleClose = useCallback(() => {
    if (pending) return
    setOpen(false)
  }, [pending])

  const handleAdd = useCallback(async (role) => {
    if (!role?.id) return

    const fieldsPatch = buildMembershipPatch(role, { teamId, clubId }, 'add')
    if (!Object.keys(fieldsPatch).length) return

    await runUpdate({
      id: role.id,
      entityName: role.fullName || 'איש צוות',
      fieldsPatch,
      meta: { section: 'roles:add', context },
    })

    setOpen(false)
  }, [runUpdate, teamId, clubId, context])

  const handleRemove = useCallback(async (role) => {
    if (!role?.id) return

    const fieldsPatch = buildMembershipPatch(role, { teamId, clubId }, 'remove')
    if (!Object.keys(fieldsPatch).length) return

    await runUpdate({
      id: role.id,
      entityName: role.fullName || 'איש צוות',
      fieldsPatch,
      meta: { section: 'roles:remove', context },
    })
  }, [runUpdate, teamId, clubId, context])

  const handleOpenManagementDrawer = useCallback((mode, role) => {
    setManagementDrawer({ mode, role })
  }, [])

  const handleCloseManagementDrawer = useCallback(() => {
    setManagementDrawer(null)
  }, [])

  const subtitle = globalMode
    ? `${rows.length} אנשי צוות במאגר`
    : `${rows.length} אנשי צוות משויכים`

  return (
    <>
      <Sheet
        variant="plain"
        sx={[rolesSx.card(compact, pageMode), slotProps?.rootSx]}
      >
        <RoleToolbar
          title={title}
          subtitle={subtitle}
          count={rows.length}
          disabled={disabled}
          pending={pending}
          onAdd={handleOpen}
          compact={compact}
          pageMode={pageMode}
          sx={slotProps?.headerSx}
        />

        <RoleSummary summary={summary} pageMode={pageMode} />

        {!compact ? (
          <RoleFilters
            filters={filters}
            onChange={handleFilters}
            roleOptions={roleOptions}
            contactOptions={ROLE_CONTACT_OPTIONS}
            assignmentOptions={ROLE_ASSIGNMENT_OPTIONS}
            teamOptions={teamOptions}
            resultCount={filteredRows.length}
            totalCount={rows.length}
            pageMode={pageMode}
          />
        ) : null}

        <Sheet
          variant="plain"
          className="dpScrollThin"
          sx={[rolesSx.listShell(compact), slotProps?.listSx]}
        >
          <RoleList
            value={filteredRows}
            disabled={disabled}
            pending={pending}
            onRemove={handleRemove}
            onOpenDrawer={handleOpenManagementDrawer}
            selectedRoleId={managementDrawer?.role?.id}
            showActions={!globalMode}
            emptyText={globalMode ? 'עדיין לא נוצרו אנשי צוות' : 'עדיין לא שויך צוות מקצועי'}
            compact={compact}
            pageMode={pageMode}
          />
        </Sheet>
      </Sheet>

      {!globalMode ? (
        <RolePicker
          open={open}
          onClose={handleClose}
          roles={roles}
          excludeIds={excludeIds}
          onSelect={handleAdd}
          loading={pending}
          disabled={disabled}
          title="שיוך איש צוות"
          subtitle={teamId ? 'שיוך לקבוצה' : 'שיוך למועדון'}
        />
      ) : null}

      <RoleManagementDrawer
        open={!!managementDrawer}
        mode={managementDrawer?.mode}
        role={managementDrawer?.role}
        onClose={handleCloseManagementDrawer}
      />
    </>
  )
}
