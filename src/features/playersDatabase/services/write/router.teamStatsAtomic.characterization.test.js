const fs = require('fs')
const path = require('path')

test('Stats atomic receipt linkage is not overwritten by the router pending branch', () => {
  const source = fs.readFileSync(path.join(__dirname, 'router.js'), 'utf8')
  expect(source).toContain('if (!result?.writeActionLinkedInCanonicalCommit)')
  expect(source).toContain('backgroundSyncPending: true')
})
