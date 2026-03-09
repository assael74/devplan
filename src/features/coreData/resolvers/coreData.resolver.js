/// src/features/coreData/resolvers/coreData.resolver.js
/**
 * Wrapper עבור מנוע הנתונים החדש.
 * משאיר את ה-API של resolveCoreData זהה
 * כך ששאר המערכת לא תצטרך שינוי.
 */
export { resolveCoreDataNext as resolveCoreData } from '../resolve/coreData.resolver.next.js'
