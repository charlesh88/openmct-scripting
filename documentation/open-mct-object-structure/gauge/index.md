---
title: "Gauge"
---

Graphically visualize a telemetry element's current value between a minimum and maximum.

<ul>
  <li><strong>Type key:</strong> `gauge`</li>
  <li><strong>Creatable:</strong> Yes</li>
  <li><strong>Composition:</strong> Yes — exactly one telemetry object, in practice (a composition policy restricts this)</li>
  <li><strong>Source:</strong> [`src/plugins/gauge/GaugePlugin.js`](https://github.com/nasa/openmct/blob/master/src/plugins/gauge/GaugePlugin.js)</li>
</ul>

## Properties Beyond the [Envelope](../object-envelope/index.md)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `composition` | `Array<{ key, namespace }>` | `[]` | The telemetry source. |
| `configuration.objectStyles` | object (optional) | `{}` | See [Conditional Styling](../conditional-styling/index.md). |
| `configuration.gaugeController` | object | — | The gauge's display and range settings — see below. |

## configuration.gaugeController Object

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `gaugeType` | string | `"dial-filled"` | One of `"dial-filled"`, `"dial-needle"`, `"meter-vertical"`, `"meter-vertical-inverted"`, `"meter-horizontal"` (`GAUGE_TYPES` in GaugePlugin.js). |
| `isDisplayMinMax` | boolean | `true` | Show the min/max range labels. |
| `isDisplayCurVal` | boolean | `true` | Show the current value. |
| `isDisplayUnits` | boolean | `true` | Show the telemetry unit alongside the value. |
| `isUseTelemetryLimits` | boolean | `true` | `true` derives the low/high limit markers from the telemetry object's own limit definitions; `false` uses the explicit limitLow/limitHigh below. |
| `limitLow` | number | `10` | Low limit marker value, used when isUseTelemetryLimits is `false`. Must satisfy `min <= limitLow < max`. |
| `limitHigh` | number | `90` | High limit marker value, used when isUseTelemetryLimits is `false`. Must satisfy `min < limitHigh <= max`, and `limitLow <= limitHigh`. |
| `min` | number | `0` | Gauge range minimum. |
| `max` | number | `100` | Gauge range maximum. Must be >= min. |
| `precision` | number | `2` | Decimal places shown for the current value. |

## Example

```json
{
  "name": "Subsystem Signal Gauge",
  "type": "gauge",
  "location": "671327d3-e625-435d-8030-1049fc29b9dd",
  "identifier": { "key": "5e6f7a8b-gauge-uuid", "namespace": "" },
  "composition": [
    { "key": "~Spacecraft~SubSystem~parameterName", "namespace": "taxonomy" }
  ],
  "configuration": {
    "gaugeController": {
      "gaugeType": "dial-needle",
      "isDisplayMinMax": true,
      "isDisplayCurVal": true,
      "isDisplayUnits": true,
      "isUseTelemetryLimits": false,
      "limitLow": 5,
      "limitHigh": 95,
      "max": 100,
      "min": 0,
      "precision": 1
    },
    "objectStyles": {}
  }
}
```
