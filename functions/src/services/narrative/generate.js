// C:\projects\devplan\functions\src\services\narrative\generate.js

const { loadInput } = require('./loadInput')
const { createNarrativeDraft } = require('./openai')
const { PROMPT_VERSION, buildGenerateInput } = require('./prompt')
const { buildMeta } = require('../../domain/narrative/meta')
const { validateDraft } = require('../../domain/narrative/validate')

async function generate({ playerId = '' } = {}) {
  const input = await loadInput(playerId)
  const generated = await createNarrativeDraft({
    userInput: buildGenerateInput(input),
  })
  const draft = validateDraft({ input, draft: generated.draft })

  return {
    draft,
    meta: buildMeta(input),
    generatedAt: new Date().toISOString(),
    source: 'openai',
    generator: {
      model: generated.model,
      promptVersion: PROMPT_VERSION,
    },
  }
}

module.exports = { generate }
