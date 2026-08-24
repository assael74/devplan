// C:\projects\devplan\functions\src\domain\narrative\input.js

const { buildContext } = require('./context')
const { buildEvidence } = require('./evidence')
const { buildTimeline } = require('./timeline')
const { buildMeaning } = require('./meaning')
const { buildRelationship } = require('./relationship')
const { buildDecisionContext } = require('./decision')
const { buildHash } = require('./hash')

function buildInput({ player = {}, teams = [], futureProjection = null } = {}) {
  const context = buildContext({ player, teams })
  const relationships = buildRelationship(context)
  const decision = buildDecisionContext({ context, futureProjection })
  const timeline = buildTimeline(context, decision)
  const evidence = buildEvidence(context, decision)
  const meaning = buildMeaning({ context, timeline, decision })
  const inputHash = buildHash(meaning)

  return {
    version: 4,
    player: context.player,
    context: {
      entries: context.entries,
      verification: context.verification,
      playerReview: context.playerReview,
    },
    evidence,
    timeline,
    relationships,
    decision,
    meaning,
    inputHash,
  }
}

module.exports = { buildInput }
