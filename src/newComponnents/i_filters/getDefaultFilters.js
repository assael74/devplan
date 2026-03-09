import { getFilterOptions } from './filterOptions';

export function getDefaultFilters(type, formProps) {
  const defaults = {};

  (getFilterOptions(formProps)[type] || []).forEach(item => {
    const { id, value } = item;
    // שמור את הערך הראשון מסוג 'all' עבור כל id ייחודי
    if (!(id in defaults) && value === 'all') {
      defaults[id] = value;
    }
  });

  return defaults;
}
