---
title: "Scatter Plot"
---

View data as a scatter plot.

<ul>
  <li><strong>Type key:</strong> `telemetry.plot.scatter-plot`</li>
  <li><strong>Creatable:</strong> Yes</li>
  <li><strong>Composition:</strong> Yes — exactly the telemetry object(s) providing X/Y data</li>
  <li><strong>Source:</strong> [`src/plugins/charts/scatter/plugin.js`](https://github.com/nasa/openmct/blob/master/src/plugins/charts/scatter/plugin.js)</li>
</ul>

## Properties Beyond the [Envelope](../object-envelope/index.md)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `composition` | `Array<{ key, namespace }>` | `[]` | Telemetry source(s) for the plot. |
| `configuration.axes` | `{ xKey: string, yKey: string }` | `{}` | Telemetry metadata value keys used for the X and Y axes. Set via the inspector, or script directly once you know the source object's metadata keys. |
| `configuration.styles` | `{ color: string }` | `{}` | Plot point color, as a CSS hex string (e.g. `"#ffcc00"`), auto-assigned from the color palette if unset. |
| `configuration.ranges` | `{ rangeMin?, rangeMax?, domainMin?, domainMax? }` | `{}` | Fixed axis bounds for an optional underlay image (set together — either all four are present or none, per the type's form validator). |
| `selectFile` | form-only, not persisted | not set | The type's create-form supports uploading a JSON underlay image definition (control: 'file-input'); this is consumed at creation time and is not a persisted property. |

## Example

```json
{
  "name": "Position Scatter",
  "type": "telemetry.plot.scatter-plot",
  "location": "671327d3-e625-435d-8030-1049fc29b9dd",
  "identifier": { "key": "3c4d5e6f-scatter-uuid", "namespace": "" },
  "composition": [
    { "key": "aabbccdd-position-telemetry-uuid", "namespace": "" }
  ],
  "configuration": {
    "styles": { "color": "#008afa" },
    "axes": { "xKey": "x_position", "yKey": "y_position" },
    "ranges": {}
  }
}
```
