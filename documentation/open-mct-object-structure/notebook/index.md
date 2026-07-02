---
title: "Notebook / Notebook Shift Log"
---

Create and save timestamped notes with embedded object snapshots.

<ul>
  <li><strong>Source:</strong> [`src/plugins/notebook/NotebookType.js`](https://github.com/nasa/openmct/blob/master/src/plugins/notebook/NotebookType.js), [`src/plugins/notebook/plugin.js`](https://github.com/nasa/openmct/blob/master/src/plugins/notebook/plugin.js)</li>
</ul>

Both types share one implementation (`NotebookType`); only the `type` key, display name, and icon differ,
selected by which of `NotebookPlugin()` / `RestrictedNotebookPlugin()` is installed.

| | Type key | Notes |
| --- | --- | --- |
| Notebook | `notebook` | Standard notebook. |
| Notebook Shift Log | `restricted-notebook` | Adds the ability to commit and lock pages; same persisted shape. |

<ul>
  <li><strong>Creatable:</strong> Yes</li>
  <li><strong>Composition:</strong> No (entries and their embedded object snapshots live in `configuration`, not `composition`)</li>
</ul>

## Properties Beyond the [Envelope](../object-envelope/index.md)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `configuration.defaultSort` | `"newest"` \| `"oldest"` | `"oldest"` | Default entry sort order. |
| `configuration.pageTitle` | string | `"Page"` | Label used for pages. |
| `configuration.sectionTitle` | string | `"Section"` | Label used for sections. |
| `configuration.type` | string | `"General"` | Notebook "type" tag used to scope search/filtering. |
| `configuration.imageMigrationVer` | string | `"v1"` | Internal schema-version marker for image-embedding migrations (`IMAGE_MIGRATION_VER` in notebook-migration.js). Set to the current value at creation time; not meaningful to hand-author beyond copying the current constant. |
| `configuration.sections` | array | `[]` | Notebook sections (each with nested pages). Entries, sections, and pages are normally authored through the UI, not hand-scripted, given their nested ID-linked structure. |
| `configuration.entries` | object | `{}` | Map of page ID → entries for that page. |

Because a notebook's real content (sections → pages → timestamped entries, each with its own id, embedded
snapshot references, and tags) is deeply nested and UI-authored, this reference only covers the
type-level shape needed to create an **empty** notebook by script. Populating entries programmatically is not
a supported/documented workflow.

## Example

```json
{
  "name": "Shift Handover Notes",
  "type": "notebook",
  "location": "671327d3-e625-435d-8030-1049fc29b9dd",
  "identifier": { "key": "5c6d7e8f-notebook-uuid", "namespace": "" },
  "configuration": {
    "defaultSort": "oldest",
    "entries": {},
    "imageMigrationVer": "v1",
    "pageTitle": "Page",
    "sections": [],
    "sectionTitle": "Section",
    "type": "General"
  }
}
```
