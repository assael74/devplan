// ../inputUi/X_utility.js
export const setProManByRole = ({ role, newData, proMan = [] }) => {
  const isEmpty =
    !newData.fullName?.trim() &&
    !newData.phone?.trim() &&
    !newData.photo?.trim();

  const index = proMan.findIndex((p) => p.role === role);

  if (index !== -1) {
    if (isEmpty) {
      // מחיקה – מחזיר מערך ריק אם לא נשארו תפקידים
      const filtered = proMan.filter((p) => p.role !== role);
      return filtered.length ? filtered : [];
    }
    const clone = [...proMan];
    clone[index] = { ...clone[index], ...newData, role };
    return clone;
  }

  // אם לא קיים, נוסיף – רק אם לא ריק
  if (!isEmpty) return [...proMan, { ...newData, role }];

  // אם לא קיים וכל השדות ריקים – מחזיר מערך ריק במקום undefined
  return [];
};

export const getProManByRole = (role, proMan = []) =>
  proMan.find((p) => p.role === role) || {
    role,
    fullName: '',
    phone: '',
    photo: '',
  };
