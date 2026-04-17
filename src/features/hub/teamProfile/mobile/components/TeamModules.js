// features/hub/teamProfile/mobile/components/TeamModules.js

import React from 'react'
import ProfileModuleRenderer from '../../../../hub/sharedProfile/ProfileModuleRenderer'


// modules
const modulesMap = {
  management: null,
  players: null,
  abilities: null,
  performance: null,
  games: null,
  videos: null,
  trainings: null
}

export default function TeamModules({ entity, context, tab }) {
  return (
    <ProfileModuleRenderer
      entity={entity}
      context={context}
      tab={tab}
      modulesMap={modulesMap}
    />
  )
}
