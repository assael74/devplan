// playerGames.domain.logic.js
export const GAME_TYPE = [
  { id: 'league', label: '', labelH: 'משחק ליגה', idIcon: 'league', disabled: false },
  { id: 'cup', label: '', labelH: 'משחק גביע', idIcon: 'cup', disabled: false },
  { id: 'friendly', label: '', labelH: 'משחק ידידות', idIcon: 'friendly', disabled: false },
]

export const GAME_DIFFICULTY = [
  { id: 'easy', label: '', labelH: 'רמה קלה', idIcon: 'easy', disabled: false },
  { id: 'equal', label: '', labelH: 'אותה רמה', idIcon: 'equal', disabled: false },
  { id: 'hard', label: '', labelH: 'רמה קשה', idIcon: 'hard', disabled: false },
]

export const GAME_RESULT = [
  { id: 'win', label: '', labelH: 'ניצחון', idIcon: 'win', color: 'sucsses', disabled: false },
  { id: 'loss', label: '', labelH: 'הפסד', idIcon: 'loss', color: 'danger', disabled: false },
  { id: 'draw', label: '', labelH: 'תיקו', idIcon: 'draw', color: 'warninig', disabled: false },
]
