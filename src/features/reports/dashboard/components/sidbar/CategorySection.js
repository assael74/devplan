// src/features/reports/dashboard/components/sidbar/CategorySection.js

import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { CollapseBox } from '../../../../../ui/patterns/collapseBox/index.js'
import { categorySx as sx } from './sx/category.sx.js'

export default function CategorySection({
  categoryOptions = [],
  selectedCategoryId = 'all',
  onCategorySelect,
}) {
  return (
    <Box sx={sx.categorySection}>
      <Typography level='body-xs' sx={sx.sectionTitle}>
        קטגוריות
      </Typography>

      <Box sx={sx.categoryList}>
        {categoryOptions.map(option => {
          const selected = selectedCategoryId === option.id

          return (
            <Box
              key={option.id}
              role='button'
              tabIndex={0}
              onClick={() => onCategorySelect(option.id)}
              onKeyDown={event => {
                if (event.key !== 'Enter' && event.key !== ' ') return

                event.preventDefault()
                onCategorySelect(option.id)
              }}
              sx={sx.categoryRow(selected)}
            >
              <Box sx={sx.categoryMain}>
                <Box sx={sx.categoryIcon(selected)}>
                  {iconUi({ id: option.idIcon || 'report', size: 'sm' })}
                </Box>

                <Typography level='body-sm' sx={sx.categoryLabel(selected)}>
                  {option.label}
                </Typography>
              </Box>

              <Box sx={sx.categoryCount(selected)}>
                {option.count}
              </Box>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
