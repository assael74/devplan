// src/features/playersDatabase/ui/pages/playerPage/scout/PlayerScoutSummary.js

import * as React from 'react'
import {
  Box,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import RegularModal from '../../../components/modals/RegularModal.js'
import {
  resolveProfileStrengthTone,
  scoutDecisionTokens,
} from '../../../components/scout/scoutDecisionTokens.js'
import { playerScoutOverviewSx as sx } from '../sx/playerScoutOverview.sx.js'
import { formatNarrativeTextNumbers } from '../../../logic/narrativeText.logic.js'

function firstParagraph(value) {
  return String(value || '')
    .split(/\n\s*\n/)
    .map(item => item.trim())
    .filter(Boolean)[0] || ''
}

function formatPoints(value) {
  const number = Number(value)
  if (!Number.isFinite(number) || number === 0) return '0'

  return `${number > 0 ? '+' : ''}${number}`
}

function resolveFactorTone(factor) {
  if (factor?.type === 'reduction') return scoutDecisionTokens.immediacy.remove
  if (factor?.type === 'boost') return scoutDecisionTokens.immediacy.priority
  if (factor?.type === 'not_applicable') return scoutDecisionTokens.immediacy.unknown
  return scoutDecisionTokens.immediacy.watch
}

function resolveFactorIcon(factor) {
  if (factor?.type === 'reduction') return 'remove'
  if (factor?.type === 'boost') return 'check'
  return 'info'
}

function resolveFactorValue(factor) {
  if (factor?.type === 'not_applicable') return 'לא נבדק'
  if (factor?.points === null || factor?.points === undefined) return 'מידע'

  return formatPoints(factor.points)
}

function ImmediacyDetails({ open, interest = {}, onClose }) {
  const factors = Array.isArray(interest.factors) ? interest.factors : []
  const baseTone = scoutDecisionTokens.immediacy[interest.baseStatus] || scoutDecisionTokens.immediacy.unknown
  const automaticTone = scoutDecisionTokens.immediacy[interest.automaticStatus] || scoutDecisionTokens.immediacy.unknown
  const positiveCount = Number(interest.boostCount) || 0
  const noChangeCount = Number(interest.noChangeCount) || 0
  const reductionCount = Number(interest.reductionCount) || 0

  return (
    <RegularModal
      open={open}
      title='למה נקבעה רמת העניין?'
      description='הפירוט מציג את כל התנאים שהמנוע בחן: מה תרם, מה נבדק ולא התקיים, מה הפחית ומה לא היה רלוונטי לבדיקה.'
      iconId='priorityHigh'
      size='sm'
      hideFooter
      onClose={onClose}
    >
      <Box sx={sx.immediacyModalBody}>
        <Box sx={sx.immediacyStatusFlow}>
          <Box sx={sx.immediacyStatusItem(baseTone)}>
            <Typography level='body-xs' sx={sx.immediacyModalLabel}>
              נקודת פתיחה
            </Typography>
            <Typography level='title-sm' sx={sx.immediacyModalValue(baseTone)}>
              {interest.baseLabel || 'לא נקבעה'}
            </Typography>
          </Box>

          <Box sx={sx.immediacyFlowScore(automaticTone)}>
            <Typography level='title-md'>
              {formatPoints(interest.netScore)}
            </Typography>
            <Typography level='body-xs'>נטו</Typography>
          </Box>

          <Box sx={sx.immediacyStatusItem(automaticTone)}>
            <Typography level='body-xs' sx={sx.immediacyModalLabel}>
              החלטה אוטומטית
            </Typography>
            <Typography level='title-sm' sx={sx.immediacyModalValue(automaticTone)}>
              {interest.automaticLabel || interest.label}
            </Typography>
          </Box>
        </Box>

        {factors.length ? (
          <Box sx={sx.immediacyModalReasons}>
            {factors.map(factor => {
              const tone = resolveFactorTone(factor)
              const hasPoints = factor.points !== null && factor.points !== undefined

              return (
                <Box key={`${factor.type}_${factor.id}`} sx={sx.immediacyModalReason(tone)}>
                  <Box sx={sx.immediacyModalReasonIcon(tone)}>
                    {iconUi({id: resolveFactorIcon(factor), size: 'sm'})}
                  </Box>

                  <Box>
                    <Typography level='body-sm' sx={sx.immediacyModalReasonText}>
                      {factor.label}
                    </Typography>
                    <Typography level='body-xs' sx={sx.immediacyModalLabel}>
                      {factor.resultLabel || (hasPoints ? 'נבדק' : 'מידע')}
                    </Typography>
                  </Box>

                  <Box sx={sx.immediacyFactorPoints(tone)}>
                    {resolveFactorValue(factor)}
                  </Box>
                </Box>
              )
            })}
          </Box>
        ) : (
          <Typography level='body-sm' sx={sx.immediacyModalEmpty}>
            אין כרגע גורמים נוספים להצגה.
          </Typography>
        )}

        <Box sx={sx.immediacyScoreSummary(automaticTone)}>
          <Box>
            <Typography level='body-xs' sx={sx.immediacyModalLabel}>
              גורמים חיוביים
            </Typography>
            <Typography level='title-sm' sx={sx.immediacyScoreValue}>
              {positiveCount} · {formatPoints(interest.boostScore)}
            </Typography>
          </Box>

          <Box>
            <Typography level='body-xs' sx={sx.immediacyModalLabel}>
              נבדקו ללא ניקוד
            </Typography>
            <Typography level='title-sm' sx={sx.immediacyScoreValue}>
              {noChangeCount}
            </Typography>
          </Box>

          <Box>
            <Typography level='body-xs' sx={sx.immediacyModalLabel}>
              הפחתות
            </Typography>
            <Typography level='title-sm' sx={sx.immediacyScoreValue}>
              {reductionCount} · {interest.reductionScore ? `-${Math.abs(interest.reductionScore)}` : '0'}
            </Typography>
          </Box>

          <Box>
            <Typography level='body-xs' sx={sx.immediacyModalLabel}>
              שינוי נטו
            </Typography>
            <Typography level='title-sm' sx={sx.immediacyScoreValue}>
              {formatPoints(interest.netScore)}
            </Typography>
          </Box>
        </Box>

        {interest.isManual ? (
          <Box sx={sx.immediacyManualBox}>
            <Chip
              size='sm'
              variant='soft'
              color='warning'
              startDecorator={iconUi({id: 'edit', size: 'xs'})}
            >
              החלטה ידנית גוברת
            </Chip>

            {interest.manualReason ? (
              <Typography level='body-sm' sx={sx.manualReasonText}>
                {interest.manualReason}
              </Typography>
            ) : null}
          </Box>
        ) : null}
      </Box>
    </RegularModal>
  )
}

function StrengthDetails({ open, profileStrength = {}, onClose }) {
  const rules = Array.isArray(profileStrength.rules) ? profileStrength.rules : []
  const tone = resolveProfileStrengthTone(profileStrength.depthPct)

  return (
    <RegularModal
      open={open}
      title='איך נקבע החוזק המקצועי?'
      description='החוזק מבטא כמה עמוק השחקן עבר את תנאי הפרופיל הראשי.'
      iconId='completed'
      size='sm'
      hideFooter
      onClose={onClose}
    >
      <Box sx={sx.strengthModalBody}>
        <Box sx={sx.strengthModalHeadline(tone)}>
          <Box>
            <Typography level='body-xs' sx={sx.immediacyModalLabel}>
              פרופיל ראשי
            </Typography>
            <Typography level='title-md' sx={sx.strengthProfileLabel}>
              {profileStrength.profileLabel || 'לא נקבע'}
            </Typography>
          </Box>

          <Box sx={sx.strengthDepthBadge(tone)}>
            {profileStrength.label || '-'}
          </Box>
        </Box>

        {rules.length ? (
          <Box sx={sx.strengthRules}>
            {rules.map(rule => (
              <Box key={rule.id} sx={sx.strengthRule}>
                <Box sx={sx.strengthRuleIcon(tone)}>
                  {iconUi({id: 'completed', size: 'sm'})}
                </Box>

                <Box sx={sx.strengthRuleBody}>
                  <Typography level='title-sm' sx={sx.strengthRuleTitle}>
                    {rule.label}
                  </Typography>

                  <Box sx={sx.strengthRuleValues}>
                    <Box>
                      <Typography level='body-xs' sx={sx.immediacyModalLabel}>בפועל</Typography>
                      <Typography level='title-sm' sx={sx.strengthRuleValue}>{rule.actual}</Typography>
                    </Box>
                    <Box>
                      <Typography level='body-xs' sx={sx.immediacyModalLabel}>רף</Typography>
                      <Typography level='title-sm' sx={sx.strengthRuleValue}>{rule.threshold}</Typography>
                    </Box>
                    <Box>
                      <Typography level='body-xs' sx={sx.immediacyModalLabel}>עומק</Typography>
                      <Typography level='title-sm' sx={sx.strengthRuleValue}>
                        {rule.depthPct === null || rule.depthPct === undefined
                          ? '-'
                          : `+${Math.round(rule.depthPct)}%`}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography level='body-sm' sx={sx.immediacyModalEmpty}>
            אין כרגע תנאים מדידים מפורטים להצגה עבור הפרופיל הראשי.
          </Typography>
        )}

        <Typography level='body-xs' sx={sx.strengthFootnote}>
          מבוסס על {profileStrength.measurableRuleCount || 0} תנאים מדידים בפרופיל הראשי.
        </Typography>
      </Box>
    </RegularModal>
  )
}

export default function PlayerScoutSummary({ view = {}, narrativeView = {}, loading = false, onStoryOpen, onStoryGenerate }) {
  const [immediacyOpen, setImmediacyOpen] = React.useState(false)
  const [strengthOpen, setStrengthOpen] = React.useState(false)
  const approved = narrativeView.approved || null
  const content = approved?.content || {}
  const conclusion = content.conclusion || {}
  const title = formatNarrativeTextNumbers(
    content.title || view.storyTitle || 'עדיין אין סיפור מקצועי מאושר'
  )
  const summary = formatNarrativeTextNumbers(
    firstParagraph(conclusion.text || content.summary || view.storySummary)
  )
  const hasApproved = Boolean(approved)
  const approvedSeasonKeys = Array.isArray(approved?.seasonKeys)
    ? approved.seasonKeys.filter(Boolean)
    : []
  const storyBasis = approvedSeasonKeys.length > 1
    ? `מבוסס על ${approvedSeasonKeys.length} עונות`
    : approvedSeasonKeys.length === 1
      ? `מבוסס על עונת ${approvedSeasonKeys[0]}`
      : 'מבוסס על המידע המקצועי המצטבר של השחקן'
  const immediacyTone = scoutDecisionTokens.immediacy[view.interest.status] || scoutDecisionTokens.immediacy.unknown
  const strengthTone = resolveProfileStrengthTone(view.profileStrength.depthPct)
  const factorCount = (Number(view.interest.boostCount) || 0) + (Number(view.interest.reductionCount) || 0)
  const automaticNote = view.interest.isManual
    ? 'החלטה ידנית'
    : factorCount
      ? `${factorCount} גורמים · ${formatPoints(view.interest.netScore)} נטו`
      : 'החלטה אוטומטית'

  return (
    <>
      <Box sx={sx.heroCard}>
        <Box sx={sx.heroDecisionRail}>
          <Box sx={sx.heroDecisionItem(immediacyTone)}>
            <Box sx={sx.heroDecisionHeader}>
              <Box sx={sx.heroDecisionIcon(immediacyTone)}>
                {iconUi({id: 'priorityHigh', size: 'sm'})}
              </Box>

              <Typography level='body-xs' sx={sx.heroDecisionLabel}>
                רמת עניין
              </Typography>

              <Tooltip title='פתח פירוט של רמת העניין'>
                <IconButton
                  size='sm'
                  variant='soft'
                  sx={sx.decisionInfoButton(immediacyTone)}
                  onClick={() => setImmediacyOpen(true)}
                >
                  {iconUi({id: 'info', size: 'sm'})}
                </IconButton>
              </Tooltip>
            </Box>

            <Typography level='h2' sx={sx.heroDecisionValue(immediacyTone)}>
              {view.interest.label}
            </Typography>

            <Typography level='body-xs' sx={sx.heroDecisionNote}>
              {automaticNote}
            </Typography>
          </Box>

          <Box sx={sx.heroDecisionItem(strengthTone)}>
            <Box sx={sx.heroDecisionHeader}>
              <Box sx={sx.heroDecisionIcon(strengthTone)}>
                {iconUi({id: 'completed', size: 'sm'})}
              </Box>

              <Typography level='body-xs' sx={sx.heroDecisionLabel}>
                חוזק מקצועי
              </Typography>

              <Tooltip title='פתח פירוט של החוזק המקצועי'>
                <IconButton
                  size='sm'
                  variant='soft'
                  sx={sx.decisionInfoButton(strengthTone)}
                  onClick={() => setStrengthOpen(true)}
                >
                  {iconUi({id: 'info', size: 'sm'})}
                </IconButton>
              </Tooltip>
            </Box>

            <Typography level='h2' sx={sx.heroDecisionValue(strengthTone)}>
              {view.profileStrength.label || '-'}
            </Typography>

            <Typography level='body-xs' sx={sx.heroDecisionNote}>
              {view.profileStrength.measurableRuleCount
                ? `${view.profileStrength.measurableRuleCount} תנאים מדידים`
                : 'עומק ההתאמה לפרופיל הראשי'}
            </Typography>
          </Box>
        </Box>

        <Box sx={sx.heroNarrative}>
          <Box sx={sx.heroNarrativeTop}>
            <Box>
              <Typography level='body-xs' sx={sx.heroEyebrow}>
                {hasApproved ? 'תקציר AI' : 'תקציר מקצועי'}
              </Typography>

              <Typography level='h2' sx={sx.heroTitle}>
                {title}
              </Typography>
            </Box>

            <Chip size='sm' variant='soft' color={hasApproved ? 'success' : 'neutral'}>
              {hasApproved ? 'סיפור מאושר' : 'טרם אושר'}
            </Chip>
          </Box>

          <Typography level='body-md' sx={sx.heroSummary}>
            {summary || 'המידע המקצועי הקיים מאפשר להציג תקציר מקצועי עד ליצירת סיפור AI.'}
          </Typography>

          <Box sx={sx.heroFooter}>
            <Typography level='body-xs' sx={sx.heroBasis}>
              {storyBasis}
            </Typography>

            <Box sx={sx.heroActions}>
              {hasApproved ? (
                <Button
                  size='sm'
                  variant='outlined'
                  startDecorator={iconUi({id: 'view', size: 'sm'})}
                  onClick={onStoryOpen}
                >
                  פתח סיפור מלא
                </Button>
              ) : null}

              {!hasApproved ? (
                <Button
                  size='sm'
                  loading={loading}
                  startDecorator={iconUi({id: 'profile', size: 'sm'})}
                  onClick={onStoryGenerate}
                >
                  צור סיפור
                </Button>
              ) : null}
            </Box>
          </Box>
        </Box>
      </Box>

      <ImmediacyDetails
        open={immediacyOpen}
        interest={view.interest}
        onClose={() => setImmediacyOpen(false)}
      />

      <StrengthDetails
        open={strengthOpen}
        profileStrength={view.profileStrength}
        onClose={() => setStrengthOpen(false)}
      />
    </>
  )
}
