const norm = (s) => String(s ?? '').trim().toLowerCase();

function matchMonthYear(value = '', filter = '') {
  if (!value || !filter) return false;
  const monthYearRegex = /^\d{2}-\d{4}$/;
  if (!monthYearRegex.test(value)) return false;
  if (/^\d{4}$/.test(filter)) return value.endsWith(`-${filter}`);
  return value === filter;
}

function compareFilter(item, filterVal, key) {
  //console.log(filterVal, key, item)
  if (filterVal === 'all' || filterVal === '' || filterVal === undefined || filterVal === null) {
    return true;
  }

  if (key === 'clubName') {
    const wantedId = String(filterVal);
    const candidateId =
      item?.clubId != null ? String(item.clubId)
      : item?.club?.id != null ? String(item.club.id)
      : item?.club_id != null ? String(item.club_id)
      : '';
    return candidateId === wantedId;
  }

  if (key === 'teamName') {
    const wantedId = String(filterVal);
    const candidateId =
      item?.teamId != null ? String(item.teamId)
      : item?.team?.id != null ? String(item.team.id)
      : item?.team_id != null ? String(item.team_id)
      : '';
    return candidateId === wantedId;
  }

  const itemVal = item?.[key];

  if (key === 'projectStatus') {
    const val = (item?.projectStatus ?? '').trim();
    if (filterVal === true) return val !== '';
    if (filterVal === false) return val === '';
    return true;
  }

  if (typeof itemVal === 'object' && itemVal !== null && 'id' in itemVal) {
    return String(itemVal.id) === String(filterVal);
  }

  if (Array.isArray(itemVal)) {
    return itemVal.some(v => {
      if (typeof v === 'object' && v !== null && 'id' in v) {
        return String(v.id) === String(filterVal);
      }
      return String(v).trim() === String(filterVal).trim();
    });
  }

  if (typeof itemVal === 'boolean') {
    return itemVal === (filterVal === 'true' || filterVal === true);
  }

  if (typeof itemVal === 'number') {
    return itemVal === Number(filterVal);
  }

  if (typeof itemVal === 'string' && /^\d{2}-\d{4}$/.test(itemVal)) {
    return matchMonthYear(itemVal, filterVal);
  }

  return String(itemVal ?? '').trim() === String(filterVal).trim();
}

export function filterData(data = [], filters = {}) {
  return data.filter((item) =>
    Object.entries(filters).every(([key, val]) => compareFilter(item, val, key))
  );
}
