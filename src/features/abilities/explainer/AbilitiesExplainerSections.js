//  features/abilities/explainer/AbilitiesExplainerSections.js

import Sheet from '@mui/joy/Sheet'
import Stack from '@mui/joy/Stack'
import Typography from '@mui/joy/Typography'
import Chip from '@mui/joy/Chip'
import List from '@mui/joy/List'
import ListItem from '@mui/joy/ListItem'
import Divider from '@mui/joy/Divider'

import { iconUi } from '../../../ui/core/icons/iconUi.js'
import { abilitiesExplainerSx as sx } from './abilitiesExplainer.sx.js'

function renderIcon(iconId, size = 18) {
  const icon = iconUi({id: iconId})

  if (!icon) {
    console.warn('Missing iconUi id:', iconId)
    return null
  }

  return icon
}

function SectionHeader({ iconId, title }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.25 }}>
      <Sheet sx={sx.sectionHeaderIcon}>
        {renderIcon(iconId, 18)}
      </Sheet>

      <Typography level="title-lg" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
    </Stack>
  )
}

function ParagraphsBlock({ paragraphs = [] }) {
  if (!Array.isArray(paragraphs) || !paragraphs.length) return null

  return (
    <Stack spacing={1}>
      {paragraphs.map((text, index) => (
        <Typography
          key={`${index}-${text}`}
          level="body-md"
          sx={{ lineHeight: 1.85, textAlign: 'left' }}
        >
          {text}
        </Typography>
      ))}
    </Stack>
  )
}

function SectionExample({ example }) {
  if (!example?.text) return null

  return (
    <Sheet sx={sx.exampleBox}>
      {!!example?.title && (
        <Typography level="title-sm" sx={{ fontWeight: 700, mb: 0.5 }}>
          {example.title}
        </Typography>
      )}

      <Typography level="body-sm" sx={{ lineHeight: 1.75, textAlign: 'left' }}>
        {example.text}
      </Typography>
    </Sheet>
  )
}

function DomainsBlock({ domains = [] }) {
  if (!Array.isArray(domains) || !domains.length) return null

  return (
    <Stack sx={sx.domainsWrap}>
      {domains.map((domain) => (
        <Sheet key={domain.id} sx={sx.domainCard}>
          <Stack spacing={1.25}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Sheet sx={sx.domainIconWrap}>
                {renderIcon(domain.iconId, 18)}
              </Sheet>

              <Typography level="title-md" sx={{ fontWeight: 700 }}>
                {domain.title}
              </Typography>
            </Stack>

            {!!domain.description && (
              <Typography level="body-sm" sx={{ color: 'text.secondary', lineHeight: 1.7, textAlign: 'left' }}>
                {domain.description}
              </Typography>
            )}

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Chip size="sm" color='success' sx={{ borderRadius: 999 }}>
                משקל ביכולת: {domain.abilityWeight}
              </Chip>

              <Chip size="sm" color='success' sx={{ borderRadius: 999 }}>
                משקל בפוטנציאל: {domain.potentialWeight}
              </Chip>
            </Stack>

            <List sx={sx.abilitiesList}>
              {domain.abilities.map((ability) => (
                <ListItem key={ability.id} sx={{ p: 0, m: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Sheet sx={sx.abilityIconWrap}>
                      {renderIcon(ability.iconId, 16)}
                    </Sheet>

                    <Typography level="body-sm" sx={{ textAlign: 'left' }}>
                      {ability.label}
                    </Typography>
                  </Stack>
                </ListItem>
              ))}
            </List>
          </Stack>
        </Sheet>
      ))}
    </Stack>
  )
}

function DomainWeightsBlock({ title, items = [] }) {
  if (!Array.isArray(items) || !items.length) return null

  return (
    <Stack spacing={1}>
      {!!title && (
        <Typography level="title-sm" sx={{ fontWeight: 700, mt: 0.5 }}>
          {title}
        </Typography>
      )}

      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {items.map((item) => (
          <Chip
            key={item.id}
            size="md"
            color='success'
            startDecorator={renderIcon(item.id)}
            sx={{ borderRadius: 999 }}
          >
            {item.title}: {item.weight}
          </Chip>
        ))}
      </Stack>
    </Stack>
  )
}

function ScoreScaleBlock({ items = [] }) {
  if (!Array.isArray(items) || !items.length) return null

  return (
    <Stack spacing={1}>
      <Typography level="title-sm" sx={{ fontWeight: 700, mt: 0.5 }}>
        פירוש הציונים
      </Typography>

      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {items.map((item) => (
          <Chip key={item.value} size="md" color='success' sx={{ borderRadius: 999 }}>
            {item.value} — {item.label}
          </Chip>
        ))}
      </Stack>
    </Stack>
  )
}

function SimpleListBlock({ title, items = [] }) {
  if (!Array.isArray(items) || !items.length) return null

  return (
    <Stack spacing={1}>
      {!!title && (
        <Typography level="title-sm" sx={{ fontWeight: 700, mt: 0.5 }}>
          {title}
        </Typography>
      )}

      <List sx={sx.simpleList}>
        {items.map((text, index) => (
          <ListItem key={`${index}-${text}`} sx={{ p: 0, m: 0 }}>
            <Typography level="body-sm" sx={{ lineHeight: 1.75, textAlign: 'left' }}>
              {text}
            </Typography>
          </ListItem>
        ))}
      </List>
    </Stack>
  )
}

function RulesBlock({ title, rules = [] }) {
  if (!Array.isArray(rules) || !rules.length) return null

  return (
    <Stack spacing={1}>
      {!!title && (
        <Typography level="title-sm" sx={{ fontWeight: 700, mt: 0.5 }}>
          {title}
        </Typography>
      )}

      <Stack spacing={1}>
        {rules.map((rule) => (
          <Sheet key={rule.id} sx={sx.ruleCard}>
            <Typography level="body-sm" sx={{ lineHeight: 1.75, textAlign: 'left' }}>
              <strong>{rule.label}:</strong> {rule.value}
            </Typography>
          </Sheet>
        ))}
      </Stack>
    </Stack>
  )
}

function DevelopmentNoteBlock({ title, text }) {
  if (!text) return null

  return (
    <Sheet sx={sx.developmentNoteBox}>
      {!!title && (
        <Typography level="title-sm" sx={{ fontWeight: 700, mt: 0.5 }}>
          {title}
        </Typography>
      )}

      <Typography level="body-sm" sx={{ lineHeight: 1.75, textAlign: 'left' }}>
        {text}
      </Typography>
    </Sheet>
  )
}

function DevelopmentAdjustmentsBlock({ rows = [] }) {
  if (!Array.isArray(rows) || !rows.length) return null

  return (
    <Stack spacing={1}>
      <Typography level="title-sm" sx={{ fontWeight: 700, mt: 0.5 }}>
        השפעת שלב ההתפתחות על הפוטנציאל
      </Typography>

      <Stack spacing={1}>
        {rows.map((row) => {
          const physicalPrefix = row.physicalAdjustment > 0 ? '+' : ''
          const finalPrefix = row.finalPotentialAdjustment > 0 ? '+' : ''

          return (
            <Sheet key={row.id} sx={sx.ruleCard}>
              <Typography level="body-sm" sx={{ lineHeight: 1.75, textAlign: 'left' }}>
                שלב {row.stage}: פירוש פיזי {physicalPrefix}
                {row.physicalAdjustment}, פוטנציאל סופי {finalPrefix}
                {row.finalPotentialAdjustment}
              </Typography>
            </Sheet>
          )
        })}
      </Stack>
    </Stack>
  )
}

function ReliabilityLevelsBlock({ levels = [] }) {
  if (!Array.isArray(levels) || !levels.length) return null

  return (
    <Stack spacing={1}>
      <Typography level="title-sm" sx={{ fontWeight: 700, mt: 0.5 }}>
        רמות מהימנות
      </Typography>

      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {levels.map((level) => (
          <Chip key={level.id} size="md" color='success' sx={{ borderRadius: 999 }}>
            {level.label}
          </Chip>
        ))}
      </Stack>
    </Stack>
  )
}

function SectionCard({ section, isLast }) {
  return (
    <Sheet sx={sx.sectionCard}>
      <Stack spacing={1.5}>
        <SectionHeader iconId={section.iconId} title={section.title} />

        <ParagraphsBlock paragraphs={section.paragraphs} />

        <DomainsBlock domains={section.domains} />

        <DomainWeightsBlock
          title={section.domainWeights?.length ? 'משקלי התחומים' : ''}
          items={section.domainWeights}
        />

        <ScoreScaleBlock items={section.items} />

        <SimpleListBlock
          title={section.insideWindowTitle}
          items={section.insideWindowItems}
        />

        <RulesBlock
          title={section.mergeRulesTitle}
          rules={section.mergeRules}
        />

        <DevelopmentNoteBlock
          title={section.developmentNoteTitle}
          text={section.developmentNote}
        />

        <DevelopmentAdjustmentsBlock rows={section.developmentAdjustments} />

        <ReliabilityLevelsBlock levels={section.levels} />

        <SectionExample example={section.example} />
      </Stack>

      {!isLast && <Divider sx={{ mt: 2, opacity: 0.35 }} />}
    </Sheet>
  )
}

export default function AbilitiesExplainerSections({ sections = [] }) {
  if (!Array.isArray(sections) || !sections.length) return null

  return (
    <Stack sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {sections.map((section, index) => (
        <SectionCard
          key={section.id}
          section={section}
          isLast={index === sections.length - 1}
        />
      ))}
    </Stack>
  )
}
