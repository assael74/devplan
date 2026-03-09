// features/tagsHub/TagHubFabMenu.js
import React, { useMemo } from 'react'
import GenericFabMenu from '../../ui/actions/GenericFabMenu'
import { iconUi } from '../../ui/core/icons/iconUi.js'

export default function TagHubFabMenu({ onCreateTag, tags, entityType }) {
  const actions = useMemo(() => {
    return typeof onCreateTag === 'function'
      ? [
          {
            id: 'create-tag',
            label: 'יצירת תג חדש',
            icon: iconUi({ id: 'addTag' }),
            onClick: onCreateTag,
            color: 'club',
          },
        ]
      : []
  }, [onCreateTag])

  if (!actions.length) return null

  return (
    <GenericFabMenu
      id="tags-hub-fab"
      placement="br"
      tooltip='יצירת תג חדש'
      ariaLabel='יצירת תג חדש'
      actions={actions}
      entityType={entityType}
      variant="solid"
      fabSx={{ color: '#fff' }}
    />
  )
}
