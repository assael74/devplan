import { Box, RadioGroup } from '@mui/joy'

import gameSeasonImage from '../../../../../../ui/core/images/modals/gameSeason.png'
import ImportChoiceCard from './ImportChoiceCard.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

// Import actions are always performed for the season visible in Team Page.
// A second card makes the page context explicit without allowing a modal to
// silently load data into another season.
export default function TeamSeasonChoiceCards({
  seasonOptions = [],
  activeSeasonOptionKey = '',
  value = '',
  onChange,
  sx,
}) {
  const options = Array.isArray(seasonOptions) ? seasonOptions : []
  const activeOption = options.find(option => (
    clean(option?.optionKey) === clean(activeSeasonOptionKey)
  )) || options.find(option => clean(option?.optionKey) === clean(value)) || options[0] || null
  const alternativeOption = options.find(option => (
    clean(option?.optionKey) && clean(option?.optionKey) !== clean(activeOption?.optionKey)
  )) || null
  const cards = [
    activeOption,
    alternativeOption || {
      optionKey: 'unavailable-season',
      seasonKey: 'עונה נוספת',
      unavailable: true,
    },
  ].filter(Boolean)

  return (
    <RadioGroup
      value={clean(activeOption?.optionKey)}
      sx={sx}
      onChange={event => onChange?.(event.target.value)}
    >
      {cards.map(option => {
        const selected = clean(option?.optionKey) === clean(activeOption?.optionKey)
        const disabled = !selected
        return (
          <ImportChoiceCard
            key={option.optionKey}
            value={option.optionKey}
            label={option.seasonKey || 'עונה'}
            description={disabled
              ? option.unavailable
                ? 'לא קיימת עונה נוספת לקבוצה זו.'
                : 'עבור לטאב שלה בעמוד הקבוצה.'
              : option.leagueName || 'זו העונה שנבחרה בעמוד הקבוצה.'}
            image={gameSeasonImage}
            selected={selected}
            disabled={disabled}
            size='compact'
          />
        )
      })}
    </RadioGroup>
  )
}
