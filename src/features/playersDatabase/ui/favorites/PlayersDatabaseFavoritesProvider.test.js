// src/features/playersDatabase/ui/favorites/PlayersDatabaseFavoritesProvider.test.js

import { render, screen } from '@testing-library/react'

import {
  PlayersDatabaseFavoritesProvider,
  usePlayersDatabaseFavorites,
} from './PlayersDatabaseFavoritesProvider.js'

jest.mock('../../services/read/index.js', () => ({
  readFavorites: jest.fn(async () => ({ players: [], birthTeams: [] })),
}))

jest.mock('../../services/write/index.js', () => ({
  PLAYERS_DATABASE_WRITE_ACTIONS: {
    ADD_FAVORITE: 'addFavorite',
    REMOVE_FAVORITE: 'removeFavorite',
  },
  runPlayersDatabaseWriteAction: jest.fn(),
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
