// C:\projects\devplan\functions\src\services\abilities\buildPlayerAbilitiesItem.js

const { buildSlimDomainsMeta } = require('./buildSlimDomainsMeta')

function buildPlayerAbilitiesItem({
  current,
  itemId,
  effectiveAbilitiesDocId,
  finalResult,
  allForms,
  now,
}) {
  return {
    ...(current || {}),
    id: itemId,
    docAbilitiesId: effectiveAbilitiesDocId,
    abilities: finalResult?.abilities || {},
    domainScores: finalResult?.domainScores || {},
    domainPotentialScores: finalResult?.domainPotentialScores || {},
    domainsMeta: buildSlimDomainsMeta(finalResult?.domainsMeta),
    level: finalResult?.level ?? null,
    levelPotential: finalResult?.levelPotential ?? null,
    reliability: finalResult?.reliability || { ability: 'low', potential: 'low' },
    coverage: finalResult?.coverage || { ability: 0, potential: 0, physical: 0 },
    validDomainsCount: finalResult?.validDomainsCount || { ability: 0, potential: 0 },
    lastWindowKey: finalResult?.snapshotsMeta?.lastWindowKey || null,
    formsCount: finalResult?.snapshotsMeta?.formsCount ?? allForms.length,
    evaluatorsCount: finalResult?.snapshotsMeta?.evaluatorsCount ?? 0,
    windowsCount: finalResult?.snapshotsMeta?.windowsCount ?? 0,
    updatedFrom: 'abilitiesEngineV2',
    updatedAt: now,
    createdAt: current?.createdAt ?? now,
  }
}

module.exports = { buildPlayerAbilitiesItem }
