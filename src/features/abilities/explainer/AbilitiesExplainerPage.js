//  features/abilities/explainer/AbilitiesExplainerPage.js

import { useMemo } from 'react'
import { Sheet, Box, Stack, Typography }from '@mui/joy'

import { buildAbilitiesExplainerSections } from '../../../shared/abilities/explainer/abilitiesExplainer.logic.js'
import AbilitiesExplainerSections from './AbilitiesExplainerSections.js'
import JoyStarRatingStatic from '../../../ui/domains/ratings/JoyStarRating.js'
import { abilitiesExplainerSx as sx } from './abilitiesExplainer.sx.js'

export default function AbilitiesExplainerPage() {
  const sections = useMemo(() => buildAbilitiesExplainerSections(), [])

  return (
    <Sheet sx={sx.page}>
      <Sheet sx={sx.hero}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
            <Typography level="h2" sx={{ fontWeight: 700, textAlign: 'left' }}>
              הסבר על תהליך הדירוג
            </Typography>

            <JoyStarRatingStatic value={5} />
          </Box>


          <Typography level="body-md" sx={{ color: 'text.secondary', lineHeight: 1.8, textAlign: 'left' }}>
            כאן אפשר לראות בצורה ברורה איך מחושבים ציון היכולת, ציון הפוטנציאל,
            חלונות הדיווח ומהימנות התוצאה.
          </Typography>
        </Box>
      </Sheet>

      <Box sx={{ height: '100vh', minHeight: 0, overflow: 'auto', scrollbarGutter: 'stable', pb: 25 }} className='dpScrollThin'>
        <AbilitiesExplainerSections sections={sections} />
      </Box>
    </Sheet>
  )
}
