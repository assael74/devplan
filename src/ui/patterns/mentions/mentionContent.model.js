// src/ui/patterns/mentions/mentionContent.model.js

export const safeMentionHref = value => {
  const href = String(value || '').trim()
  return /^https?:\/\//i.test(href) || (href.startsWith('/') && !href.startsWith('//'))
    ? href
    : ''
}

export const normalizeMentionContent = value => {
  const source = Array.isArray(value) ? value : [{ type: 'text', text: String(value || '') }]
  const parts = []

  source.forEach(part => {
    if (part?.type === 'mention' && part.id && part.label) {
      parts.push({
        type: 'mention',
        id: String(part.id),
        label: String(part.label),
        href: safeMentionHref(part.href),
      })
      return
    }

    const text = String(part?.text || '')
    if (!text) return
    const previous = parts[parts.length - 1]
    if (previous?.type === 'text') previous.text += text
    else parts.push({ type: 'text', text })
  })

  return parts.length ? parts : [{ type: 'text', text: '' }]
}

export const mentionContentText = value => normalizeMentionContent(value)
  .map(part => part.type === 'mention' ? part.label : part.text)
  .join('')

export const mentionIds = value => [...new Set(normalizeMentionContent(value)
  .filter(part => part.type === 'mention')
  .map(part => part.id))]
