// C:\projects\devplan\functions\src\repositories\abilities\abilitiesShorts.repo.js

const { db } = require('../../config/admin')

const ABILITIES_SHORTS_COLLECTION = 'abilitiesShorts'

function getAbilitiesDocRef(docId) {
  return db.collection(ABILITIES_SHORTS_COLLECTION).doc(docId)
}

module.exports = {
  ABILITIES_SHORTS_COLLECTION,
  getAbilitiesDocRef,
}
