// features/playersDatabase/components/summary/preview/DetailsPanel.js

import React from 'react'
import {
  Box,
  Button,
  Input,
  Link,
  Option,
  Select,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import {
  getSummaryFallbackValue,
  getSummaryLeagueDetailsRows,
} from '../logic/index.js'
import { detailsSx as sx } from './sx/details.sx.js'

function InfoValue({ label, value }) {
  return (
    <Box sx={sx.infoItem}>
      <Typography level="body-xs" sx={sx.label}>
        {label}
      </Typography>

      <Typography level="body-sm" sx={sx.value}>
        {value || '-'}
      </Typography>
    </Box>
  )
}

function InfoLink({ label, value }) {
  const url = String(getSummaryFallbackValue(value)).trim()

  return (
    <Box sx={sx.infoItem}>
      <Typography level="body-xs" sx={sx.label}>
        {label}
      </Typography>

      {url ? (
        <Link
          href={url}
          target="_blank"
          rel="noreferrer"
          referrerPolicy="no-referrer"
          level="body-sm"
          sx={sx.valueLink}
        >
          פתח קישור ליגה
        </Link>
      ) : (
        <Typography level="body-sm" sx={sx.value}>
          -
        </Typography>
      )}
    </Box>
  )
}

function DetailsActions({
  league,
  editing,
  saving,
  onEdit,
  onCancel,
  onSave,
  onOpenLeague,
}) {
  if (editing) {
    return (
      <Box sx={sx.actions}>
        <Button
          size="sm"
          color="primary"
          loading={saving}
          onClick={onSave}
        >
          שמור
        </Button>

        <Button
          size="sm"
          variant="soft"
          color="neutral"
          disabled={saving}
          onClick={onCancel}
        >
          ביטול
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={sx.actions}>
      <Button
        size="sm"
        variant="outlined"
        color="primary"
        disabled={!league}
        startDecorator={iconUi({ id: 'viewLaeague', size: 'sm' })}
        sx={sx.openLeagueButton}
        onClick={onOpenLeague}
      >
        פתח טבלת ליגה
      </Button>

      <Button
        size="sm"
        variant="soft"
        color="neutral"
        disabled={!league}
        sx={sx.editButton}
        onClick={onEdit}
      >
        ערוך
      </Button>
    </Box>
  )
}

function EditField({ label, children }) {
  return (
    <Box>
      <Typography level="body-xs" sx={sx.label}>
        {label}
      </Typography>

      {children}
    </Box>
  )
}

function DetailsEditForm({ form, saving, onChange }) {
  return (
    <Box sx={sx.editGrid}>
      <EditField label="שם ליגה">
        <Input
          size="sm"
          value={form.leagueName}
          disabled={saving}
          onChange={event => onChange('leagueName', event.target.value)}
        />
      </EditField>

      <EditField label="רמת ליגה">
        <Select
          size="sm"
          value={form.level || null}
          disabled={saving}
          onChange={(event, value) => onChange('level', value || '')}
        >
          <Option value={1}>על</Option>
          <Option value={2}>לאומית</Option>
          <Option value={3}>ארצית</Option>
          <Option value={4}>מחוזית</Option>
        </Select>
      </EditField>

      <EditField label="קבוצת גיל">
        <Input
          size="sm"
          value={form.ageGroupLabel}
          disabled={saving}
          onChange={event => onChange('ageGroupLabel', event.target.value)}
        />
      </EditField>

      <EditField label="אזור">
        <Input
          size="sm"
          value={form.region}
          disabled={saving}
          onChange={event => onChange('region', event.target.value)}
        />
      </EditField>

      <EditField label="קישור ליגה">
        <Input
          size="sm"
          value={form.leagueUrl || ''}
          placeholder="https://www.football.org.il/..."
          disabled={saving}
          onChange={event => onChange('leagueUrl', event.target.value)}
        />
      </EditField>
    </Box>
  )
}

function DetailsInfoGrid({ league }) {
  return (
    <Box sx={sx.infoGrid}>
      {getSummaryLeagueDetailsRows(league).map(row => (
        row.type === 'link' ? (
          <InfoLink
            key={row.id}
            label={row.label}
            value={row.value}
          />
        ) : (
          <InfoValue
            key={row.id}
            label={row.label}
            value={row.value}
          />
        )
      ))}
    </Box>
  )
}

export default function DetailsPanel({
  league,
  form,
  editing,
  saving,
  error,
  children,
  onEdit,
  onCancel,
  onChange,
  onSave,
  onOpenLeague,
}) {
  return (
    <Box sx={sx.panel}>
      <Box sx={sx.header}>
        <Typography level="title-md" sx={sx.title}>
          פרטי ליגה
        </Typography>

        <DetailsActions
          league={league}
          editing={editing}
          saving={saving}
          onEdit={onEdit}
          onCancel={onCancel}
          onSave={onSave}
          onOpenLeague={onOpenLeague}
        />
      </Box>

      {editing ? (
        <DetailsEditForm
          form={form}
          saving={saving}
          onChange={onChange}
        />
      ) : (
        <DetailsInfoGrid league={league} />
      )}

      {error && (
        <Typography sx={sx.error}>
          {error}
        </Typography>
      )}

      {children ? (
        <Box sx={sx.embeddedSection}>
          {children}
        </Box>
      ) : null}
    </Box>
  )
}
