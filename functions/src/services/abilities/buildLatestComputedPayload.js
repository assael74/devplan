// C:\projects\devplan\functions\src\services\abilities\buildLatestComputedPayload.js

const { buildSlimDomainsMeta } = require('./buildSlimDomainsMeta')

function buildLatestComputedPayload(finalResult = {}) {
  return {
    abilities: finalResult?.abilities || {},
    domainScores: finalResult?.domainScores || {},
    domainPotentialScores: finalResult?.domainPotentialScores || {},
    domainsMeta: buildSlimDomainsMeta(finalResult?.domainsMeta),
    level: finalResult?.level ?? null,
    levelPotential: finalResult?.levelPotential ?? null,
    reliability: finalResult?.reliability || { ability: 'low', potential: 'low' },
    coverage: finalResult?.coverage || { ability: 0, potential: 0, physical: 0 },
    validDomainsCount: finalResult?.validDomainsCount || { ability: 0, potential: 0 },
    snapshotsMeta: {
      windowsCount: finalResult?.snapshotsMeta?.windowsCount ?? 0,
      lastWindowKey: finalResult?.snapshotsMeta?.lastWindowKey || null,
      formsCount: finalResult?.snapshotsMeta?.formsCount ?? 0,
      evaluatorsCount: finalResult?.snapshotsMeta?.evaluatorsCount ?? 0,
    },
  }
}

module.exports = { buildLatestComputedPayload }
