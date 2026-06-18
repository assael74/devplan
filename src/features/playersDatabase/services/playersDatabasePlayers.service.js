import {
  getPlayersDatabaseMockFilterOptions,
  getPlayersDatabaseMockKpis,
  getPlayersDatabaseMockPlayerDetails,
  listPlayersDatabaseMockPlayers,
} from './playersDatabaseMock.service.js'

export async function getPlayersDatabaseKpis() {
  return getPlayersDatabaseMockKpis()
}

export async function getPlayersDatabaseFilterOptions() {
  return getPlayersDatabaseMockFilterOptions()
}

export async function listPlayersDatabasePlayers(params = {}) {
  return listPlayersDatabaseMockPlayers(params)
}

export async function getPlayersDatabasePlayerDetails(playerId) {
  return getPlayersDatabaseMockPlayerDetails(playerId)
}
