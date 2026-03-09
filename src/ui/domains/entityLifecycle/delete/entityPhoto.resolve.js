import { shortsUpdateRouterMap } from '../../../../services/firestore/shorts/shortsUpdateRouter.js'

export function resolvePhotoShortKey(routerEntityType) {
  return shortsUpdateRouterMap?.[routerEntityType]?.photo?.shortKey || null
}
