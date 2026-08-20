// C:\projects\devplan\functions\src\services\narrative\openai.js

const DEFAULT_MODEL = 'gpt-5.6'
const OPENAI_URL = 'https://api.openai.com/v1/responses'
const OPENAI_TIMEOUT_MS = 90000

function clean(value) {
  return String(value || '').trim()
}

function buildDraftSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      title: { type: 'string' },
      conclusionText: { type: 'string' },
      whyInteresting: { type: 'string' },
      professionalContext: { type: 'string' },
      strengths: {
        type: 'array',
        items: { type: 'string' },
      },
      unknowns: {
        type: 'array',
        items: { type: 'string' },
      },
      evidenceRefs: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: [
      'title',
      'conclusionText',
      'whyInteresting',
      'professionalContext',
      'strengths',
      'unknowns',
      'evidenceRefs',
    ],
  }
}

function extractOutputText(response = {}) {
  const output = Array.isArray(response.output) ? response.output : []

  return output
    .filter(item => item && item.type === 'message')
    .flatMap(item => Array.isArray(item.content) ? item.content : [])
    .filter(item => item && item.type === 'output_text')
    .map(item => clean(item.text))
    .filter(Boolean)
    .join('\n')
    .trim()
}

function extractRefusal(response = {}) {
  const output = Array.isArray(response.output) ? response.output : []

  return output
    .filter(item => item && item.type === 'message')
    .flatMap(item => Array.isArray(item.content) ? item.content : [])
    .filter(item => item && item.type === 'refusal')
    .map(item => clean(item.refusal))
    .filter(Boolean)
    .join(' ')
    .trim()
}

function resolveModel() {
  return clean(process.env.OPENAI_NARRATIVE_MODEL) || DEFAULT_MODEL
}

async function createNarrativeDraft({ userInput = '' } = {}) {
  const apiKey = clean(process.env.OPENAI_API_KEY)
  if (!apiKey) {
    throw Object.assign(new Error('OPENAI_API_KEY is not configured'), { status: 503 })
  }

  const model = resolveModel()
  let response

  try {
    response = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        store: false,
        reasoning: { effort: 'low' },
        input: [
          {
            role: 'user',
            content: userInput,
          },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'player_scout_narrative_v2',
            strict: true,
            schema: buildDraftSchema(),
          },
        },
      }),
      signal: AbortSignal.timeout(OPENAI_TIMEOUT_MS),
    })
  } catch (error) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
      throw Object.assign(new Error('OpenAI narrative generation timed out'), {
        status: 504,
        details: {
          provider: 'openai',
          timeoutMs: OPENAI_TIMEOUT_MS,
        },
      })
    }

    throw error
  }

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = clean(payload.error?.message) || `OpenAI request failed (${response.status})`
    throw Object.assign(new Error(message), {
      status: 502,
      details: {
        provider: 'openai',
        providerStatus: response.status,
      },
    })
  }

  const refusal = extractRefusal(payload)
  if (refusal) {
    throw Object.assign(new Error('OpenAI refused the narrative request'), {
      status: 502,
      details: { provider: 'openai' },
    })
  }

  if (payload.status === 'incomplete') {
    throw Object.assign(new Error('OpenAI narrative response was incomplete'), {
      status: 502,
      details: { provider: 'openai' },
    })
  }

  const outputText = extractOutputText(payload)
  if (!outputText) {
    throw Object.assign(new Error('OpenAI returned an empty narrative response'), {
      status: 502,
      details: { provider: 'openai' },
    })
  }

  let draft
  try {
    draft = JSON.parse(outputText)
  } catch (error) {
    throw Object.assign(new Error('OpenAI returned invalid narrative JSON'), {
      status: 502,
      details: { provider: 'openai' },
    })
  }

  return { draft, model }
}

module.exports = { createNarrativeDraft }
