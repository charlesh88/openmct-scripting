---
title: "Event Message Generator"
---

For development use. Creates sample event message data that mimics a live data stream — useful for testing event/message views without a real telemetry source.

<ul>
  <li><strong>Type key:</strong> `eventGenerator`</li>
  <li><strong>Creatable:</strong> Yes</li>
  <li><strong>Composition:</strong> No</li>
  <li><strong>Source:</strong> [`example/eventGenerator/plugin.js`](https://github.com/nasa/openmct/blob/master/example/eventGenerator/plugin.js)</li>
</ul>

## Properties Beyond the [Envelope](../object-envelope/index.md)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `telemetry.duration` | number | `5` | Seconds between each generated event message. |

## Telemetry Values

Not part of the persisted object — computed at runtime from the type key by
[`EventMetadataProvider.js`](https://github.com/nasa/openmct/blob/master/example/eventGenerator/EventMetadataProvider.js).

## Example

```json
{
  "name": "Event Message Generator",
  "type": "eventGenerator",
  "location": "671327d3-e625-435d-8030-1049fc29b9dd",
  "identifier": { "key": "3d4c5b6a-eventgen-uuid", "namespace": "" },
  "telemetry": {
    "duration": 5
  }
}
```
