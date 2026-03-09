import { Button, Typography, Box, Chip, Avatar, Divider } from '@mui/joy';
import { statsParmOptions, statsParmTypeFieldOptions } from '../../../../x_utils/statsUtils.js';
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex.js'

export const getStatsParmRowStructure = (isMobile, newActions, formProps, { type }, view) => {
  const handleOpenDialog = newActions.handleOpenDialog;
  const typeItem = (item) => statsParmOptions.find((p) => p.id === item.statsParmType) || {};
  const typeFieldItem = (item) => statsParmTypeFieldOptions.find((p) => p.id === item.statsParmFieldType) || {};
  const mainRow = [
    {
      id: 'statsParmName',
      label: 'שם הפרמטר',
      tooltip: 'שם הפרמטר',
      iconId: 'name',
      width: '50%',
      render: (item) => `${item.statsParmName}`
    },
    {
      id: 'statsParmType',
      label: 'סוג פרמטר',
      tooltip: 'סוג הפרמטר',
      iconId: 'statsParm',
      width: '20%',
      render: (item) => {
        return isMobile ? iconUi({id: typeItem(item).idIcon}) : `${typeItem(item).labelH}`
      }
    },
    {
      id: 'isDefault',
      label: 'ברירת מחדל',
      tooltip: 'האם הפאמטר ברירת מחדל',
      iconId: 'statsParm',
      width: '10%',
      render: (item) => item.isDefault ?
        iconUi({ id:'isDefault', sx: { color: '#4caf50' }} ) : iconUi({id: 'isDefault', sx: { color: '#9e9e9e' } }),
    },
    {
      id: 'order',
      label: 'סדר',
      tooltip: 'תיעדוף הפרמטר',
      iconId: 'order',
      width: '10%',
      render: (item) => item.order
    },
  ];

  const expandedRow = [
    {
      id: 'statsParmExpanded',
      render: (item) => {
        return <Box>אין מידע נוסף</Box>
      }
    },
  ];

  return { mainRow, expandedRow };
};
