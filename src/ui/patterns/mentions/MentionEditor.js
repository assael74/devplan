// src/ui/patterns/mentions/MentionEditor.js

import * as React from 'react'
import { Box, Button, Typography } from '@mui/joy'
import { normalizeMentionContent, safeMentionHref } from './mentionContent.model.js'
import { mentionEditorSx as sx } from './mentionEditor.sx.js'

const readParts = editor => {
  const parts = []
  const addText = text => {
    if (!text) return
    const previous = parts[parts.length - 1]
    if (previous?.type === 'text') previous.text += text
    else parts.push({ type: 'text', text })
  }
  const visit = node => {
    if (node.nodeType === Node.TEXT_NODE) {
      addText(node.textContent || '')
      return
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return
    if (node.dataset?.mentionId) {
      parts.push({
        type: 'mention',
        id: node.dataset.mentionId,
        label: node.dataset.mentionLabel || node.textContent?.replace(/^@/, '') || '',
        href: safeMentionHref(node.dataset.mentionHref),
      })
      return
    }
    if (node.tagName === 'BR') {
      addText('\n')
      return
    }
    if (node.tagName === 'DIV' || node.tagName === 'P') {
      if (parts.length) addText('\n')
    }
    node.childNodes.forEach(visit)
  }
  editor.childNodes.forEach(visit)
  return normalizeMentionContent(parts)
}

const createMention = option => {
  const href = safeMentionHref(option.href)
  const element = document.createElement(href ? 'a' : 'span')
  element.contentEditable = 'false'
  element.dataset.mentionId = String(option.id)
  element.dataset.mentionLabel = String(option.label)
  element.dataset.mentionHref = href
  element.className = 'dpMentionToken'
  element.textContent = `@${option.label}`
  if (href) {
    element.href = href
    element.target = '_blank'
    element.rel = 'noopener noreferrer'
  }
  return element
}

const writeParts = (editor, parts) => {
  const fragment = document.createDocumentFragment()
  normalizeMentionContent(parts).forEach(part => {
    fragment.appendChild(part.type === 'mention'
      ? createMention(part)
      : document.createTextNode(part.text))
  })
  editor.replaceChildren(fragment)
}

const activeQuery = editor => {
  const selection = window.getSelection()
  if (!selection?.rangeCount || !editor.contains(selection.anchorNode)) return null
  if (selection.anchorNode.nodeType !== Node.TEXT_NODE) return null
  const node = selection.anchorNode
  const before = (node.textContent || '').slice(0, selection.anchorOffset)
  const match = before.match(/(?:^|\s)@([^@\n]{0,40})$/)
  if (!match) return null
  const start = before.length - match[1].length - 1
  const range = document.createRange()
  range.setStart(node, start)
  range.setEnd(node, selection.anchorOffset)
  const caret = selection.getRangeAt(0).getBoundingClientRect?.()
  const bounds = editor.getBoundingClientRect?.()
  return {
    text: match[1].trim().toLocaleLowerCase(),
    range,
    top: caret && bounds ? Math.max(8, Math.min(caret.bottom - bounds.top + 6, bounds.height - 188)) : 8,
  }
}

export default function MentionEditor({
  value,
  onChange,
  options = [],
  placeholder = '',
  ariaLabel = '',
  className = '',
  tabIndex = 0,
}) {
  const editorRef = React.useRef(null)
  const lastEmitted = React.useRef('')
  const queryRange = React.useRef(null)
  const [query, setQuery] = React.useState(null)
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const normalized = normalizeMentionContent(value)
  const serialized = JSON.stringify(normalized)
  const matches = query === null ? [] : options
    .filter(option => option?.id && option?.label)
    .filter(option => String(option.label).toLocaleLowerCase().includes(query.text))
    .slice(0, 8)

  React.useEffect(() => {
    const editor = editorRef.current
    if (!editor || serialized === lastEmitted.current) return
    writeParts(editor, normalized)
    lastEmitted.current = serialized
    setQuery(null)
  }, [serialized])

  const refreshQuery = () => {
    const next = activeQuery(editorRef.current)
    queryRange.current = next?.range || null
    setQuery(next ? { text: next.text, top: next.top } : null)
    setSelectedIndex(0)
  }

  const emitChange = () => {
    const next = readParts(editorRef.current)
    lastEmitted.current = JSON.stringify(next)
    onChange?.(next)
    refreshQuery()
  }

  const selectMention = option => {
    const range = queryRange.current
    if (!range || !editorRef.current?.contains(range.startContainer)) return
    range.deleteContents()
    const mention = createMention(option)
    const space = document.createTextNode(' ')
    range.insertNode(space)
    range.insertNode(mention)
    const after = document.createRange()
    after.setStartAfter(space)
    after.collapse(true)
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(after)
    editorRef.current.focus()
    queryRange.current = null
    setQuery(null)
    const next = readParts(editorRef.current)
    lastEmitted.current = JSON.stringify(next)
    onChange?.(next)
  }

  const handleKeyDown = event => {
    if (query === null || !matches.length) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelectedIndex(index => (index + 1) % matches.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelectedIndex(index => (index + matches.length - 1) % matches.length)
    } else if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault()
      selectMention(matches[selectedIndex])
    } else if (event.key === 'Escape') {
      event.preventDefault()
      queryRange.current = null
      setQuery(null)
    }
  }

  const handlePaste = event => {
    event.preventDefault()
    const text = event.clipboardData.getData('text/plain')
    const selection = window.getSelection()
    if (!selection?.rangeCount) return
    const range = selection.getRangeAt(0)
    range.deleteContents()
    const node = document.createTextNode(text)
    range.insertNode(node)
    range.setStartAfter(node)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
    emitChange()
  }

  return (
    <Box sx={sx.root} className={className}>
      <Box
        ref={editorRef}
        component='div'
        contentEditable
        suppressContentEditableWarning
        role='textbox'
        tabIndex={tabIndex}
        aria-label={ariaLabel}
        aria-multiline='true'
        data-placeholder={placeholder}
        data-empty={normalized.every(part => part.type === 'text' && !part.text) ? 'true' : 'false'}
        className='dpScrollThin'
        sx={sx.editor}
        onInput={emitChange}
        onKeyUp={event => { if (event.key !== 'Escape') refreshQuery() }}
        onMouseUp={refreshQuery}
        onCompositionEnd={emitChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={() => setQuery(null)}
      />
      {query !== null && matches.length > 0 && (
        <Box role='listbox' aria-label='הצעות אזכור' className='dpScrollThin' sx={{ ...sx.suggestions, top: query.top }}>
          {matches.map((option, index) => (
            <Button
              key={option.id}
              role='option'
              aria-selected={index === selectedIndex}
              variant={index === selectedIndex ? 'soft' : 'plain'}
              sx={sx.option}
              onMouseDown={event => event.preventDefault()}
              onClick={() => selectMention(option)}
            >
              <Typography level='body-sm'>{option.label}</Typography>
            </Button>
          ))}
        </Box>
      )}
    </Box>
  )
}
