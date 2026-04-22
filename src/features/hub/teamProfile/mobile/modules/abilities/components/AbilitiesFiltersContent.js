// teamProfile/mobile/modules/abilities/components/AbilitiesFiltersContent.js

import {
  Box,
  Card,
  Switch,
  FormLabel,
  CardContent,
  FormControl,
  FormHelperText
} from '@mui/joy'

import AbilitiesMultiSelectField from '../../../../../../../ui/fields/selectUi/abilities/AbilitiesMultiSelectField.js'

export default function AbilitiesFiltersContent({
  selectedDomains,
  onChangeSelectedDomains,
  showOnlyFilled,
  onToggleShowOnlyFilled,
}) {
  return (
    <Box sx={{ display: 'grid', gap: 1.25 }}>
      <AbilitiesMultiSelectField
        value={selectedDomains || []}
        onChange={(value) => onChangeSelectedDomains(value || [])}
        placeholder="בחירת דומיינים לצפייה"
        clearableChips
        fieldWidth="100%"
      />

      <Card variant="soft" sx={{ borderRadius: '14px' }}>
        <CardContent sx={{ py: 1.25 }}>
          <FormControl orientation="horizontal" sx={{ justifyContent: 'space-between', gap: 1 }}>
            <Box>
              <FormLabel sx={{ mb: 0.25 }}>הצג רק abilities מלאים</FormLabel>
              <FormHelperText>הסתרת שורות ללא ציון בפועל</FormHelperText>
            </Box>

            <Switch
              checked={!!showOnlyFilled}
              onChange={(event) => onToggleShowOnlyFilled(event.target.checked)}
            />
          </FormControl>
        </CardContent>
      </Card>
    </Box>
  )
}
