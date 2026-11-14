// scripts/prepare-project-documents.cjs
const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const root = fs.realpathSync(path.join(__dirname, '..'))
const sources = [
  'README.md',
  'AGENTS.md',
  '.codex/skills/devplan-ui-ux/SKILL.md',
  ':(glob)docs/**/*.md',
  'src/services/firestore/usage/README.md',
  'src/shared/abilities/engine/README.md',
]

function collectProjectDocuments({ includeUntracked = false } = {}) {
  const files = execFileSync('git', [
    'ls-files', '-z', '--cached',
    ...(includeUntracked ? ['--others', '--exclude-standard'] : []),
    '--', ...sources,
  ], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean)

  const documents = Object.create(null)
  for (const filename of [...new Set(files)].sort()) {
    if (filename.split('/').some(part => /^documents$/i.test(part))) continue
    const source = path.join(root, filename)
    if (!fs.lstatSync(source, { throwIfNoEntry: false })?.isFile()) continue
    const relative = path.relative(root, fs.realpathSync(source))
    if (path.isAbsolute(relative) || relative.split(path.sep).some(part => /^(?:\.\.|documents)$/i.test(part))) {
      throw new Error(`Markdown source is outside the documentation scope: ${filename}`)
    }
    documents[filename] = fs.readFileSync(source, 'utf8')
  }

  if (!Object.keys(documents).length) throw new Error('No project Markdown documents found')
  return documents
}

if (require.main === module) {
  const target = path.join(root, 'functions/generated/project-documents.json')
  const documents = collectProjectDocuments()
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target + '.tmp', JSON.stringify(documents), 'utf8')
  fs.renameSync(target + '.tmp', target)
  console.log(`Prepared ${Object.keys(documents).length} Markdown documents.`)
}

module.exports = { collectProjectDocuments }
