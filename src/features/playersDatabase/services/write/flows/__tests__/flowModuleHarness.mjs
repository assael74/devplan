import fs from 'node:fs/promises'
import path from 'node:path'
import vm from 'node:vm'

const buildSyntheticModule = (exportsMap, identifier, context) => {
  const exportNames = Object.keys(exportsMap)
  return new vm.SyntheticModule(
    exportNames,
    function setExports() {
      exportNames.forEach(name => this.setExport(name, exportsMap[name]))
    },
    { identifier, context }
  )
}

export const loadFlowModule = async ({ entryPath, mocks = {} }) => {
  const absoluteEntryPath = path.resolve(entryPath)
  const source = await fs.readFile(absoluteEntryPath, 'utf8')
  const context = vm.createContext({
    Array,
    Boolean,
    Error,
    Object,
    String,
  })
  const module = new vm.SourceTextModule(source, {
    context,
    identifier: absoluteEntryPath,
  })

  await module.link(async specifier => {
    if (!Object.prototype.hasOwnProperty.call(mocks, specifier)) {
      throw new Error(`Missing test mock for ${specifier} imported by ${absoluteEntryPath}`)
    }
    return buildSyntheticModule(mocks[specifier], `${absoluteEntryPath}::${specifier}`, context)
  })
  await module.evaluate()
  return module.namespace
}

export const buildSyncError = ({
  stage,
  cause,
  results = {},
  name = 'WriteFlowSyncError',
  fallbackMessage = 'Write flow sync failed',
} = {}) => {
  const error = new Error(cause?.message || `${fallbackMessage} at ${stage}`)
  error.name = name
  error.stage = stage
  error.cause = cause
  error.results = results
  return error
}

export const attachWriteReport = ({ error, stage, results = {}, flow = '' } = {}) => {
  const target = error instanceof Error ? error : new Error(String(error || 'Write flow failed'))
  target.stage = stage
  target.results = results
  target.writeReport = { flow, failedStage: stage, results }
  return target
}
