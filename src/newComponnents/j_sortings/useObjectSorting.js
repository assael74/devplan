import { useState, useMemo, useEffect } from 'react';
import { sortData } from './sortData';
import { getDefaultSorting } from './helpers/getDefaultSorting';

export function useObjectSorting(data, type, formProps, view = null) {
  const [sorting, setSortingState] = useState(() => getDefaultSorting(type));
  const [direction, setDirection] = useState('asc');

  const setSorting = (newSort) => {
    setSortingState((prevSort) => {
      if (prevSort === newSort) {
        // לחץ שוב על אותו מיון → הופך כיוון
        setDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        return prevSort;
      } else {
        setDirection('asc'); // ברירת מחדל לכיוון עולה
        return newSort;
      }
    });
  };

  const sortedData = useMemo(
    () => sortData(data, sorting, formProps, direction),
    [data, sorting, direction, formProps]
  );

  return {
    sorting,
    setSorting,
    direction,
    sortedData,
  };
}
