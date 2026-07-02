---
title: "Correlation Telemetry"
---

Combines telemetry from multiple sources to produce telemetry correlated by timestamp with a given time tolerance.

<ul>
  <li><strong>Type key:</strong> `telemetry.correlator`</li>
  <li><strong>Creatable:</strong> Yes</li>
  <li><strong>Composition:</strong> No (sources are referenced by `xSource`/`ySource`, not `composition`)</li>
  <li><strong>Source:</strong> [`src/plugins/correlationTelemetryPlugin/plugin.js`](https://github.com/nasa/openmct/blob/master/src/plugins/correlationTelemetryPlugin/plugin.js)</li>
</ul>

## Properties Beyond the [Envelope](../object-envelope/index.md)

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `telemetry` | object | No | `{}` | This type's own telemetry provider (x/y values, plus each configured time system) is derived at runtime, not scripted. |
| `xSource` | `Array<{ identifier: { key, namespace } }>` | Yes | — | Locator-style array (matches the control: 'locator' form field) wrapping the identifier of the object supplying X-axis values. Note: **array-wrapped**, not a bare identifier. |
| `ySource` | `Array<{ identifier: { key, namespace } }>` | Yes | — | Same shape as xSource, for Y-axis values. |

No `configuration` wrapper — `xSource`/`ySource` are top-level properties. Both must resolve to
telemetry-providing objects with a `range`-hinted value.

## Example

```json
{
  "name": "Subsystem Signal Correlation",
  "type": "telemetry.correlator",
  "location": "671327d3-e625-435d-8030-1049fc29b9dd",
  "identifier": { "key": "1c2d3e4f-correlator-uuid", "namespace": "" },
  "telemetry": {},
  "xSource": [
    { "identifier": { "key": "~Spacecraft~SubSystem~parameterOne", "namespace": "taxonomy" } }
  ],
  "ySource": [
    { "identifier": { "key": "~Spacecraft~SubSystem~parameterTwo", "namespace": "taxonomy" } }
  ]
}
```
