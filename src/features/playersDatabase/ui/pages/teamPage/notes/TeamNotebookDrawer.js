// src/features/playersDatabase/ui/pages/teamPage/notes/TeamNotebookDrawer.js

import React from 'react'
import { Box, Chip, Tab, TabList, TabPanel, Tabs, Typography } from '@mui/joy'
import DrawerShell from '../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'
import TeamNotebookList from './TeamNotebookList.js'
import TeamNotebookFinding from './TeamNotebookFinding.js'
import TeamNotebookGeneralNote from './TeamNotebookGeneralNote.js'
import TeamNotebookDiscardDialog from './TeamNotebookDiscardDialog.js'
import useTeamNotebookDraft from './useTeamNotebookDraft.js'
import { EMPTY_NOTES, EMPTY_OPTIONS } from './model/teamNotebook.ui.js'
import { teamNotebookSx as sx } from './sx/teamNotebook.sx.js'

/**
 * UI only; no callbacks or adapter for saving are intentionally exposed.
 * notes: { generalText, findingsById: { [id]: { text, insightIds, relatedSeasonIds,
 *   relatedPlayerIds, focusSeasonId, status, createdAt, updatedAt } } }
 * Dates are ISO strings in this view contract, not Firestore Timestamp objects.
 * seasonOptions / playerOptions: [{ id: string, label: string, description?: string }]
 * Supply all relevant seasons/players. This component never reads or fetches them.
 * initialInsightId / initialSeasonId seed NEW drafts only, never existing findings.
 * Each opening takes a local copy. Closing/unmounting discards the whole UI session.
 */
export default function TeamNotebookDrawer({
  open = false,
  onClose,
  teamId = '',
  teamName = '',
  birthYear = '',
  notes = EMPTY_NOTES,
  seasonOptions = EMPTY_OPTIONS,
  playerOptions = EMPTY_OPTIONS,
  initialInsightId = '',
  initialSeasonId = '',
}) {
  if (!open) return null
  return (
    <NotebookSession
      key={teamId || 'team-notebook'}
      onClose={onClose}
      teamName={teamName}
      birthYear={birthYear}
      notes={notes}
      seasonOptions={seasonOptions}
      playerOptions={playerOptions}
      initialInsightId={initialInsightId}
      initialSeasonId={initialSeasonId}
    />
  )
}

function NotebookSession({
  onClose, teamName, birthYear, notes, seasonOptions, playerOptions,
  initialInsightId, initialSeasonId,
}) {
  const notebook = useTeamNotebookDraft({ notes, playerOptions, initialInsightId, initialSeasonId })
  const close = () => {
    if (typeof onClose === 'function') onClose()
  }
  const requestClose = () => {
    if (notebook.hasChanges) notebook.setConfirmClose(true)
    else close()
  }
  const subline = [teamName, birthYear ? `שנתון ${birthYear}` : ''].filter(Boolean).join(' · ')

  return (
    <>
      <DrawerShell
        open
        onClose={requestClose}
        entity='team'
        anchor='right'
        isDirty={notebook.hasChanges}
        canSave={false}
        saving={false}
        sxOverrides={sx.shell}
        header={(
          <DrawerHeaderShell
            title='מחברת השנתון'
            titleIconId='task'
            entity='team'
            subline={subline || 'תיעוד חקירה רב־עונתי'}
            meta='כל המסלולים · כל העונות'
            chipLabel='ממשק בלבד'
            sxOverrides={sx.header}
          />
        )}
        texts={{ save: 'שמירה', cancel: 'סגירה' }}
        status={{
          text: notebook.hasChanges ? 'טיוטות זמניות · אינן נשמרות' : 'השמירה אינה מחוברת בשלב זה',
          color: notebook.hasChanges ? 'warning' : 'neutral',
        }}
        saveButtonProps={{ disabled: true, title: 'אין חיבור לשמירה בשלב זה', sx: sx.saveButton }}
        cancelButtonProps={{ sx: sx.cancelButton }}
      >
        <Box dir='rtl' sx={sx.workspace}>
          <Box sx={sx.previewNotice}>
            <Typography level='body-xs'>אפשר לערוך ולדפדף. הטיוטות יימחקו בסגירה; אין שמירה או העלאת קבצים.</Typography>
          </Box>
          <Tabs
            value={notebook.tab}
            onChange={(_event, value) => notebook.setTab(value)}
            sx={sx.tabs}
          >
            <TabList sx={sx.tabList}>
              <Tab value='findings'>ממצאים <Chip size='sm' variant='soft'>{notebook.findings.length}</Chip></Tab>
              <Tab value='general'>הערה כללית</Tab>
            </TabList>
            <TabPanel value='findings' sx={sx.tabPanel}>
              {notebook.selectedFinding ? (
                <TeamNotebookFinding notebook={notebook} seasonOptions={seasonOptions} playerOptions={playerOptions} />
              ) : (
                <TeamNotebookList notebook={notebook} seasonOptions={seasonOptions} playerOptions={playerOptions} />
              )}
            </TabPanel>
            <TabPanel value='general' sx={sx.tabPanel}>
              <TeamNotebookGeneralNote value={notebook.generalText} onChange={notebook.setGeneralText} />
            </TabPanel>
          </Tabs>
        </Box>
      </DrawerShell>
      <TeamNotebookDiscardDialog
        open={notebook.confirmClose}
        onContinue={() => notebook.setConfirmClose(false)}
        onDiscard={close}
      />
    </>
  )
}
