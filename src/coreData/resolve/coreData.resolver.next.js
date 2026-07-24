// src/coreData/resolve/coreData.resolver.next.js
import { resolveCoreDataPipeline } from './coreData.pipeline.js'

/**
 * Public resolver entry point.
 *
 * The resolver contract remains unchanged. The pipeline owns the internal
 * merge, index, enrich and relations stages so each stage can be inspected
 * and tested without adding orchestration back into the provider.
 */
export function resolveCoreDataNext(input = {}) {
  return resolveCoreDataPipeline(input)
}
