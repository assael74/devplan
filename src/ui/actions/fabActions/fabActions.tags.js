// ui/actions/fabActions/fabActions.tags.js

import { iconUi } from '../../core/icons/iconUi.js'
import { composeFabActions } from './fabActions.shared.js'

export function buildTagsFabActions({
  allowCreate = true,
  taskAction = null,
  handlers = {},
}) {
  const { onCreateTag } = handlers

  return composeFabActions({
    primaryActions: [
      {
        id: 'create-tag',
        label: 'יצירת תג חדש',
        icon: iconUi({ id: 'addTag' }),
        onClick: onCreateTag,
        color: 'tags',
        disabled: !allowCreate,
      },
    ],
    taskAction,
    primarySection: { id: 'section-actions', label: 'פעולות', colorKey: 'tags' },
  })
}
