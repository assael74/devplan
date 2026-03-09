import { sortOptions } from '../sortOptions';

export function getDefaultSorting(type) {
  const defaultOption = sortOptions.find(opt => opt.applicableTo.objects.includes(type));
  return defaultOption?.id || 'byClub';
}
