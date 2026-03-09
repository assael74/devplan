/// C:\projects\devplan\src\features\hub\sharedProfile\ProfileModuleRenderer.js
import React from 'react'
import EmptyState from './EmptyState'

export default function ProfileModuleRenderer({ entity, context, tab, modulesMap }) {
  const map = modulesMap && typeof modulesMap === 'object' ? modulesMap : {}
  const Comp = map[tab]

  if (!Comp) {
    return <EmptyState title="טאב לא נתמך" desc="נסה לעבור לטאב אחר." />
  }

  return <Comp entity={entity} context={context} />
}
