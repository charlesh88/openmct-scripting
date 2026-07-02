---
title: "Example Data Visualization Source"
---

An example data visualization source to be used with an inspector — for development use, demonstrating how a container type can restrict its composition to telemetry-producing objects only.

<ul>
  <li><strong>Type key:</strong> `exampleDataVisualizationSource`</li>
  <li><strong>Creatable:</strong> Yes</li>
  <li><strong>Composition:</strong> Yes — telemetry-producing objects only (a composition policy rejects any composed object without a `telemetry` property)</li>
  <li><strong>Source:</strong> [`example/dataVisualization/plugin.js`](https://github.com/nasa/openmct/blob/master/example/dataVisualization/plugin.js)</li>
</ul>

## Properties Beyond the [Envelope](../object-envelope/index.md)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `composition` | `Array<{ key, namespace }>` | `[]` | Telemetry-producing objects (e.g. a [Sine Wave Generator](../sine-wave-generator/index.md)) visualized by this source. |

## Example

```json
{
  "name": "Example Data Visualization Source",
  "type": "exampleDataVisualizationSource",
  "location": "671327d3-e625-435d-8030-1049fc29b9dd",
  "identifier": { "key": "6a7f8e9d-exampledv-uuid", "namespace": "" },
  "composition": [
    { "key": "1f2e3d4c-sinewave-uuid", "namespace": "" }
  ]
}
```
