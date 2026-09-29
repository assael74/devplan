// src/features/playersDatabase/ui/favorites/PlayersDatabaseFavoritesProvider.test.js

import { render, screen } from '@testing-library/react'

import {
  PlayersDatabaseFavoritesProvider,
  usePlayersDatabaseFavorites,
} from './PlayersDatabaseFavoritesProvider.js'

jest.mock('../../services/read/index.js', () => ({
  readFavorites: jest.fn(async () => ({ players: [], birthTeams: [] })),
}))

jest.mock('../../services/writeV2/favorites/birthTeam/add.js', () => ({
  addBirthTeamFavorite: jest.fn(),
}))

jest.mock('../../services/writeV2/favorites/birthTeam/remove.js', () => ({
  removeBirthTeamFavorite: jest.fn(),
}))

jest.mock('../../services/writeV2/favorites/player/add.js', () => ({
  addPlayerFavorite: jest.fn(),
}))

jest.mock('../../services/writeV2/favorites/player/remove.js', () => ({
  removePlayerFavorite: jest.fn(),
}))

function Consumer() {
  const favorites = usePlayersDatabaseFavorites()
  return <div>{favorites.loading ? 'loading' : 'ready'}</div>
}

test('provides the same Favorites context consumed by page hooks', async () => {
  render(
    <PlayersDatabaseFavoritesProvider>
      <Consumer />
    </PlayersDatabaseFavoritesProvider>
  )

  expect(await screen.findByText('ready')).toBeInTheDocument()
})
