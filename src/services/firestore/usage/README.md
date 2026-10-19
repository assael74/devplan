# Firestore usage measurement

This module observes client operations; it does not reproduce Firestore Billing
or measure network bytes. No usage data is persisted to Firestore.

Snapshot `measurementVersion: 2` separates observed server reads from local cache
events. `readsCount` / `reads` and `estimatedKb` / `estimatedReadKb` exclude read
events marked `fromCache`. Their document counts and JSON sizes are retained in
`cacheReadsCount` / `cacheReads` and `estimatedCacheReadKb`. Cache payload is not
included in expensive actions or the server payload total. Explicit zero counts,
including unsuccessful writes and deletes, remain zero.

The first successful server snapshot of a registered listener is `initial`;
subsequent server snapshots are `update`. Cache and error events do not advance
this lifecycle or increment server snapshot counters. Reset clears measurements
while preserving the lifecycle of currently active listeners.
Active counts change only when a known listener is added or removed from the
registry. Repeated or unknown close events remain in diagnostic history without
decreasing another listener's active count. Generated ids are not reused on reset.

The source page is recorded in each event's `route`; document-read wrappers also
record the document id as `shortKey`. Live tabs share new events and resets through
`BroadcastChannel`; this is not a durable history or a backfill of earlier events.

Only delivered SDK events are observed. A listener without metadata events may
deliver cached data without a separate server event when the data is unchanged.
Transactions, queries, index reads and other SDK behavior also limit billing
accuracy. Payload size is serialized JSON, not Firestore storage size.

The dashboard uses one action-size threshold definition for both table severity
and alerts. Cumulative collection payload is informational. Action payload can
contain multiple documents, so its thresholds are performance indicators and
must not be interpreted as document-size limits.

Version 3 adds `byDocument` for identified full-document read samples, including
query results. Each row keeps the last and maximum observed JSON size, server and
cache observation counts, and their separate cumulative payloads. Feature filters
use their own document aggregates. These aggregates survive recent-event trimming
and clear on measurement reset. Write patches and transaction totals are not used
to infer the size of a full document. Unidentified payloads are not divided across
documents or assigned guessed ids.

After changing measurement versions, reload participating tabs and reset before
recording a new scenario. Export JSON from `/admin/firestore-usage` in the same tab
after performing the scenario, without reloading between the scenario and export.
