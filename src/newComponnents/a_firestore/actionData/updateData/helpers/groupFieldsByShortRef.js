import { getRefKeyForField } from './refKeyHelpers'
import { getDiffFields } from './getDiffFields';

export function groupChangedFieldsByShortRef(type, oldItem, newItem) {
  const result = {};
  const itemId = newItem?.id;
  //console.log(type, oldItem, newItem)
  // השג את ההבדלים הכלליים
  const diff = getDiffFields(oldItem, newItem);
  if (!diff) return result;

  for (const key in diff) {
    const refKey = getRefKeyForField(type, key); // למשל: "teams/info", "teams/staff"
    if (!refKey) continue;

    if (!result[refKey]) {
      result[refKey] = {};
    }

    result[refKey][key] = newItem[key];

    // תמיד כלול גם id
    if (itemId && !result[refKey].id) {
      result[refKey].id = itemId;
    }
  }
  //console.log(result)
  return result;
}

export function groupFieldsByShortRef(type, item, compareTo = null) {
  // אם יש אובייקט להשוואה, השתמש בגרסה החכמה
  if (compareTo) {
    return groupChangedFieldsByShortRef(type, compareTo, item);
  }

  // אחרת – גרסה רגילה שמחזירה את כל השדות
  const result = {};
  const itemId = item?.id;

  for (const key in item) {
    const refKey = getRefKeyForField(type, key); // לדוגמה: "clubs/info", "clubs/staff"
    if (!refKey) continue;

    if (!result[refKey]) {
      result[refKey] = {};
    }

    result[refKey][key] = item[key];

    // הוסף את id אם הוא קיים ועדיין לא קיים בחלק הזה
    if (itemId && !result[refKey].id) {
      result[refKey].id = itemId;
    }
  }

  return result;
}
