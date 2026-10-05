// src/features/playersDatabase/ui/components/modals/paste/TeamSeasonChoiceCards.js

import { RadioGroup } from '@mui/joy'

import gameSeasonImage from '../../../../../../ui/core/images/modals/gameSeason.png'
import ImportChoiceCard from './ImportChoiceCard.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

export default function TeamSeasonChoiceCards({
  seasonOptions = [],
  activeSeasonOptionKey = '',
  value = '',
  onChange,
  sx,
}) {
  const options = Array.isArray(seasonOptions) ? seasonOptions : []
  const selectedOption = options.find(option => (
    clean(option?.optionKey) === clean(value)
  )) || options.find(option => (
    clean(option?.optionKey) === clean(activeSeasonOptionKey)
  )) || options[0] || null
  const cards = options.length
    ? options
    : [{
      optionKey: 'unavailable-season',
      seasonKey: 'עונה נוספת',
      unavailable: true,
    }]

  return (
    <RadioGroup
      value={clean(selectedOption?.optionKey)}
      sx={sx}
      onChange={event => onChange?.(event.target.value)}
    >
      {cards.map(option => {
        const selected = clean(option?.optionKey) === clean(selectedOption?.optionKey)
        const isPageSeason = clean(option?.optionKey) === clean(activeSeasonOptionKey)
        const disabled = Boolean(option.unavailable)
        return (
          <ImportChoiceCard
            key={option.optionKey}
            value={option.optionKey}
            label={option.seasonKey || 'עונה'}
            description={disabled
              ? 'לא קיימת עונה נוספת לקבוצה זו.'
              : [
                  option.leagueName,
                  isPageSeason ? 'העונה המוצגת בעמוד' : '',
                ].filter(Boolean).join(' · ')}
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
