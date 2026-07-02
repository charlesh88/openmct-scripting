---
title: "Graph (Bar/Line)"
---

Visualize data as a bar or line graph.

<ul>
  <li><strong>Type key:</strong> `telemetry.plot.bar-graph`</li>
  <li><strong>Creatable:</strong> Yes</li>
  <li><strong>Composition:</strong> Yes — telemetry objects plotted as series</li>
  <li><strong>Source:</strong> [`src/plugins/charts/bar/plugin.js`](https://github.com/nasa/openmct/blob/master/src/plugins/charts/bar/plugin.js)</li>
</ul>

## Properties Beyond the [Envelope](../object-envelope/index.md)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `composition` | `Array<{ key, namespace }>` | `[]` | Telemetry objects plotted as series. |
| `configuration.useBar` | boolean | `true` | `true` renders bars; `false` renders a scatter/line series instead. |
| `configuration.useInterpolation` | `"linear"` \| other Plotly line-shape values | `"linear"` | Line shape when useBar is `false`. |
| `configuration.axes` | object (optional) | `{}` | Populated at runtime, similar in spirit to a plot's axis config; not required to seed manually. |
| `configuration.barStyles.series` | `Record<keyString, SeriesStyle>` | `{}` | Per-series style, **keyed by the composed telemetry object's key string** (namespace:key, not an identifier object). |

## SeriesStyle Object

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `color` | string (CSS hex color) | auto-assigned from color palette | E.g. `"#008afa"`. |
| `name` | string | `""` | Series display name override; `""` uses the object's own name. |
| `type` | string | `""` | Reserved for series-type override. |
| `isAlias` | boolean | `false` | `true` if this series is an alias of another composed object. |

## Example

```json
{
  "name": "Error Counts",
  "type": "telemetry.plot.bar-graph",
  "location": "671327d3-e625-435d-8030-1049fc29b9dd",
  "identifier": { "key": "4d5e6f7a-bar-uuid", "namespace": "" },
  "composition": [
    { "key": "~Spacecraft~SubSystem~parameterName", "namespace": "taxonomy" }
  ],
  "configuration": {
    "useBar": true,
    "useInterpolation": "linear",
    "axes": {},
    "barStyles": {
      "series": {
        "taxonomy:~Spacecraft~SubSystem~parameterName": {
          "color": "#008afa",
          "type": "",
          "name": "",
          "isAlias": false
        }
      }
    }
  }
}
```
