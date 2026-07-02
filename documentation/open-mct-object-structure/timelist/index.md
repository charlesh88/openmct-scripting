---
title: "Time List"
---

A configurable, time-ordered list view of activities for a compatible mission plan file.

<ul>
  <li><strong>Type key:</strong> `timelist`</li>
  <li><strong>Creatable:</strong> Yes</li>
  <li><strong>Composition:</strong> Yes — Plan-compatible objects providing activities</li>
  <li><strong>Source:</strong> [`src/plugins/timelist/plugin.js`](https://github.com/nasa/openmct/blob/master/src/plugins/timelist/plugin.js)</li>
</ul>

## Properties Beyond the [Envelope](../object-envelope/index.md)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `composition` | `Array<{ key, namespace }>` | `[]` | Objects (typically a [Plan](../plan/index.md)) providing the activity list. |
| `configuration.sortOrderIndex` | number | `0` | Index into the sort-order options (start/end, ascending/descending). |
| `configuration.currentEventsIndex` | number | `1` | Index selecting which activity group is treated as "current". |
| `configuration.filter` | string | `""` | Free-text filter applied to activity names. |
| `configuration.filterMetadata` | string | `""` | Key of an activity metadata field the filter also matches against. |
| `configuration.isCompact` | boolean | `false` | Compact row rendering. |

## Example

```json
{
  "name": "Command Sequence",
  "type": "timelist",
  "location": "671327d3-e625-435d-8030-1049fc29b9dd",
  "identifier": { "key": "2f3a4b5c-timelist-uuid", "namespace": "" },
  "composition": [
    { "key": "3a4b5c6d-plan-uuid", "namespace": "" }
  ],
  "configuration": {
    "sortOrderIndex": 0,
    "currentEventsIndex": 1,
    "filter": "",
    "filterMetadata": "",
    "isCompact": false
  }
}
```
