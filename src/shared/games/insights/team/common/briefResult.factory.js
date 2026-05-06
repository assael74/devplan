// shared/games/insights/team/common/briefResult.factory.js

export function buildEmptyBriefResult({
  id,
  sectionId,
  title,
  subtitle,
  sourceLabel,
  targetLabel,
  text,
  metrics = {},
  meta = {},
  debug = {},
}) {
  return {
    id,
    sectionId,
    status: 'empty',
    tone: 'neutral',
    title,
    subtitle,
    sourceLabel,
    targetLabel,
    text,
    items: [],
    metrics,
    meta: {
      hasData: false,
      ...meta,
    },
    debug: {
      statusReason: 'empty_data',
      ...debug,
    },
  }
}

export function buildReadyBriefResult({
  id,
  sectionId,
  tone = 'neutral',
  title,
  subtitle,
  sourceLabel,
  targetLabel,
  text,
  items = [],
  metrics = {},
  meta = {},
  debug = {},
}) {
  return {
    id,
    sectionId,
    status: 'ready',
    tone,
    title,
    subtitle,
    sourceLabel,
    targetLabel,
    text,
    items,
    metrics,
    meta: {
      hasData: true,
      ...meta,
    },
    debug: {
      statusReason: 'ready',
      ...debug,
    },
  }
}
