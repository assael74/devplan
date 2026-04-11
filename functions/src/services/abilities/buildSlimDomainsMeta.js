// C:\projects\devplan\functions\src\services\abilities\buildSlimDomainsMeta.js

function buildSlimDomainsMeta(domainsMeta = []) {
  return Array.isArray(domainsMeta)
    ? domainsMeta.map((domain) => ({
        domain: domain?.domain || null,
        score: domain?.score ?? null,
        potentialScore: domain?.potentialScore ?? null,
        filledCount: domain?.filledCount ?? 0,
        totalCount: domain?.totalCount ?? 0,
        coveragePct: domain?.coveragePct ?? 0,
        validity: domain?.validity || 'invalid',
        reliability: domain?.reliability || 'low',
      }))
    : []
}

module.exports = { buildSlimDomainsMeta }
