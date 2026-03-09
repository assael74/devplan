// useQuickFormManager.js
import { useState, useMemo } from 'react';

export function useQuickFormManager({ item, sections, onEdit, formProps }) {
  const GOALS_DEFAULT = { for: 0, against: 0, diff: 0 };
  const deepClone = (v) => (v && typeof v === 'object' ? JSON.parse(JSON.stringify(v)) : v);

  const initialData = useMemo(() => {
    const data = {};
    Object.values(sections).flat().forEach((key) => {
      data[key] = item?.[key] ?? '';
    });
    return data;
  }, [item, sections]);

  const [formData, setFormData] = useState(initialData);
  const [editState, setEditState] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isChanged = useMemo(() => {
    const changes = {};
    for (const [section, keys] of Object.entries(sections)) {
      changes[section] = keys.some(
        (key) => JSON.stringify(formData[key]) !== JSON.stringify(initialData[key])
      );
    }
    return changes;
  }, [formData, initialData, sections]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = (section) => {
    const keys = sections[section];
    if (!Array.isArray(keys)) return;
    setFormData((prev) => {
      const next = { ...prev };
      keys.forEach((k) => { next[k] = deepClone(initialData[k]); });
      return next;
    });
  };

  const handleToggle = (section) => {
    setEditState((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
    handleReset(section);
  };

  const handleSave = async (section) => {
    if (!isChanged[section] || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onEdit(
        { oldItem: item, newItem: { ...item, ...formData } },
        { onClose: () => setEditState((prev) => ({ ...prev, [section]: false })) }
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  //console.log(formData)
  return {
    formProps,
    formData,
    editState,
    isChanged,
    isSubmitting,
    handleChange,
    handleReset,
    handleToggle,
    handleSave,
  };
}
