---
title: "LAD Table / LAD Table Set"
---

<ul>
  <li><strong>Source:</strong> [`src/plugins/LADTable/plugin.js`](https://github.com/nasa/openmct/blob/master/src/plugins/LADTable/plugin.js)</li>
</ul>

Two related, minimal types with no `form` and very little configuration.

## LAD Table

Display the current value for one or more telemetry end points in a fixed table. Each row is a telemetry end point.

<ul>
  <li><strong>Type key:</strong> `LadTable`</li>
  <li><strong>Creatable:</strong> Yes</li>
  <li><strong>Composition:</strong> Yes — telemetry objects, one row per object</li>
</ul>

### Properties beyond the [envelope](../object-envelope/index.md)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `composition` | `Array<{ key, namespace }>` | `[]` | One row per telemetry object. |
| `configuration.objectStyles` | object (optional) | `{}` | Row-level conditional styling. See [Conditional Styling](../conditional-styling/index.md). |

### Example

```json
{
  "name": "Subsystem LAD",
  "type": "LadTable",
  "location": "671327d3-e625-435d-8030-1049fc29b9dd",
  "identifier": { "key": "6f7a8b9c-lad-uuid", "namespace": "" },
  "composition": [
    { "key": "~Spacecraft~SubSystem~parameterOne", "namespace": "taxonomy" },
    { "key": "~Spacecraft~SubSystem~parameterTwo", "namespace": "taxonomy" }
  ],
  "configuration": { "objectStyles": {} }
}
```

## LAD Table Set

Group LAD Tables together into a single view with sub-headers.

<ul>
  <li><strong>Type key:</strong> `LadTableSet`</li>
  <li><strong>Creatable:</strong> Yes</li>
  <li><strong>Composition:</strong> Yes — `LadTable` objects (or other composable objects), each rendered as a sub-headed group</li>
</ul>

### Properties beyond the [envelope](../object-envelope/index.md)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `composition` | `Array<{ key, namespace }>` | `[]` | One group/sub-header per composed object, typically LadTable objects. |

LAD Table Set has no `configuration` object of its own.

### Example

```json
{
  "name": "Spacecraft LAD Overview",
  "type": "LadTableSet",
  "location": "671327d3-e625-435d-8030-1049fc29b9dd",
  "identifier": { "key": "7a8b9c0d-ladset-uuid", "namespace": "" },
  "composition": [
    { "key": "6f7a8b9c-lad-uuid", "namespace": "" }
  ]
}
```
