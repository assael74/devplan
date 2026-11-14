// src/features/projectDocuments/projectDocuments.model.js
import { ADMIN_ROUTES } from '../../app/routes/routeCatalog.js'

const topics = [
  { id: 'overview', title: 'היכרות', icon: 'report', match: /^(?:docs\/)?README\.md$/ },
  { id: 'architecture', title: 'ארכיטקטורה וממשק', icon: 'dashboard', match: /\/(?:CORE_DATA|PROJECT_STRUCTURE|UI_PATTERNS)\.md$/ },
  { id: 'data', title: 'נתונים ותפעול', icon: 'insights', match: /FIRESTORE_ROUTER|\/firestore\/usage\// },
  { id: 'performance', title: 'משחקים, יכולות וסקאוט', icon: 'scouting', match: /GAME_STATS|SCORING_MODEL|EXPECTATIONS_MODEL|SCOUT_MODEL|\/abilities\/engine\// },
  { id: 'targets', title: 'יעדים ובנצ׳מרקים', icon: 'targets', match: /\/targets\// },
  { id: 'instructions', title: 'הנחיות עבודה', icon: 'notes', match: /AGENTS\.md$|^\.codex\/|\/onboarding\// },
  { id: 'other', title: 'תיעוד נוסף', icon: 'report', match: /./ },
]

const normalize = value => value.toLowerCase().replace(/[\s_./\-–—־]+/gu, ' ').trim()

export const documentUrl = id => ADMIN_ROUTES.projectDocuments + '?' + new URLSearchParams({ doc: id })

export function groupProjectDocuments(documents, search) {
  const words = normalize(search).split(' ').filter(Boolean)
  const groups = topics.map(({ id, title, icon }) => ({ id, title, icon, documents: [] }))

  for (const document of documents) {
    const text = normalize(`${document.title} ${document.id}`)
    if (!words.every(word => text.includes(word))) continue

    const index = topics.findIndex(topic => topic.match.test(document.id))
    groups[index].documents.push(document)
  }

  return groups.filter(group => group.documents.length).map(group => ({
    ...group,
    documents: group.documents.sort((first, second) => first.title.localeCompare(second.title, 'he')),
  }))
}
