// TEAMPROFILE/sharedUi/insights/teamPlayers/buildSection/AspectPlayers.js

import React from 'react'

import {
  PlayersList,
} from '../shared/index.js'

const emptyArray = []

const getTitle = ({ type, card }) => {
  if (type === 'position') {
    return `שחקנים בעמדת ${card?.label || ''}`
  }

  return `שחקנים במעמד ${card?.label || ''}`
}

export default function AspectPlayers({
  players = emptyArray,
  card,
  type = 'role',
}) {
  return (
    <PlayersList
      players={players}
      title={getTitle({ type, card })}
      emptyText="אין שחקנים משויכים להצגה."
      limit={8}
    />
  )
}
