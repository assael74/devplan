import * as React from 'react';
import { drawerProps, drawerSheetProps } from './X_Style'
import {
  Drawer,
  Sheet,
  Stack,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  ModalClose,
  Divider,
  FormControl,
  Checkbox,
  Button,
  Box
} from '@mui/joy';
import { iconUi } from '../../b_styleObjects/icons/IconIndex';

export default function StatsFieldSelectorDialog({
  open,
  onClose,
  actionIcon,
  selected = [],
  allFields = [],
  existingIds = [],
  onApply = () => {},
}) {
  const [localSelected, setLocalSelected] = React.useState([]);

  React.useEffect(() => {
    const base = new Set([...(selected || []), ...(existingIds || [])]);
    setLocalSelected([...base]);
  }, [open, selected, existingIds]);

  const handleToggle = (id) => {
    setLocalSelected((prev) =>
       prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
     );
  };

  const sortedFields = [...allFields]
    .filter((field) => !field.id.toLowerCase().includes('rate'))
    .sort((a, b) => {
      const getScore = (item) => {
        const type = item.type || 'number';
        if (type === 'number') return 0;
        if (type === 'boolean') return 1;
        return 2;
      };
      return getScore(a) - getScore(b);
    });

  return (
    <>
      {actionIcon}
      <Drawer open={open} onClose={onClose} {...drawerProps}>
        <Sheet {...drawerSheetProps}>
          <DialogTitle>בחר שדות סטטיסטיים נוספים</DialogTitle>
          <ModalClose />
          <DialogContent>
            <Box role="group" aria-labelledby="extra-fields-label">
               <Typography id="extra-fields-label" level="body-sm" sx={{ my: 1, fontSize: '12px' }}>
                 שדות שאינם ברירת מחדל:
               </Typography>
               <Stack spacing={1} px={1}>
                 {sortedFields.map((field, index) => {
                   const isTriplet = field.type === 'triplet';
                   const fieldId = `extra-field-${field.id}-${index}`;
                   return (
                     <Checkbox
                       id={fieldId}                // ← לא מספר, שיהיה ייחודי ונגיש
                       key={fieldId}
                       checked={localSelected.includes(field.id)}
                       onChange={() => handleToggle(field.id)}
                       label={
                         <Stack direction="row" spacing={1} alignItems="center">
                           <span>{field.label}</span>
                           {isTriplet && iconUi({ id: 'triplet' })}
                         </Stack>
                       }
                       onClick={(e) => e.stopPropagation()}
                     />
                   );
                 })}
               </Stack>
            </Box>
          </DialogContent>

          <DialogActions sx={{ justifyContent: 'space-between', mt: 2 }}>
            <Button variant="plain" color="neutral" onClick={onClose}>
              ביטול
            </Button>
            <Button
              variant="solid"
              onClick={() => {
                onApply(localSelected);
                onClose();
              }}
            >
              אישור
            </Button>
          </DialogActions>
        </Sheet>
      </Drawer>
    </>
  );
}
