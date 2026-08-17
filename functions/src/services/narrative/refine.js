// C:\projects\devplan\functions\src\services\narrative\refine.js

const { loadInput } = require('./loadInput')
const { createNarrativeDraft } = require('./openai')
const { PROMPT_VERSION, buildRefineInput } = require('./prompt')
const { buildMeta } = require('../../domain/narrative/meta')
const { validateDraft } = require('../../domain/narrative/validate')

function clean(value) {
  return String(value || '').trim()
}

async function refine({ playerId = '', currentDraft = {}, instruction = '' } = {}) {
  const safeInstruction = clean(instruction)
  if (!safeInstruction) {
    throw Object.assign(new Error('instruction is required'), { status: 400 })
  }

  const input = await loadInput(playerId)
  const safeCurrentDraft = validateDraft({ input, draft: currentDraft })
  const generated = await createNarrativeDraft({
    userInput: buildRefineInput({
      input,
      currentDraft: safeCurrentDraft,
      instruction: safeInstruction,
    }),
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
    refinementAvailable: true,
  }
}

module.exports = { refine }
