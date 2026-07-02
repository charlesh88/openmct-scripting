---
title: "Time Strip"
---

Compose and display time-based telemetry and other object types in a timeline-like view.

<ul>
  <li><strong>Type key:</strong> `time-strip`</li>
  <li><strong>Creatable:</strong> Yes</li>
  <li><strong>Composition:</strong> Yes — telemetry, activity, or plan-like objects, each rendered as a swim lane</li>
  <li><strong>Source:</strong> [`src/plugins/timeline/plugin.js`](https://github.com/nasa/openmct/blob/master/src/plugins/timeline/plugin.js), [`src/plugins/timeline/configuration.js`](https://github.com/nasa/openmct/blob/master/src/plugins/timeline/configuration.js), [`src/plugins/timeline/Container.js`](https://github.com/nasa/openmct/blob/master/src/plugins/timeline/Container.js)</li>
</ul>

## Properties Beyond the [Envelope](../object-envelope/index.md)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `composition` | `Array<{ key, namespace }>` | `[]` | One swim lane per composed object. |
| `configuration.useIndependentTime` | boolean | `false` | `true` decouples this Time Strip's time bounds from the global time conductor. |
| `configuration.swimLaneLabelWidth` | number | `200` | Pixel width reserved for swim lane labels. |
| `configuration.containers` | `Array<Container>` | `[]` | One entry per swim lane, in display order. Entries are normally added as objects are dropped in, but can be scripted directly to match composition. |

## Container Object

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `domainObjectIdentifier` | `{ key, namespace }` | — | Identifier of the swim lane's object. Should match an entry in composition. |
| `size` | number | — | Lane size, in percentage or pixels depending on fixed. |
| `scale` | number | `1` (or the stacked plot's composition length, if nested) | Relative scale weight. For a nested telemetry.plot.stacked, defaults to that plot's own composition length (so each of its stacked rows gets proportional height). |
| `fixed` | boolean | `false` | `true` = size is a fixed pixel height; `false` = flexible/percentage. |

## Example

```json
{
  "name": "Command Timeline",
  "type": "time-strip",
  "location": "671327d3-e625-435d-8030-1049fc29b9dd",
  "identifier": { "key": "1e2f3a4b-timestrip-uuid", "namespace": "" },
  "composition": [
    { "key": "~Spacecraft~SubSystem~parameterName", "namespace": "taxonomy" }
  ],
  "configuration": {
    "useIndependentTime": false,
    "swimLaneLabelWidth": 200,
    "containers": [
      {
        "domainObjectIdentifier": { "key": "~Spacecraft~SubSystem~parameterName", "namespace": "taxonomy" },
        "size": 100,
        "scale": 1,
        "fixed": false
      }
    ]
  }
}
```
