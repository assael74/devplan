// features/hub/sharedProfile/EntityActionsMenu.js
import React, { useMemo } from 'react'
import { Dropdown, Menu, MenuButton, MenuItem, ListDivider, IconButton } from '@mui/joy'
import MoreVertRounded from '@mui/icons-material/MoreVertRounded'

import { useLifecycle } from '../../../ui/domains/entityLifecycle/LifecycleProvider.js'
import { iconUi } from '../../../ui/core/icons/iconUi.js'

export default function EntityActionsMenu({
  entityType,
  entityId,
  entityName,
  metaCounts,
  disabled,
  isArchived,
}) {
  const lifecycle = useLifecycle()

  const canArchive = entityType !== 'scouting'

  const entity = useMemo(
    () => ({
      entityType,
      id: entityId,
      name: entityName,
    }),
    [entityType, entityId, entityName]
  )

  const canOpen = !!entityType && !!entityId && !disabled

  const stop = (e) => {
    e?.stopPropagation()
    e?.preventDefault()
  }

  const handleOpenLifecycle = () => {
    lifecycle.openLifecycle(entity, metaCounts || null)
  }

  const handleArchiveOrRestore = () => {
    if (isArchived) {
      lifecycle.openRestore(entity)
      return
    }
    lifecycle.openArchive(entity)
  }

  return (
    <Dropdown>
      <MenuButton
        slots={{ root: IconButton }}
        slotProps={{
          root: {
            size: 'sm',
            variant: 'plain',
            disabled: !canOpen,
            sx: { opacity: 0.85, '&:hover': { opacity: 1 } },
          },
        }}
      >
        <MoreVertRounded />
      </MenuButton>

      <Menu placement="bottom-end" sx={{ minWidth: 200 }}>
      {canArchive ? (
            <>
              <MenuItem
                onClick={(e) => {
                  stop(e)
                  handleArchiveOrRestore()
                }}
              >
                {iconUi({ id: isArchived ? 'restore' : 'archive' })} {isArchived ? 'שחזור' : 'ארכוב'}
              </MenuItem>

              <ListDivider />
            </>
          ) : null}

        <MenuItem
          color="danger"
          onClick={(e) => {
            stop(e)
            handleOpenLifecycle()
          }}
        >
          {iconUi({ id: 'delete' })} מחיקה
        </MenuItem>
      </Menu>
    </Dropdown>
  )
}
