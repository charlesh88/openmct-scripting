---
title: "Stacked Plot"
---

Combine multiple telemetry elements and view them together as a plot with a common X axis and individual Y axes.

<ul>
  <li><strong>Type key:</strong> `telemetry.plot.stacked`</li>
  <li><strong>Creatable:</strong> Yes</li>
  <li><strong>Composition:</strong> Yes — telemetry objects, or [Overlay Plots](../overlay-plot/index.md), each rendered as its own stacked row</li>
  <li><strong>Source:</strong> [`src/plugins/plot/plugin.js`](https://github.com/nasa/openmct/blob/master/src/plugins/plot/plugin.js)</li>
</ul>

## Properties Beyond the [Envelope](../object-envelope/index.md)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `composition` | `Array<{ key, namespace }>` | `[]` | One row per composed object. Composing an telemetry.plot.overlay object stacks that plot's own series together as a single row. |
| `configuration.series` | `Array<SeriesConfig>` | `[]` | Same shape as [Overlay Plot's configuration.series](../overlay-plot/index.md#seriesconfig-object). |
| `configuration.xAxis` | object | `{}` | Shared X axis across all rows. Same shape as [Overlay Plot's configuration.xAxis](../overlay-plot/index.md#configurationxaxis--configurationyaxis-optional). |
| `configuration.yAxis` | object | `{}` | Default Y-axis config, per-row rendering still uses each series' own scale. |
| `configuration.objectStyles` | object (optional) | `{}` | See [Conditional Styling](../conditional-styling/index.md). |

## Example

```json
{
  "name": "Subsystem Overview",
  "type": "telemetry.plot.stacked",
  "location": "671327d3-e625-435d-8030-1049fc29b9dd",
  "identifier": { "key": "2b3c4d5e-stacked-uuid", "namespace": "" },
  "composition": [
    { "key": "~Spacecraft~SubSystem~parameterOne", "namespace": "taxonomy" },
    { "key": "~Spacecraft~SubSystem~parameterTwo", "namespace": "taxonomy" }
  ],
  "configuration": {
    "series": [],
    "yAxis": {},
    "xAxis": {},
    "objectStyles": {}
  }
}
```
