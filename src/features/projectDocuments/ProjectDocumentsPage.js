// src/features/projectDocuments/ProjectDocumentsPage.js
import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Button, Chip, CircularProgress, Input, Typography } from '@mui/joy'
import { useTheme } from '@mui/joy/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { ADMIN_ROUTES } from '../../app/routes/routeCatalog.js'
import { iconUi } from '../../ui/core/icons/iconUi.js'
import { documentUrl, groupProjectDocuments } from './projectDocuments.model.js'
import { useProjectDocument } from './useProjectDocument.js'
import { projectDocumentsSx as sx, readerSx } from './projectDocuments.sx.js'

const emptyDocuments = []

function RequestStatus({ request, message }) {
  if (request.loading) {
    return (
      <Box role='status' sx={sx.status}>
        <CircularProgress size='sm' />
        <Typography level='body-sm'>{message}</Typography>
      </Box>
    )
  }

  const denied = ['functions/unauthenticated', 'functions/permission-denied'].includes(request.error?.code)
  return (
    <Box role='alert' sx={sx.status}>
      <Typography level='body-sm'>{denied ? 'אין הרשאה לקריאת התיעוד.' : message}</Typography>
      {!denied && <Button variant='outlined' size='sm' onClick={request.retry}>ניסיון חוזר</Button>}
    </Box>
  )
}

function DocumentTopic({ group, selectedId, searchActive }) {
  const [expanded, setExpanded] = useState(null)
  const active = group.documents.some(document => document.id === selectedId)
  const open = searchActive || (expanded === null ? active || group.id === 'overview' : expanded)
  const listId = `document-topic-${group.id}`

  return (
    <Box component='section' sx={sx.topic}>
      <Box component='h2' sx={sx.topicHeading}>
        <Box
          component='button'
          type='button'
          aria-expanded={open}
          aria-controls={listId}
          disabled={searchActive}
          onClick={() => setExpanded(!open)}
          sx={sx.topicButton}
        >
          <Box component='span' sx={sx.topicIcon}>{iconUi({ id: group.icon, size: 'sm' })}</Box>
          <Box component='span' sx={sx.topicTitle}>{group.title}</Box>
          <Box component='span' sx={sx.count}>{group.documents.length}</Box>
          <Box component='span' sx={sx.topicArrow(open)}>{iconUi({ id: 'arrowDown', size: 'sm' })}</Box>
        </Box>
      </Box>
      <Box component='ul' id={listId} hidden={!open} sx={sx.documentLinks}>
        {group.documents.map(document => (
          <li key={document.id}>
            <Box
              component={Link}
              to={documentUrl(document.id)}
              aria-current={document.id === selectedId ? 'page' : undefined}
              sx={sx.documentLink}
            >
              {iconUi({ id: 'report', size: 'sm' })}
              <bdi>{document.title}</bdi>
            </Box>
          </li>
        ))}
      </Box>
    </Box>
  )
}

function DocumentReader({ id, title, topic, mobile }) {
  const content = useProjectDocument(id || null)
  const { hash } = useLocation()
  const navigate = useNavigate()
  const scrollRef = useRef(null)
  const titleRef = useRef(null)
  const html = content.data?.html

  useEffect(() => {
    if (!id) return
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    if (mobile) titleRef.current?.focus()
  }, [id, mobile])

  useEffect(() => {
    if (!hash || !html) return
    let fragment
    try {
      fragment = decodeURIComponent(hash.slice(1))
    } catch {
      return
    }
    const heading = document.getElementById('project-doc-' + fragment)
    if (heading && scrollRef.current?.contains(heading)) heading.scrollIntoView({ block: 'start' })
  }, [hash, html, id])

  const followLink = event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return
    const href = event.target.closest?.('a')?.getAttribute('href')
    if (!href?.startsWith('?doc=')) return
    event.preventDefault()
    navigate(href)
  }

  if (!id) {
    return (
      <Box sx={readerSx.welcome}>
        {iconUi({ id: 'report', size: 'lg' })}
        <Typography level='title-lg'>בחירת מסמך לקריאה</Typography>
        <Typography level='body-sm'>חיפוש לפי כותרת או שם קובץ, או בחירה לפי נושא.</Typography>
      </Box>
    )
  }

  return (
    <Box component='section' sx={readerSx.panel} aria-labelledby='project-document-title'>
      <Box sx={readerSx.header}>
        <Button
          component={Link}
          to={ADMIN_ROUTES.projectDocuments}
          size='sm'
          variant='outlined'
          startDecorator={iconUi({ id: 'back', size: 'sm' })}
          sx={readerSx.mobileBack}
        >
          לרשימת המסמכים
        </Button>
        <Box sx={readerSx.meta}>
          {topic && <Chip size='sm' variant='soft'>{topic}</Chip>}
          <Typography level='body-xs'><bdi>{id.split('/').pop()}</bdi></Typography>
        </Box>
        <Typography ref={titleRef} component='h2' id='project-document-title' level='h3' tabIndex={-1}>
          <bdi>{content.data?.title || title || 'מסמך תיעוד'}</bdi>
        </Typography>
      </Box>

      <Box ref={scrollRef} className='dpScrollThin' sx={readerSx.body}>
        {content.error?.code === 'functions/not-found' ? (
          <Box sx={sx.status} role='status'>
            <Typography level='body-sm'>המסמך לא נמצא בספרייה.</Typography>
            <Button component={Link} to={ADMIN_ROUTES.projectDocuments} size='sm' variant='plain'>לרשימת המסמכים</Button>
          </Box>
        ) : content.loading || content.error ? (
          <RequestStatus request={content} message={content.loading ? 'טוען את המסמך…' : 'טעינת המסמך נכשלה.'} />
        ) : html ? (
          <Box component='article' sx={readerSx.markdown} onClick={followLink} dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <Typography level='body-sm' sx={sx.status}>המסמך ריק.</Typography>
        )}
      </Box>
    </Box>
  )
}

export default function ProjectDocumentsPage() {
  const [params] = useSearchParams()
  const id = params.get('doc') || ''
  const theme = useTheme()
  const mobile = useMediaQuery(theme.breakpoints.down('md'))
  const [search, setSearch] = useState('')
  const searchRef = useRef(null)
  const previousId = useRef(id)
  const catalog = useProjectDocument()
  const documents = catalog.data?.documents || emptyDocuments
  const allGroups = useMemo(() => groupProjectDocuments(documents, ''), [documents])
  const searchActive = Boolean(search.trim())
  const groups = useMemo(
    () => searchActive ? groupProjectDocuments(documents, search) : allGroups,
    [allGroups, documents, search, searchActive]
  )
  const selectedGroup = allGroups.find(group => group.documents.some(document => document.id === id))
  const selectedDocument = selectedGroup?.documents.find(document => document.id === id)
  const total = groups.reduce((sum, group) => sum + group.documents.length, 0)

  useEffect(() => {
    if (mobile && previousId.current && !id) searchRef.current?.focus()
    previousId.current = id
  }, [id, mobile])

  return (
    <Box sx={sx.page}>
      <Box component='header' sx={sx.header}>
        <Box sx={sx.headerIcon}>{iconUi({ id: 'report', size: 'md' })}</Box>
        <Box>
          <Typography component='h1' level='h3'>ספריית תיעוד</Typography>
          <Typography level='body-sm'>מסמכי המערכת, מודלים מקצועיים והנחיות עבודה של DevPlan.</Typography>
        </Box>
      </Box>

      <Box sx={sx.workspace}>
        <Box component='nav' aria-label='מסמכים לפי נושא' sx={[sx.catalog, Boolean(id) && sx.desktopCatalog]}>
          <Box sx={sx.search}>
            <Input
              size='sm'
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder='חיפוש לפי כותרת או שם קובץ'
              startDecorator={iconUi({ id: 'search', size: 'sm' })}
              slotProps={{ input: { ref: searchRef, type: 'search', 'aria-label': 'חיפוש מסמכים' } }}
            />
            {searchActive && !catalog.loading && !catalog.error && (
              <Typography level='body-xs' role='status'>{total} תוצאות</Typography>
            )}
          </Box>

          <Box className='dpScrollThin' sx={sx.topics}>
            {catalog.loading || catalog.error ? (
              <RequestStatus request={catalog} message={catalog.loading ? 'טוען את רשימת המסמכים…' : 'טעינת רשימת המסמכים נכשלה.'} />
            ) : !groups.length ? (
              <Typography level='body-sm' sx={sx.status}>
                {searchActive ? 'לא נמצאו מסמכים שמתאימים לחיפוש.' : 'אין מסמכים בספרייה.'}
              </Typography>
            ) : groups.map(group => (
              <DocumentTopic key={group.id} group={group} selectedId={id} searchActive={searchActive} />
            ))}
          </Box>
        </Box>

        <Box sx={[sx.reader, !id && sx.desktopReader]}>
          <DocumentReader id={id} title={selectedDocument?.title} topic={selectedGroup?.title} mobile={mobile} />
        </Box>
      </Box>
    </Box>
  )
}
