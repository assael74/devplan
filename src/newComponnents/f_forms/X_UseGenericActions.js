import { useState } from 'react';

export default function useGenericActions({ initialState, validationRules, onSubmit }) {
  const [data, setData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  // ולידציה של שדה בודד עם המרה למחרוזת
  
  const validateField = (key, value) => {
    const rule = validationRules[key];
    const safeVal = String(value ?? '');
    const hasError = rule ? rule(safeVal) : false;
    setErrors((prev) => ({ ...prev, [key]: hasError }));
  };

  // ולידציה של כל הטופס
  const validateAll = (override = data) => {
    const newErrors = {};
    for (const key in validationRules) {
      const rule = validationRules[key];
      const safeVal = String(override[key] ?? '');
      newErrors[key] = rule ? rule(safeVal) : false;
    }
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  // שינוי ערך שדה
  const handleChange = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
    if (isSubmitted) validateField(key, value);
  };

  // שליחת טופס
  const handleSubmit = () => {
    setIsSubmitted(true);
    const valid = validateAll();
    if (!valid) return;
    onSubmit?.(data);
    resetForm();
  };

  // איפוס טופס
  const resetForm = (newState = initialState) => {
    setData(newState);
    setErrors({});
    setIsSubmitted(false);
  };

  const handleClose = () => resetForm();

  return {
    data,
    errors,
    isSubmitted,
    handleChange,
    handleSubmit,
    handleClose,
    resetForm,
    validateAll,
  };
}
