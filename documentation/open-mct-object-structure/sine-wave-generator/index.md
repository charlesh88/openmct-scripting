---
title: "Sine Wave Generator"
---

For development use. Generates example streaming telemetry data using a simple sine wave algorithm — useful for populating plots, tables, and layouts with live-looking data without a real telemetry source.

<ul>
  <li><strong>Type key:</strong> `generator`</li>
  <li><strong>Creatable:</strong> Yes</li>
  <li><strong>Composition:</strong> No</li>
  <li><strong>Source:</strong> [`example/generator/plugin.js`](https://github.com/nasa/openmct/blob/master/example/generator/plugin.js)</li>
</ul>

## Properties Beyond the [Envelope](../object-envelope/index.md)

All settings live under the top-level `telemetry` object — not `configuration` — since this type has no
container/layout behavior of its own, only telemetry-provider settings.

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `telemetry.period` | number | `10` | Wave period, in seconds. |
| `telemetry.amplitude` | number | `1` | Wave amplitude. |
| `telemetry.offset` | number | `0` | Vertical offset added to the wave. |
| `telemetry.dataRateInHz` | number | `1` | How many samples to emit per second. |
| `telemetry.phase` | number | `0` | Phase offset, in radians. |
| `telemetry.randomness` | number | `0` | Amount of random noise added to each sample. |
| `telemetry.loadDelay` | number | `0` | Artificial delay (ms) before historical requests resolve — useful for testing loading states. |
| `telemetry.infinityValues` | boolean | `false` | Occasionally emit `Infinity`/`-Infinity` samples, for testing edge-case rendering. |
| `telemetry.exceedFloat32` | boolean | `false` | Occasionally emit values outside the Float32 range, for testing edge-case rendering. |
| `telemetry.staleness` | boolean | `false` | Periodically stop emitting data so the object reports as [stale](https://github.com/nasa/openmct/blob/master/example/generator/SinewaveStalenessProvider.js). |

## Telemetry Values

Not part of the persisted object — computed at runtime from the type key by
[`GeneratorMetadataProvider.js`](https://github.com/nasa/openmct/blob/master/example/generator/GeneratorMetadataProvider.js),
purely so other views (plots, tables, layouts) know what fields are available. Useful when writing a
`value`/`yKey` elsewhere that points at this object: `name`, `utc` (domain), `yesterday` (domain), `sin`
(range, unit `Hz`), `cos` (range, unit `deg`), `wavelengths` (range, `string[]`), `intensities` (range,
`number[]`).

## Example

```json
{
  "name": "Sine Wave Generator",
  "type": "generator",
  "location": "671327d3-e625-435d-8030-1049fc29b9dd",
  "identifier": { "key": "1f2e3d4c-sinewave-uuid", "namespace": "" },
  "telemetry": {
    "period": 10,
    "amplitude": 1,
    "offset": 0,
    "dataRateInHz": 1,
    "phase": 0,
    "randomness": 0,
    "loadDelay": 0,
    "infinityValues": false,
    "exceedFloat32": false,
    "staleness": false
  }
}
```
