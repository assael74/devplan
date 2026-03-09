import { shortsUpdateRouter } from '../shortsUpdateRouter';

const DEBUG_ROUTER = false; // שנה ל-true לפיתוח

// 🧾 שדות שלא אמורים להיבדק בכלל
const ignoreFields = ['id', 'created'];

export function getRefKeyForField(type, fieldName) {
  const baseType = type?.split("/")?.[0];
  
  // ⛔ שדות מוחרגים
  if (ignoreFields.includes(fieldName)) {
    if (DEBUG_ROUTER) {
      console.debug(`[getRefKeyForField] ⏭ שדה "${fieldName}" מוחרג מהבדיקה`);
    }
    return null;
  }

  const router = shortsUpdateRouter?.[baseType];

  if (!router) {
    if (DEBUG_ROUTER) {
      console.warn(`[getRefKeyForField] ❌ router לא נמצא עבור baseType: "${baseType}" (type="${type}")`);
    }
    return null;
  }

  const fieldInfo = router?.[fieldName];

  if (!fieldInfo) {
    if (DEBUG_ROUTER) {
      console.warn(`[getRefKeyForField] ⚠️ השדה "${fieldName}" לא מוגדר בתוך "${baseType}"`, {
        availableFields: Object.keys(router),
      });
    }
    return null;
  }

  const { category, subCategory } = fieldInfo;

  if (!category || !subCategory) {
    if (DEBUG_ROUTER) {
      console.warn(`[getRefKeyForField] ⚠️ חסרים category או subCategory עבור "${fieldName}" בתוך "${baseType}"`, fieldInfo);
    }
    return null;
  }
  //console.log(`${category}/${subCategory}`)
  return `${category}/${subCategory}`;
}
