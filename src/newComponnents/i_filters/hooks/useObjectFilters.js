// hooks/useObjectFilters.js
import { useMemo, useState, useEffect } from 'react';
import { filterData } from '../filterData';
import { getDefaultFilters } from '../getDefaultFilters';

export function useObjectFilters(data, type, formProps) {
  const [filters, setFilters] = useState(() => getDefaultFilters(type, formProps));

  useEffect(() => {
    if (!filters || Object.keys(filters).length === 0) {
      setFilters(getDefaultFilters(type, formProps));
    }
  }, [type]);

  const handleFilterChange = (key, val) =>
    setFilters((prev) => ({ ...prev, [key]: val }));

  const handleResetFilters = () => {
    setFilters(getDefaultFilters(type, formProps));
  };

  const filteredData = useMemo(() => filterData(data, filters), [data, filters]);

  const filteredVisibleData = useMemo(
    () =>
      (filteredData || []).filter(
        (item) => item && typeof item === 'object' && item.id && item.id !== '__loading__'
      ),
    [filteredData]
  );

  const hasFilteredData = filteredVisibleData.length > 0;

  const hasActiveFilters = Object.values(filters).some(
    (val) => val !== 'all' && val !== ''
  );

  return {
    filters,
    setFilters,
    handleFilterChange,
    handleResetFilters,
    filteredVisibleData,
    hasFilteredData,
    hasActiveFilters,
  };
}
