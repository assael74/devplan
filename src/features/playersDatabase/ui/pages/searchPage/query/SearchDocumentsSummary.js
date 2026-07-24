// features/playersDatabase/ui/pages/searchPage/query/SearchDocumentsSummary.js

import {
  Box,
  Button,
  Chip,
  ChipDelete,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import SearchQuerySection from './SearchQuerySection.js'
import { searchDocumentsSummarySx as sx } from './sx/searchDocumentsSummary.sx.js'

export default function SearchDocumentsSummary({
  count = 0,
  activeItems = [],
  loading = false,
  error = null,
  onRemoveItem,
  onLoad,
}) {
  const handleRemoveItem = item => {
    if (typeof onRemoveItem !== 'function') {
      return
    }

    onRemoveItem(item)
  }

  return (
    <SearchQuerySection
      title='מסמכים זמינים'
      step='04'
      contentSx={sx.sectionContent}
    >
      <Stack sx={sx.root}>
        <Box sx={sx.countCard}>
          <Typography level='body-xs' sx={sx.label}>
            כמות מסמכים
          </Typography>

          {loading ? (
            <CircularProgress size='sm' />
          ) : (
            <Typography level='h1' sx={sx.value}>
              {count || 0}
            </Typography>
          )}

          <Typography level='body-xs' sx={sx.description}>
            הספירה מבוצעת לפני שליפת המסמכים המלאים.
          </Typography>

          {error && (
            <Typography level='body-xs' color='danger'>
              לא ניתן לחשב את כמות המסמכים.
            </Typography>
          )}
        </Box>

        <Box
          className='dpScrollThin'
          sx={sx.activeItems}
        >
          {activeItems.length > 0 ? (
            activeItems.map(item => (
              <Chip
                key={item.key}
                size='sm'
                variant='soft'
                sx={sx.chip}
                endDecorator={
                  <ChipDelete
                    aria-label={`הסרת ${item.label}`}
                    sx={sx.removeChipButton}
                    onDelete={() => handleRemoveItem(item)}
                  >
                    {iconUi({
                      id: 'close',
                      size: 'xs',
                    })}
                  </ChipDelete>
                }
              >
                {item.label}
              </Chip>
            ))
          ) : (
            <Typography level='body-xs' sx={sx.emptyItems}>
              פרמטרים שנבחרו יופיעו כאן.
            </Typography>
          )}
        </Box>

        <Button
          size='sm'
          variant='solid'
          startDecorator={iconUi({
            id: 'upload',
            size: 'sm',
          })}
          sx={sx.loadButton}
          loading={loading}
          disabled={loading || count === 0}
          onClick={onLoad}
        >
          טעינת מסמכים
        </Button>
      </Stack>
    </SearchQuerySection>
  )
}
