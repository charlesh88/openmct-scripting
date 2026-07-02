---
title: "State Generator"
---

For development use. Generates example enumerated telemetry by cycling through a fixed set of states — useful for testing enum-based views (e.g. condition sets, alphanumeric displays) without a real telemetry source.

<ul>
  <li><strong>Type key:</strong> `example.state-generator`</li>
  <li><strong>Creatable:</strong> Yes</li>
  <li><strong>Composition:</strong> No</li>
  <li><strong>Source:</strong> [`example/generator/plugin.js`](https://github.com/nasa/openmct/blob/master/example/generator/plugin.js)</li>
</ul>

## Properties Beyond the [Envelope](../object-envelope/index.md)

All settings live under the top-level `telemetry` object — not `configuration`.

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `telemetry.duration` | number | `5` | Seconds spent in each state before cycling to the next. |
| `telemetry.outOfOrder` | boolean | `false` | Occasionally emit samples out of chronological order, for testing sort/handling of out-of-order data. |

## Telemetry Values

Not part of the persisted object — computed at runtime from the type key by
[`GeneratorMetadataProvider.js`](https://github.com/nasa/openmct/blob/master/example/generator/GeneratorMetadataProvider.js).
The `state` value is a fixed enum with three possible states — `OFF` (`0`), `ON` (`1`), `OUT OF ORDER` (`99`) —
not configurable per-object.

## Example

```json
{
  "name": "State Generator",
  "type": "example.state-generator",
  "location": "671327d3-e625-435d-8030-1049fc29b9dd",
  "identifier": { "key": "2e3d4c5b-stategen-uuid", "namespace": "" },
  "telemetry": {
    "duration": 5,
    "outOfOrder": false
  }
}
```
