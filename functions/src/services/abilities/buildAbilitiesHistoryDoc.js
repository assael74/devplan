// C:\projects\devplan\functions\src\services\abilities\buildAbilitiesHistoryDoc.js

const { buildLatestComputedPayload } = require('./buildLatestComputedPayload')

function buildAbilitiesHistoryDoc({
  abilitiesData,
  effectiveAbilitiesDocId,
  playerId,
  allForms,
  finalResult,
  now,
}) {
  return {
    ...abilitiesData,
    docId: abilitiesData?.docId || effectiveAbilitiesDocId,
    playerId: abilitiesData?.playerId || playerId,
    formsAbilities: allForms,
    windowsAbilities: Array.isArray(finalResult?.windows) ? finalResult.windows : [],
    latestComputed: buildLatestComputedPayload(finalResult),
    updatedFrom: 'abilitiesEngineV2',
    updatedAt: now,
    createdAt: abilitiesData?.createdAt ?? now,
  }
}

module.exports = { buildAbilitiesHistoryDoc }
