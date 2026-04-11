// C:\projects\devplan\functions\src\repositories\abilities\playersAbilities.repo.js

const { db } = require('../../config/admin')

const PLAYERS_ABILITIES_COLLECTION = 'playersShorts'
const PLAYERS_ABILITIES_DOC_ID = 'CxI3w6ztc9KfTxJLP8zS'

function getPlayersAbilitiesRef() {
  return db.collection(PLAYERS_ABILITIES_COLLECTION).doc(PLAYERS_ABILITIES_DOC_ID)
}

module.exports = {
  PLAYERS_ABILITIES_COLLECTION,
  PLAYERS_ABILITIES_DOC_ID,
  getPlayersAbilitiesRef,
}
