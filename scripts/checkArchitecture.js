// scripts/checkArchitecture.js

const fs = require('fs')
const path = require('path')

const PROJECT_ROOT = path.resolve(__dirname, '..')
const SRC_ROOT = path.join(PROJECT_ROOT, 'src')
const EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx'])

const rules = [
  {
    scope: 'features/reports',
    pattern: /(?:^|\/)(?:features\/hub|hub)\//,
    message: 'Reports must not import Hub internals',
  },
  {
    scope: 'ui',
    pattern: /(?:^|\/)services\//,
    message: 'UI must not import services directly',
  },
  {
    scope: 'shared',
    pattern: /(?:^|\/)(?:ui|services)\/|(?:^|\/)firebase(?:\/|['"])/,
    message: 'Shared must stay infrastructure and presentation neutral',
  },
  {
    scope: 'features',
    pattern: /(?:^|\/)app\/AuthProvider(?:\.js)?['"]?$/,
    message: 'Features must consume auth through features/auth',
  },
]

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else if (EXTENSIONS.has(path.extname(entry.name))) files.push(full)
  }

  return files
}

function extractModuleSpecifiers(line) {
  const matches = []
  const regex = /(?:from\s+|import\s*\()(['"])([^'"]+)\1/g
  let match
  while ((match = regex.exec(line))) matches.push(match[2])
  return matches
}

if (!fs.existsSync(SRC_ROOT)) {
  console.error(`Missing source directory: ${SRC_ROOT}`)
  process.exit(1)
}

const approvedLegacyExceptions = new Set([
  'src/shared/tags/tags.constants.js',
  'src/shared/tasks/tasks.constants.js',
  'src/shared/meetings/filters/meetingsFilters.config.js',
  'src/shared/games/filters/gamesFilterGroups.js',
  'src/shared/players/filters/playerFilterGroups.js',
  'src/shared/performance/filters/statsFilterGroups.js',
])

const violations = []
const legacyHits = new Set()

for (const rule of rules) {
  const dir = path.join(SRC_ROOT, rule.scope)

  for (const file of walk(dir)) {
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)

    lines.forEach((line, index) => {
      for (const specifier of extractModuleSpecifiers(line)) {
        const normalized = specifier.replace(/\\/g, '/')
        if (rule.pattern.test(normalized)) {
          const relativeFile = path.relative(PROJECT_ROOT, file).replace(/\\/g, '/')
          if (approvedLegacyExceptions.has(relativeFile)) {
            legacyHits.add(relativeFile)
            continue
          }
          violations.push(
            `${relativeFile}:${index + 1} ${rule.message} (${specifier})`
          )
        }
      }
    })
  }
}

if (violations.length) {
  console.error(violations.join('\n'))
  process.exit(1)
}

console.log('Architecture boundaries are clean.')
if (legacyHits.size) {
  console.log(`Approved legacy exceptions: ${legacyHits.size}`)
}
