// functions/src/http/projectDocuments/projectDocuments.http.js
const { posix } = require('node:path')
const { HttpsError } = require('firebase-functions/v2/https')
const MarkdownIt = require('markdown-it')
const { getUsageAdminEmails } = require('../../config/usageAdminEmails')

const markdown = new MarkdownIt({ html: false })
const plainText = token => (token?.children || [])
  .map(child => child.type === 'image' ? plainText(child) : child.content)
  .join('')

function resolveLink(href, { filename, documents }) {
  if (/^(https?:\/\/|mailto:)/i.test(href)) return { href, external: true }

  try {
    const marker = href.indexOf('#')
    const pathname = decodeURIComponent(marker < 0 ? href : href.slice(0, marker))
    const fragment = marker < 0 ? '' : decodeURIComponent(href.slice(marker + 1))
    const target = pathname ? posix.join(posix.dirname(filename), pathname) : filename

    if (!Object.hasOwn(documents, target)) return null
    const query = new URLSearchParams({ doc: target })
    return { href: `?${query}${fragment ? '#' + encodeURIComponent(fragment) : ''}` }
  } catch {
    return null
  }
}

markdown.core.ruler.push('project_documents', state => {
  const anchors = new Set()
  state.tokens.forEach((token, index) => {
    if (token.type === 'heading_open') {
      const title = plainText(state.tokens[index + 1])
      const base = title.toLowerCase().trim()
        .replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, '').replace(/\s+/g, '-') || 'section'
      let slug = base
      for (let suffix = 1; anchors.has(slug); suffix += 1) slug = `${base}-${suffix}`
      anchors.add(slug)
      token.attrSet('id', 'project-doc-' + slug)
    }

    const links = []
    for (const child of token.children || []) {
      if (child.type === 'link_open') {
        const link = resolveLink(child.attrGet('href'), state.env)
        links.push(link)
        if (!link) {
          child.tag = 'span'
          child.attrs = null
        } else {
          child.attrSet('href', link.href)
          if (link.external) {
            child.attrSet('target', '_blank')
            child.attrSet('rel', 'noopener noreferrer')
          }
        }
      } else if (child.type === 'link_close' && !links.pop()) {
        child.tag = 'span'
      }
    }
  })
})

markdown.renderer.rules.image = (tokens, index) => markdown.utils.escapeHtml(plainText(tokens[index]))
markdown.renderer.rules.table_open = () => '<div class="documentTable" tabindex="0" role="region" aria-label="טבלה במסמך"><table>'
markdown.renderer.rules.table_close = () => '</table></div>\n'

function parseDocument(filename, documents) {
  const source = documents[filename]
    .replace(/^\uFEFF/, '')
    .replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '')
    .replace(/^\s*<!--\s*[^\r\n<>]+\.md\s*-->\s*/, '')
  const env = { filename, documents }
  const tokens = markdown.parse(source, env)
  const heading = tokens.findIndex(token => token.type === 'heading_open' && token.tag === 'h1')
  const title = (heading >= 0 && plainText(tokens[heading + 1])) || posix.parse(filename).name

  if (heading >= 0) tokens[heading].attrJoin('class', 'documentSourceTitle')
  return { title, tokens, env }
}

function readProjectDocuments(documents, id) {
  if (id === undefined) {
    return { documents: Object.keys(documents).map(file => ({
      id: file,
      title: parseDocument(file, documents).title,
    })) }
  }

  if (typeof id !== 'string' || !id.trim()) throw new HttpsError('invalid-argument', 'מזהה מסמך לא תקין')
  if (!Object.hasOwn(documents, id)) throw new HttpsError('not-found', 'המסמך לא נמצא')

  const { title, tokens, env } = parseDocument(id, documents)
  return { title, html: markdown.renderer.render(tokens, markdown.options, env) }
}

function createProjectDocumentsHandler(loadDocuments) {
  return request => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'נדרשת התחברות לספריית התיעוד')

    const { email, email_verified: verifiedEmail } = request.auth.token || {}
    const allowedEmails = getUsageAdminEmails()
    if (verifiedEmail !== true || !allowedEmails.has(String(email || '').trim().toLowerCase())) {
      throw new HttpsError('permission-denied', 'אין הרשאה לקריאת התיעוד')
    }

    return readProjectDocuments(loadDocuments(), request.data?.documentId)
  }
}

module.exports = { createProjectDocumentsHandler, readProjectDocuments }
