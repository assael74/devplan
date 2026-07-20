// features/playersDatabase/ui/hooks/usePlayerPage.js

import { useParams } from 'react-router-dom'

import { demoPlayer } from './demoData.js'

export function usePlayerPage() {
  const { playerId = demoPlayer.id } = useParams()
  return { player: { ...demoPlayer, id: playerId } }
}
