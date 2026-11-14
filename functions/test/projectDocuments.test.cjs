// functions/test/projectDocuments.test.cjs
const { test } = require('node:test')
const assert = require('node:assert/strict')
const { createProjectDocumentsHandler, readProjectDocuments } = require('../src/http/projectDocuments/projectDocuments.http.js')

const documents = {
  'docs/README.md': [
    '# מדריך',
    '',
    '[מבנה](architecture/STRUCTURE.md#מבנה-הפרויקט)',
    '[מסמך חסר](missing.md)',
    '',
    '| מודל | תפקיד |',
    '| --- | --- |',
    '| יעד | עונה |',
    '',
    '<script>raw HTML</script>',
    '![תמונה](https://example.com/example.png)',
  ].join('\n'),
  'docs/architecture/STRUCTURE.md': '# מבנה\n\n## מבנה הפרויקט\n\n## מבנה הפרויקט',
}

test('lists documents and resolves links within the catalog', () => {
  assert.deepEqual(readProjectDocuments(documents), {
    documents: [
      { id: 'docs/README.md', title: 'מדריך' },
      { id: 'docs/architecture/STRUCTURE.md', title: 'מבנה' },
    ],
  })
  const { html } = readProjectDocuments(documents, 'docs/README.md')
  const link = new URLSearchParams({ doc: 'docs/architecture/STRUCTURE.md' })
  assert.ok(html.includes(`href="?${link}#${encodeURIComponent('מבנה-הפרויקט')}"`))
  assert.match(html, /<span>מסמך חסר<\/span>/)
  assert.match(html, /<div class="documentTable"[^>]*><table>/)
  assert.match(html, /&lt;script&gt;/)
  assert.doesNotMatch(html, /<script|<img|example\.png/)
  assert.match(readProjectDocuments(documents, 'docs/architecture/STRUCTURE.md').html, /id="project-doc-מבנה-הפרויקט-1"/)
})

test('checks verified access before loading any documents', () => {
  const original = process.env.FIRESTORE_USAGE_ADMIN_EMAILS
  process.env.FIRESTORE_USAGE_ADMIN_EMAILS = ' Owner@example.com '
  try {
    let loads = 0
    const read = createProjectDocumentsHandler(() => {
      loads += 1
      return documents
    })
    const auth = { token: { email: 'owner@example.com', email_verified: true } }

    assert.throws(() => read({}), { code: 'unauthenticated' })
    assert.throws(() => read({ auth: { token: { ...auth.token, email_verified: false } } }), { code: 'permission-denied' })
    assert.throws(() => read({ auth: { token: { ...auth.token, email: 'other@example.com' } } }), { code: 'permission-denied' })
    assert.equal(loads, 0)
    assert.equal(read({ auth }).documents.length, 2)
    assert.throws(() => read({ auth, data: { documentId: ['docs/README.md'] } }), { code: 'invalid-argument' })
    assert.throws(() => read({ auth, data: { documentId: '../README.md' } }), { code: 'not-found' })
  } finally {
    if (original === undefined) delete process.env.FIRESTORE_USAGE_ADMIN_EMAILS
    else process.env.FIRESTORE_USAGE_ADMIN_EMAILS = original
  }
})
