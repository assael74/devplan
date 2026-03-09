import React, { useState, useEffect } from 'react';
import { Modal, ModalDialog, ModalClose, Typography, Stack, FormControl, FormLabel, Input, Button } from '@mui/joy';

export default function DesktopParentFormModal({ open, onClose, onSubmit, initialData = {} }) {
  const [formData, setFormData] = useState({
    parentRole: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    parentPhoto: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setFormData({
        parentRole: initialData?.parentRole || '',
        parentName: initialData?.parentName || '',
        parentEmail: initialData?.parentEmail || '',
        parentPhone: initialData?.parentPhone || '',
      });
      setErrors({});
    }

    // אם סגרו את המודל – אפס גם
    if (!open) {
      setFormData({
        parentRole: '',
        parentName: '',
        parentEmail: '',
        parentPhone: '',
      });
      setErrors({});
    }
  }, [open, initialData]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prevErrors) => {
        const updated = { ...prevErrors };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleSubmit = () => {
    const newErrors = {};
    if (!formData.parentName?.trim()) newErrors.parentName = 'יש להזין שם';
    if (!formData.parentRole?.trim()) newErrors.parentRole = 'יש להזין תפקיד (אמא / אבא)';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog size="md" layout="center">
        <ModalClose />
        <Typography level="h4" fontWeight="lg" mb={1}>
          {initialData?.parentName ? 'עריכת פרטי הורה' : 'הוספת הורה חדש'}
        </Typography>
        <Stack spacing={2} mt={2}>
          <FormControl>
            <FormLabel>שם מלא</FormLabel>
            <Input
              required
              value={formData.parentName}
              onChange={handleChange('parentName')}
              placeholder="שם ההורה"
              autoFocus
              autoComplete="off"
              error={Boolean(errors.parentName)}
              color={errors.parentName ? 'danger' : 'neutral'}
            />
          </FormControl>
          <FormControl>
            <FormLabel>אימייל</FormLabel>
            <Input
              type="email"
              autoComplete="off"
              value={formData.parentEmail}
              onChange={handleChange('parentEmail')}
              placeholder="email@example.com"
            />
          </FormControl>
          <FormControl>
            <FormLabel>טלפון</FormLabel>
            <Input
              type="tel"
              autoComplete="off"
              value={formData.parentPhone}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '');
                if (raw.length <= 10) {
                  handleChange('parentPhone')({ target: { value: raw } });
                }
              }}
              placeholder="050-1234567"
              maxLength={10}
            />
          </FormControl>
          <FormControl>
            <FormLabel>הורה</FormLabel>
            <Input
              required
              autoComplete="off"
              value={formData.parentRole}
              onChange={handleChange('parentRole')}
              placeholder="אמא / אבא"
              error={Boolean(errors.parentRole)}
              color={errors.parentRole ? 'danger' : 'neutral'}
            />
          </FormControl>
          <Stack direction="row" justifyContent="space-between" mt={2}>
            <Button variant="plain" color="neutral" onClick={onClose}>
              ביטול
            </Button>
            <Button onClick={handleSubmit}>שמור</Button>
          </Stack>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}
