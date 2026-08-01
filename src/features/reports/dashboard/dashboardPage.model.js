import { useEffect, useMemo, useState } from 'react'

import { useCoreData } from '../../../coreData/CoreDataProvider.js'
import {
  REPORT_CATEGORY_OPTIONS,
  REPORT_CATALOG,
  mergeReportsWithPublications,
} from '../catalog/index.js'
import {
  deletePublicReport,
  getPublicReport,
  getPublishedPublicReports,
  revokePublicReport,
} from '../service/index.js'
import { updateDbSearchReportMetadata } from '../dbSearch/integration/index.js'
import { PUBLIC_REPORT_STATUS } from '../reports.constants.js'
import { DASH_MODES } from './data/dashboardModes.js'
import { useSnackbar } from '../../../ui/core/feedback/snackbar/SnackbarProvider.js'
import { mapFirestoreErrorToDetails } from '../../../ui/core/feedback/snackbar/snackbar.format.js'
import { SNACK_STATUS } from '../../../ui/core/feedback/snackbar/snackbar.model.js'

function clean(value) {
  return String(value ?? '').trim()
}

function lookupById(source = [], id = '') {
  const safeId = clean(id)

  if (!safeId || !Array.isArray(source)) return null

  return source.find(item => clean(item?.id) === safeId) || null
}

function findEntityById(sources = {}, entityId = '') {
  const safeEntityId = clean(entityId)

  if (!safeEntityId) return null

  return (
    lookupById(sources.clubs, safeEntityId) ||
    lookupById(sources.teams, safeEntityId) ||
    lookupById(sources.players, safeEntityId) ||
    null
  )
}

function resolveCoreEntity(sources = {}, entityType = '', entityId = '') {
  const safeEntityType = clean(entityType).toLowerCase()
  const safeEntityId = clean(entityId)

  if (!safeEntityId) return null

  const sourceByType = {
    club: sources.clubs,
    clubs: sources.clubs,
    team: sources.teams,
    teams: sources.teams,
    player: sources.players,
    players: sources.players,
  }

  const entitySource = sourceByType[safeEntityType]
  const entity = entitySource ? lookupById(entitySource, safeEntityId) : null

  return entity || findEntityById(sources, safeEntityId)
}

function resolveEntityDisplayName(entity, fallback = '') {
  const safeEntity = entity || {}

  return clean(
    safeEntity.teamName ||
    safeEntity.clubName ||
    safeEntity.playerFullName ||
    safeEntity.name ||
    safeEntity.title ||
    fallback
  )
}

function resolveEntityAvatarUrl(entity, fallback = '') {
  const safeEntity = entity || {}

  return clean(safeEntity.photo || safeEntity.avatarUrl || fallback)
}

function buildCategoryOptions(reports = []) {
  const allCount = reports.reduce((sum, report) => sum + report.publications.length, 0)

  const categoryOptions = REPORT_CATEGORY_OPTIONS.map(category => ({
    id: category.id,
    idIcon: category.idIcon,
    label: category.label,
    description: category.description,
    count: reports.reduce((sum, report) => (
      report.categoryId === category.id ? sum + report.publications.length : sum
    ), 0),
  }))

  return [
    {
      id: 'all',
      label: 'הכל',
      idIcon: 'report',
      description: 'כל הדוחות',
      count: allCount,
    },
    ...categoryOptions,
  ]
}

export default function useDashboardPageModel() {
  const { players = [], clubs = [], teams = [] } = useCoreData()
  const { notify } = useSnackbar()

  const [mode] = useState(DASH_MODES.GENERAL)
  const [selectedReportId, setSelectedReportId] = useState('')
  const [selectedPublicationId, setSelectedPublicationId] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('all')
  const [openReportIds, setOpenReportIds] = useState([])
  const [publications, setPublications] = useState([])
  const [loadingPublications, setLoadingPublications] = useState(true)
  const [publicationError, setPublicationError] = useState(null)
  const [selectedPublicationDocument, setSelectedPublicationDocument] = useState(null)
  const [loadingSelectedPublication, setLoadingSelectedPublication] = useState(false)
  const [selectedPublicationError, setSelectedPublicationError] = useState(null)
  const [editDbSearchModal, setEditDbSearchModal] = useState({
    open: false,
    publication: null,
    loading: false,
  })
  const [publicationActionModal, setPublicationActionModal] = useState({
    open: false,
    action: '',
    publication: null,
    loading: false,
  })

  useEffect(() => {
    let active = true

    async function loadPublications() {
      setLoadingPublications(true)

      try {
        const items = await getPublishedPublicReports()

        if (!active) return

        setPublications(items)
        setPublicationError(null)
      } catch (error) {
        if (!active) return

        console.error('[useDashboardPageModel] Failed to load publications', error)
        setPublicationError(error)
      } finally {
        if (active) {
          setLoadingPublications(false)
        }
      }
    }

    loadPublications()

    return () => {
      active = false
    }
  }, [])

  const reports = useMemo(() => {
    const mergedReports = mergeReportsWithPublications(REPORT_CATALOG, publications)
    const sources = { players, clubs, teams }

    return mergedReports.map(report => ({
      ...report,
      url: report.publications[0]?.url || report.url || '',
      publications: report.publications.map(publication => {
        const entityType = publication.entityType || publication.reportContent?.entityType || ''
        const entityId = publication.entityId || publication.reportContent?.entityId || ''
        const entity = resolveCoreEntity(sources, entityType, entityId)

        return {
          ...publication,
          entity,
          entityName: resolveEntityDisplayName(entity, publication.entityName),
          avatarUrl: resolveEntityAvatarUrl(entity, publication.avatarUrl),
        }
      }),
    }))
  }, [players, clubs, teams, publications])

  const categoryOptions = useMemo(() => buildCategoryOptions(reports), [reports])

  const filteredReports = useMemo(() => {
    if (selectedCategoryId === 'all') return reports

    return reports.filter(report => report.categoryId === selectedCategoryId)
  }, [reports, selectedCategoryId])

  const selectedReport = useMemo(() => {
    return reports.find(report => report.id === selectedReportId) || null
  }, [reports, selectedReportId])

  const selectedPublicationSummary = useMemo(() => {
    if (!selectedReport || !selectedPublicationId) return null

    return selectedReport.publications.find(publication => publication.id === selectedPublicationId) || null
  }, [selectedPublicationId, selectedReport])

  useEffect(() => {
    let active = true

    async function loadSelectedPublication() {
      if (!selectedPublicationSummary?.reportId) {
        setSelectedPublicationDocument(null)
        setSelectedPublicationError(null)
        setLoadingSelectedPublication(false)
        return
      }

      setLoadingSelectedPublication(true)
      setSelectedPublicationError(null)
      setSelectedPublicationDocument(null)

      try {
        const report = await getPublicReport({
          reportId: selectedPublicationSummary.reportId,
          versionId: selectedPublicationSummary.versionId || '',
        })

        if (!active) return

        setSelectedPublicationDocument(report)
      } catch (error) {
        if (!active) return

        console.error('[useDashboardPageModel] Failed to load selected publication', error)
        setSelectedPublicationError(error)
      } finally {
        if (active) {
          setLoadingSelectedPublication(false)
        }
      }
    }

    loadSelectedPublication()

    return () => {
      active = false
    }
  }, [selectedPublicationSummary])

  const selectedPublication = useMemo(() => {
    if (!selectedPublicationSummary) return null
    if (!selectedPublicationDocument) return selectedPublicationSummary

    return {
      ...selectedPublicationSummary,
      ...selectedPublicationDocument,
      entity: selectedPublicationSummary.entity || selectedPublicationDocument.entity || null,
      entityName:
        selectedPublicationSummary.entityName ||
        selectedPublicationDocument.entityName ||
        '',
      avatarUrl:
        selectedPublicationSummary.avatarUrl ||
        selectedPublicationDocument.avatarUrl ||
        '',
    }
  }, [selectedPublicationDocument, selectedPublicationSummary])

  const selectedEntity = useMemo(() => {
    if (!selectedPublication) return null
    if (selectedPublication.entity) return selectedPublication.entity

    const entityType = selectedPublication.entityType || selectedPublication.reportContent?.entityType || ''
    const entityId = selectedPublication.entityId || selectedPublication.reportContent?.entityId || ''

    return resolveCoreEntity({ players, clubs, teams }, entityType, entityId)
  }, [players, clubs, teams, selectedPublication])

  async function copyPublicationLink(publication) {
    const reportUrl = clean(publication?.versionUrl || publication?.url || '')

    if (!reportUrl) return false

    if (typeof navigator !== 'undefined' && navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(reportUrl)
      return true
    }

    window.prompt('העתק קישור', reportUrl)
    return false
  }

  async function onPublicationShare(publication) {
    try {
      await copyPublicationLink(publication)
      notify({
        status: SNACK_STATUS.SUCCESS,
        title: 'קישור הועתק',
        message: publication?.entityName || publication?.title || 'הקישור של הפרסום הועתק ללוח',
      })
    } catch (error) {
      console.error('[useDashboardPageModel] Failed to copy publication link', error)
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'העתקת הקישור נכשלה',
        message: 'לא הצלחנו להעתיק את הקישור של הפרסום.',
        details: mapFirestoreErrorToDetails(error),
      })
      window.prompt('העתק קישור', clean(publication?.versionUrl || publication?.url || ''))
    }
  }


  function openDbSearchMetadataEditor(publication) {
    if (!publication || publication.reportType !== 'dbSearch') return

    setEditDbSearchModal({
      open: true,
      publication,
      loading: false,
    })
  }

  function closeDbSearchMetadataEditor() {
    setEditDbSearchModal(current => (
      current.loading
        ? current
        : { open: false, publication: null, loading: false }
    ))
  }

  async function saveDbSearchMetadata(metadata) {
    const publication = editDbSearchModal.publication

    if (!publication) return

    setEditDbSearchModal(current => ({ ...current, loading: true }))

    try {
      const result = await updateDbSearchReportMetadata({
        report: publication,
        metadata,
      })

      if (!result?.writeSkipped) {
        const refreshedReport = await getPublicReport({
          reportId: publication.reportId,
        })

        setSelectedPublicationDocument(refreshedReport)
      } else {
        setSelectedPublicationDocument(current => ({
          ...current,
          reportContent: {
            ...(current?.reportContent || publication.reportContent || {}),
            meta: {
              ...(current?.reportContent?.meta || publication.reportContent?.meta || {}),
              ...metadata,
            },
          },
        }))
      }

      notify({
        status: SNACK_STATUS.SUCCESS,
        title: result?.writeSkipped ? 'השינוי הוכן' : 'הדוח עודכן',
        message: result?.writeSkipped
          ? 'כתיבת הדוחות חסומה כרגע; מבנה הגרסה נבנה ללא כתיבה.'
          : 'פרטי הדוח נשמרו כגרסה חדשה.',
      })

      setEditDbSearchModal({ open: false, publication: null, loading: false })
    } catch (error) {
      console.error('[useDashboardPageModel] Failed to update dbSearch metadata', error)
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'עדכון הדוח נכשל',
        message: 'לא הצלחנו לשמור את פרטי הדוח.',
        details: mapFirestoreErrorToDetails(error),
      })
      setEditDbSearchModal(current => ({ ...current, loading: false }))
    }
  }

  function openPublicationActionModal(action, publication) {
    if (!publication?.reportId) return

    setPublicationActionModal({
      open: true,
      action,
      publication,
      loading: false,
    })
  }

  function closePublicationActionModal() {
    setPublicationActionModal(current => (
      current.loading
        ? current
        : {
            open: false,
            action: '',
            publication: null,
            loading: false,
          }
    ))
  }

  async function confirmPublicationAction() {
    const { action, publication } = publicationActionModal

    if (!publication?.reportId || !action) return

    setPublicationActionModal(current => ({
      ...current,
      loading: true,
    }))

    try {
      if (action === 'stop') {
        await revokePublicReport({
          reportId: publication.reportId,
          reportType: publication.reportType,
        })

        setPublications(current => current.map(item => (
          item.reportId === publication.reportId
            ? { ...item, status: PUBLIC_REPORT_STATUS.REVOKED }
            : item
        )))

        notify({
          status: SNACK_STATUS.SUCCESS,
          title: 'הפרסום נעצר',
          message: publication.entityName || publication.title || 'הקישור נסגר בהצלחה',
        })
      }

      if (action === 'delete') {
        await deletePublicReport({
          reportId: publication.reportId,
          reportType: publication.reportType,
        })

        setPublications(current => current.filter(item => item.reportId !== publication.reportId))

        if (selectedPublicationId === publication.id) {
          setSelectedPublicationId('')
          setSelectedPublicationDocument(null)
        }

        notify({
          status: SNACK_STATUS.SUCCESS,
          title: 'הדוח נמחק',
          message: publication.entityName || publication.title || 'הפרסום הוסר מהרשימה והקישור נמחק',
        })
      }
    } catch (error) {
      console.error('[useDashboardPageModel] Failed to handle publication action', error)
      notify({
        status: SNACK_STATUS.ERROR,
        title: action === 'delete' ? 'מחיקת הדוח נכשלה' : 'עצירת הפרסום נכשלה',
        message: action === 'delete'
          ? 'לא הצלחנו למחוק את הדוח.'
          : 'לא הצלחנו לעצור את הפרסום.',
        details: mapFirestoreErrorToDetails(error),
      })
    } finally {
      setPublicationActionModal({
        open: false,
        action: '',
        publication: null,
        loading: false,
      })
    }
  }

  function onPublicationStop(publication) {
    openPublicationActionModal('stop', publication)
  }

  function onPublicationDelete(publication) {
    openPublicationActionModal('delete', publication)
  }

  const mainTitle =
    mode === DASH_MODES.GENERAL
      ? 'מצב כללי'
      : mode === DASH_MODES.REPORT
        ? 'מצב דוח כללי'
        : 'מצב דוח ספציפי'

  const mainDescription =
    mode === DASH_MODES.GENERAL
      ? 'כאן רואים את כל מערך הדוחות בלי להתמקד בדוח יחיד.'
      : mode === DASH_MODES.REPORT
        ? 'כאן מנהלים סוג דוח, את המסמכים שלו ואת ההיסטוריה של השימוש.'
        : 'כאן מנהלים מסמך מסוים, כולל צפי, קישור ושיתוף.'

  const emptyText = loadingPublications
    ? 'טוען דוחות...'
    : publicationError
      ? 'טעינת הדוחות נכשלה.'
      : selectedPublication
        ? `נבחר כרגע: ${resolveEntityDisplayName(
            selectedEntity,
            selectedPublication.entityName ||
            selectedPublication.title ||
            selectedReport?.label ||
            ''
          )}`
        : selectedReport
          ? `נבחר כרגע: ${selectedReport.label}`
          : 'בחר קטגוריה ודוח מהסיידבר הימני כדי להתחיל.'

  function openReport(reportId) {
    setOpenReportIds(current => (
      current.includes(reportId) ? current : [...current, reportId]
    ))
  }

  function selectReport(nextReport) {
    if (!nextReport) return

    setSelectedReportId(nextReport.id)
    setSelectedPublicationId('')
    setSelectedPublicationDocument(null)
    setSelectedPublicationError(null)
    openReport(nextReport.id)
  }

  function onCategorySelect(nextCategoryId) {
    setSelectedCategoryId(nextCategoryId)
  }

  function onReportToggle(nextReportId) {
    const nextReport = reports.find(report => report.id === nextReportId)

    if (!nextReport || !nextReport.exists) return

    const isOpen = openReportIds.includes(nextReportId)

    setOpenReportIds(current => (
      isOpen
        ? current.filter(reportId => reportId !== nextReportId)
        : [...current, nextReportId]
    ))

    if (isOpen) {
      if (selectedReportId === nextReportId) {
        setSelectedReportId('')
        setSelectedPublicationId('')
        setSelectedPublicationDocument(null)
        setSelectedPublicationError(null)
      }

      return
    }

    selectReport(nextReport)
  }

  function onPublicationSelect(nextPublicationId) {
    const nextReport = reports.find(report => (
      report.publications.some(publication => publication.id === nextPublicationId)
    ))

    if (!nextReport) return

    if (selectedPublicationId === nextPublicationId && selectedReportId === nextReport.id) {
      setSelectedPublicationId('')
      setSelectedPublicationDocument(null)
      setSelectedPublicationError(null)
      setSelectedReportId(nextReport.id)
      openReport(nextReport.id)
      return
    }

    setSelectedReportId(nextReport.id)
    setSelectedPublicationId(nextPublicationId)
    setSelectedPublicationDocument(null)
    setSelectedPublicationError(null)
    openReport(nextReport.id)
  }

  return {
    title: 'מרכז ניהול דוחות',
    subtitle: 'ניהול, היסטוריה, צפי ושיתוף',
    reports,
    filteredReports,
    categoryOptions,
    selectedCategoryId,
    selectedReportId,
    selectedPublicationId,
    selectedReport,
    selectedPublication,
    selectedPublicationSummary,
    selectedPublicationDocument,
    selectedEntity,
    openReportIds,
    loadingPublications,
    loadingSelectedPublication,
    publicationError,
    selectedPublicationError,
    publicationActionModal,
    editDbSearchModal,
    mainTitle,
    mainDescription,
    emptyText,
    onCategorySelect,
    onReportToggle,
    onPublicationSelect,
    onPublicationShare,
    onPublicationStop,
    onPublicationDelete,
    openDbSearchMetadataEditor,
    closeDbSearchMetadataEditor,
    saveDbSearchMetadata,
    closePublicationActionModal,
    confirmPublicationAction,
  }
}
