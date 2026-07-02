---
title: "Telemetry Table"
---

Display values for one or more telemetry end points in a scrolling table. Each row is a time-stamped value.

<ul>
  <li><strong>Type key:</strong> `table`</li>
  <li><strong>Creatable:</strong> Yes</li>
  <li><strong>Composition:</strong> Yes — telemetry objects, one column set per object</li>
  <li><strong>Source:</strong> [`src/plugins/telemetryTable/TelemetryTableType.js`](https://github.com/nasa/openmct/blob/master/src/plugins/telemetryTable/TelemetryTableType.js), [`src/plugins/telemetryTable/constants.js`](https://github.com/nasa/openmct/blob/master/src/plugins/telemetryTable/constants.js)</li>
</ul>

## Properties Beyond the [Envelope](../object-envelope/index.md)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `composition` | `Array<{ key, namespace }>` | `[]` | Telemetry objects contributing columns/rows. |
| `configuration.telemetryMode` | `"performance"` \| `"unlimited"` | set by plugin install (typically `"performance"`) | Data mode (`MODE` in constants.js). `"performance"` caps in-memory rows to rowLimit; `"unlimited"` keeps all received rows. |
| `configuration.persistModeChange` | boolean | set by plugin install | Whether a user's runtime toggle between modes is saved back to the object. |
| `configuration.rowLimit` | number | set by plugin install | Row cap used in `"performance"` mode. |
| `configuration.columnWidths` | object | `{}` (auto-sized) | Per-column pixel widths, keyed by column key. |
| `configuration.hiddenColumns` | object | `{}` (all visible) | Per-column visibility, keyed by column key (`true` = hidden). |
| `configuration.objectStyles` | object (optional) | `{}` | Row-level conditional styling. See [Conditional Styling](../conditional-styling/index.md). |

## Example

```json
{
  "name": "Subsystem Telemetry Table",
  "type": "table",
  "location": "671327d3-e625-435d-8030-1049fc29b9dd",
  "identifier": { "key": "8b9c0d1e-table-uuid", "namespace": "" },
  "composition": [
    { "key": "~Spacecraft~SubSystem~parameterName", "namespace": "taxonomy" }
  ],
  "configuration": {
    "telemetryMode": "performance",
    "persistModeChange": true,
    "rowLimit": 1000,
    "columnWidths": {},
    "hiddenColumns": {},
    "objectStyles": {}
  }
}
```
