import React from 'react'

import PrivatePlayerActivityView from '../../../sharedModules/activity/PrivatePlayerActivityView.js'

export default function PlayerActivityModule({ entity }) {
  return <PrivatePlayerActivityView player={entity} />
}
