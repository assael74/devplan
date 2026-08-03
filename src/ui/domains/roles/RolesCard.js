// src/ui/domains/roles/RolesCard.js

import React, { useCallback, useMemo, useState } from 'react'
import { Sheet } from '@mui/joy'

import RoleToolbar from './ui/RoleToolbar.js'
import RoleList from './ui/RoleList.js'
import RolePicker from './ui/RolePicker.js'
import RoleFilters from './ui/RoleFilters.js'
import RoleSummary from './ui/RoleSummary.js'

import { useDynamicUpdateAction } from '../entityActions/useDynamicUpdateAction.js'
import { useCreateModal } from '../../forms/create/CreateModalProvider.js'

import {
  buildMembershipPatch,
  buildRoleOptions,
  buildRoleSummary,
  createRoleFilters,
  filterRoleRows,
  ROLE_CONTACT_OPTIONS,
} from './logic/roles.logic.js'

import { buildExcludeIds, buildRoleRows } from './logic/roles.selectors.js'
import { rolesSx } from './ui/roles.sx.js'

export default function RolesCard({ title = 'צוות מקצועי', teamId, clubId, roles = [], context, compact = false, disabled = false, slotProps }) {
  const [open, setOpen] = useState(false)
  const [filters, setFilters] = useState(createRoleFilters())
  const { openCreate } = useCreateModal()

  const globalMode = !teamId && !clubId

  const rows = useMemo(
    () => buildRoleRows({ roles, teamId, clubId }),
    [roles, teamId, clubId]
  )

  const filteredRows = useMemo(
    () => filterRoleRows(rows, filters),
    [rows, filters]
  )

  const summary = useMemo(() => buildRoleSummary(rows), [rows])
  const roleOptions = useMemo(() => buildRoleOptions(rows), [rows])
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

  const subtitle = globalMode
    ? `${rows.length} אנשי צוות במאגר`
    : `${rows.length} אנשי צוות משויכים`

  return (
    <>
      <Sheet
        variant="plain"
        sx={[rolesSx.card(compact), slotProps?.rootSx]}
      >
        <RoleToolbar
          title={title}
          subtitle={subtitle}
          count={rows.length}
          disabled={disabled}
          pending={pending}
          onAdd={handleOpen}
          compact={compact}
          sx={slotProps?.headerSx}
        />

        <RoleSummary summary={summary} />

        {!compact ? (
          <RoleFilters
            filters={filters}
            onChange={handleFilters}
            roleOptions={roleOptions}
            contactOptions={ROLE_CONTACT_OPTIONS}
            resultCount={filteredRows.length}
            totalCount={rows.length}
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
            showActions={!globalMode}
            emptyText={globalMode ? 'עדיין לא נוצרו אנשי צוות' : 'עדיין לא שויך צוות מקצועי'}
            compact={compact}
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
    </>
  )
}
