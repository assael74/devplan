// src/features/hub/playerProfile/sharedModules/performance/components/PerformanceShareModal.js

import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Avatar, Box, Button, Checkbox, Option, Select, Table, Textarea, Typography } from '@mui/joy'
import AnimatedModal from '../../../../../../ui/patterns/modals/AnimatedModal.js'
import { CollapseBox } from '../../../../../../ui/patterns/collapseBox/index.js'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { filterPerformanceShareReport, performanceShareText } from '../../../sharedLogic/performance/performance.share.logic.js'
import { POSITION_STANDARD } from '../../../sharedLogic/performance/performance.comparison.logic.js'
import { copyPerformanceImage, createPerformanceImage, downloadPerformanceImage } from '../performance.image.js'
import { performanceSx } from '../performance.sx.js'
import { getPerformanceShareColumnWidths, performanceShareSx as sx } from '../performanceShare.sx.js'

function ReportTable({ report }) {
  const indices = report.columnIndices || report.columns.map((_, index) => index)
  const widths = getPerformanceShareColumnWidths(report.sourceColumnCount || report.columns.length, indices)
  return (
    <Box sx={sx.report}>
      <Box sx={sx.reportHeader}>
        {report.playerAvatar ? (
          <Avatar src={report.playerAvatar.src} alt={`תמונת ${report.playerAvatar.name}`} sx={sx.playerAvatar}>
            <Box component="img" src={report.playerAvatar.fallback} alt={`תמונת ${report.playerAvatar.name}`} sx={sx.avatarImage} />
          </Avatar>
        ) : null}
        <Box sx={sx.reportHeaderTop}>
          <Box sx={[sx.reportIdentity, report.playerAvatar ? sx.identityWithAvatar : {}]}>
            <Typography sx={sx.title}>{report.title}</Typography>
            {report.team ? <Typography sx={sx.detail}>{report.team}</Typography> : null}
          </Box>
          <Typography sx={sx.subtitle}>{report.heading}</Typography>
        </Box>
        <Box sx={sx.reportMeta}>
          {report.details.map(line => <Typography key={line} sx={sx.metaItem}>{line}</Typography>)}
        </Box>
      </Box>
      {report.rows.length && report.columns.length ? <Box className="dpScrollThin" sx={sx.tableWrap}>
        <Table size="sm" sx={[sx.table, { minWidth: Math.max(300, report.columns.length * 115) }]} aria-label="טבלת הביצועים להעתקה">
          <colgroup>{widths.map((width, index) => <col key={index} style={{ width: `${width * 100}%` }} />)}</colgroup>
          <thead><tr>{report.columns.map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
          <tbody>
            {report.rows.map(row => (
              <Box component="tr" key={row.id} sx={sx.row(row.id)}>
                {indices.map(index => index === 0 ? (
                  <th key={index} scope="row">{row.label}{row.note ? <Box component="span" sx={sx.note}>{row.note}</Box> : null}</th>
                ) : (
                  <Box component="td" key={index} data-gap-tone={row.cellTones?.[index - 1] || undefined} sx={[
                    report.benchmark && index >= report.benchmark.columnStart ? sx.benchmarkCell : {},
                    sx.gapCell(row.cellTones?.[index - 1]),
                  ]}>{row.values[index - 1]}</Box>
                ))}
              </Box>
            ))}
          </tbody>
        </Table>
      </Box> : <Typography sx={{ ...sx.caption, p: 2 }}>לא נבחרו שורות או עמודות. אפשר להחזיר אותן דרך „שורות ועמודות”.</Typography>}
    </Box>
  )
}

export default function PerformanceShareModal({ open, report, onPosition, onClose }) {
  const customizationId = useId()
  const [format, setFormat] = useState('image')
  const [customizing, setCustomizing] = useState(false)
  const [hiddenRows, setHiddenRows] = useState([])
  const [hiddenColumns, setHiddenColumns] = useState([])
  const visibleReport = useMemo(() => filterPerformanceShareReport(report, hiddenRows, hiddenColumns), [report, hiddenRows, hiddenColumns])
  const [message, setMessage] = useState(() => performanceShareText(report))
  const [imageState, setImageState] = useState(null)
  const [preparing, setPreparing] = useState(true)
  const [copying, setCopying] = useState(false)
  const [status, setStatus] = useState('')
  const [imageError, setImageError] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef(null)
  const image = imageState?.report === visibleReport ? imageState.blob : null
  const hasSelection = visibleReport.rows.length > 0 && visibleReport.columns.length > 0

  useEffect(() => {
    if (open) {
      setFormat('image')
      setCustomizing(false)
      setHiddenRows(current => current.length ? [] : current)
      setHiddenColumns(current => current.length ? [] : current)
    }
  }, [open])

  useEffect(() => {
    let active = true
    setMessage(performanceShareText(visibleReport))
    setImageState(null)
    setPreparing(true)
    setStatus('')
    setImageError('')
    setError('')
    if (!hasSelection) { setPreparing(false); return }
    createPerformanceImage(visibleReport).then(blob => {
      if (active) setImageState({ report: visibleReport, blob })
    }).catch(() => {
      if (active) setImageError('לא ניתן להכין את התמונה. אפשר לעבור להעתקת טקסט.')
    }).finally(() => {
      if (active) setPreparing(false)
    })
    return () => { active = false }
  }, [visibleReport, hasSelection])

  const changeFormat = value => { setFormat(value); setStatus(''); setError('') }
  const toggleHidden = (setter, value) => {
    setter(current => current.includes(value) ? current.filter(item => item !== value) : [...current, value])
  }
  const copy = async () => {
    setCopying(true)
    setStatus('')
    setError('')
    try {
      if (format === 'image') await copyPerformanceImage(image)
      else {
        if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable')
        await navigator.clipboard.writeText(message)
      }
      setStatus(format === 'image' ? 'התמונה הועתקה. אפשר להדביק בוואטסאפ.' : 'ההודעה הועתקה. אפשר להדביק בוואטסאפ.')
    } catch (_) {
      if (format === 'image') setError('הדפדפן לא אפשר להעתיק תמונה. אפשר להוריד PNG ולצרף אותו בוואטסאפ, או להעתיק טקסט.')
      else {
        inputRef.current?.focus()
        inputRef.current?.select()
        setError('ההעתקה האוטומטית לא זמינה. אפשר להעתיק את הטקסט המסומן ידנית.')
      }
    } finally { setCopying(false) }
  }

  return (
    <AnimatedModal
      open={open}
      title="דוח ביצועים לשחקן"
      iconId="share"
      size="lg"
      onClose={onClose}
      busy={copying}
      contentSx={sx.content}
      footerContent={(
        <Box sx={sx.footer}>
          <Button size="sm" color="success" loading={copying} disabled={!hasSelection || (format === 'image' ? !image || preparing : !message.trim())} onClick={copy} startDecorator={iconUi({ id: 'share', size: 'sm' })}>
            {format === 'image' ? 'העתקת תמונה לוואטסאפ' : 'העתקת טקסט לוואטסאפ'}
          </Button>
          {format === 'image' ? <Button size="sm" variant="outlined" disabled={!image || preparing || copying} onClick={() => downloadPerformanceImage(image)} startDecorator={iconUi({ id: 'download', size: 'sm' })}>הורדת PNG</Button> : null}
          <Button size="sm" variant="plain" color="neutral" disabled={copying} onClick={onClose} sx={sx.close}>סגירה</Button>
        </Box>
      )}
    >
      <Box sx={sx.configuration}>
        <Box sx={sx.controls}>
        {[['image', 'טבלה כתמונה'], ['text', 'טקסט לעריכה']].map(([value, label]) => (
          <Button key={value} size="sm" variant={format === value ? 'solid' : 'soft'} aria-pressed={format === value} disabled={copying} onClick={() => changeFormat(value)} sx={sx.format}>{label}</Button>
        ))}
        <Button size="sm" variant="soft" color="neutral" disabled={copying} aria-expanded={customizing} aria-controls={customizationId} onClick={() => setCustomizing(value => !value)} sx={sx.format}>שורות ועמודות</Button>
        {report.benchmark ? (
          <Select size="sm" value={report.benchmark.positionId || null} placeholder="בחירת עמדה לתקן" aria-label="עמדה לתקן בדוח" disabled={copying} onChange={(_, value) => onPosition?.(value || '')} sx={sx.position}>
            {POSITION_STANDARD.positions.map(position => <Option key={position.id} value={position.id}>{position.label}</Option>)}
          </Select>
        ) : null}
        </Box>
        <CollapseBox
          open={customizing}
          headerSx={sx.selectionCollapseHeader}
          contentSx={sx.selectionCollapse}
          innerSx={sx.selectionCollapseInner}
        >
          <Box id={customizationId} role="region" aria-label="התאמת שורות ועמודות" aria-hidden={!customizing} inert={customizing ? undefined : ''} sx={sx.selectionPanel}>
            <Box sx={sx.customize}>
              <Box>
                <Typography sx={sx.selectionTitle}>עמודות</Typography>
                <Box className="dpScrollThin" sx={sx.selectionList}>
                  {report.columns.map(label => (
                    <Checkbox
                      key={label}
                      size="sm"
                      label={label}
                      checked={!hiddenColumns.includes(label)}
                      disabled={copying}
                      onChange={() => toggleHidden(setHiddenColumns, label)}
                      slotProps={{ input: { 'aria-label': `הצגת עמודה ${label}` } }}
                      sx={sx.selection}
                    />
                  ))}
                </Box>
              </Box>
              <Box>
                <Typography sx={sx.selectionTitle}>שורות</Typography>
                <Box className="dpScrollThin" sx={sx.selectionList}>
                  {report.rows.map(row => (
                    <Checkbox
                      key={row.id}
                      size="sm"
                      label={row.label}
                      checked={!hiddenRows.includes(row.id)}
                      disabled={copying}
                      onChange={() => toggleHidden(setHiddenRows, row.id)}
                      slotProps={{ input: { 'aria-label': `הצגת שורה ${row.label}` } }}
                      sx={sx.selection}
                    />
                  ))}
                </Box>
              </Box>
              <Box sx={sx.selectionActions}>
                <Typography sx={sx.caption}>{visibleReport.rows.length} שורות · {visibleReport.columns.length} עמודות</Typography>
                <Button size="sm" variant="plain" disabled={copying} onClick={() => { setHiddenRows([]); setHiddenColumns([]) }}>הצג הכול</Button>
              </Box>
            </Box>
          </Box>
        </CollapseBox>
      </Box>
      {format === 'image' ? <ReportTable report={visibleReport} /> : (
        <Textarea value={message} onChange={event => { setMessage(event.target.value); setStatus('') }} sx={performanceSx.shareText} slotProps={{ textarea: { ref: inputRef, 'aria-label': 'נוסח ההודעה לשחקן' } }} />
      )}
      {preparing && format === 'image' ? <Typography role="status" sx={sx.caption}>מכין תמונה להעתקה…</Typography> : null}
      {error || (format === 'image' && imageError) ? <Typography role="alert" color="warning" level="body-xs">{error || imageError}</Typography> : null}
      {status ? <Typography role="status" color="success" level="body-sm">{status}</Typography> : null}
    </AnimatedModal>
  )
}
