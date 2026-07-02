---
title: "Overlay Plot"
---

Combine multiple telemetry elements and view them together as a plot with common X and Y axes.

<ul>
  <li><strong>Type key:</strong> `telemetry.plot.overlay`</li>
  <li><strong>Creatable:</strong> Yes</li>
  <li><strong>Composition:</strong> Yes — telemetry objects plotted as series (also embeddable inside a [Stacked Plot](../stacked-plot/index.md))</li>
  <li><strong>Source:</strong> [`src/plugins/plot/plugin.js`](https://github.com/nasa/openmct/blob/master/src/plugins/plot/plugin.js)</li>
</ul>

## Properties Beyond the [Envelope](../object-envelope/index.md)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `composition` | `Array<{ key, namespace }>` | `[]` | Telemetry objects plotted as series, in legend order. |
| `configuration.series` | `Array<SeriesConfig>` | `[]` | Per-series display overrides, keyed by matching identifier to a composed object (see below). An entry is only required when you want to override a series' defaults. |
| `configuration.objectStyles` | object (optional) | `{}` | See [Conditional Styling](../conditional-styling/index.md). |

## SeriesConfig Object

Entries in `configuration.series[]` are matched to a composed telemetry object by `identifier`; any composed
object with no matching entry uses computed defaults (source: `PlotSeries.js#defaultModel`).

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `identifier` | `{ key, namespace }` | — | Identifier of the composed telemetry object this config applies to. |
| `name` | string (optional) | the object's name | Overrides the series legend name. |
| `xKey` | string (optional) | the plot's time system key | Telemetry metadata key used for the X value. |
| `yKey` | string (optional) | the object's first range-hinted value | Telemetry metadata key used for the Y value. |
| `yAxisId` | number (optional) | `1` | `1` for the main Y axis, `2`/`3` for additional Y axes (up to 3 total). |
| `interpolate` | `"linear"` \| `"stepAfter"` \| `"none"` (optional) | not set | Line interpolation between points. |
| `markers` | boolean (optional) | `true` | Show point markers. |
| `markerShape` | string (optional) | `"point"` | E.g. `"point"`, `"circle"`, `"square"`, `"triangle"`, `"diamond"`. |
| `markerSize` | number (optional) | `2.0` | Marker size in px. |
| `alarmMarkers` | boolean (optional) | `true` | Highlight out-of-limit points. |
| `limitLines` | boolean (optional) | `false` | Draw horizontal limit lines. |
| `color` | `{ integerArray: [r, g, b] }` (optional) | auto-assigned from color palette | Series color, `0`–`255` per channel (see src/ui/color/Color.js). Usually best left unset when scripting. |

## configuration.xAxis / configuration.yAxis (Optional)

Left as `{}` by default; Open MCT computes sensible ranges automatically. Set explicitly only to pin an axis:

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `autoscale` | boolean | `true` | `false` to use a fixed range instead of auto-scaling. |
| `autoscalePadding` | number | `0.1` | Fractional padding added around auto-scaled data. |
| `range` | `{ min: number, max: number }` | not set | Fixed axis bounds, used when autoscale is `false`. |
| `logMode` | boolean | `false` | Logarithmic scale (Y axis only). |
| `key` | string | the active time system | Telemetry metadata key driving the axis (X axis only). |

## Example

```json
{
  "name": "Subsystem Signal Quality",
  "type": "telemetry.plot.overlay",
  "location": "671327d3-e625-435d-8030-1049fc29b9dd",
  "identifier": { "key": "1a2b3c4d-overlay-uuid", "namespace": "" },
  "composition": [
    { "key": "~Spacecraft~SubSystem~parameterName", "namespace": "taxonomy" }
  ],
  "configuration": {
    "series": [
      {
        "identifier": { "key": "~Spacecraft~SubSystem~parameterName", "namespace": "taxonomy" },
        "yAxisId": 1,
        "markers": true,
        "markerShape": "point",
        "alarmMarkers": true,
        "limitLines": false
      }
    ],
    "objectStyles": {}
  }
}
```
