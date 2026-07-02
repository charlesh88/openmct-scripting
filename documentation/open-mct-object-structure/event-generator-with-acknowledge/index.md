---
title: "Event Message Generator with Acknowledge"
---

For development use. Same sample event message stream as the [Event Message Generator](../event-generator/index.md), plus the ability to acknowledge individual event rows in the view — the event row updates in place once acknowledged.

<ul>
  <li><strong>Type key:</strong> `eventGeneratorWithAcknowledge`</li>
  <li><strong>Creatable:</strong> Yes</li>
  <li><strong>Composition:</strong> No</li>
  <li><strong>Source:</strong> [`example/eventGenerator/plugin.js`](https://github.com/nasa/openmct/blob/master/example/eventGenerator/plugin.js)</li>
</ul>

## Properties Beyond the [Envelope](../object-envelope/index.md)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `telemetry.duration` | number | `2.5` | Seconds between each generated event message. |

## Telemetry Values

Not part of the persisted object — computed at runtime from the type key by
[`EventMetadataProvider.js`](https://github.com/nasa/openmct/blob/master/example/eventGenerator/EventMetadataProvider.js).

## Example

```json
{
  "name": "Event Message Generator with Acknowledge",
  "type": "eventGeneratorWithAcknowledge",
  "location": "671327d3-e625-435d-8030-1049fc29b9dd",
  "identifier": { "key": "4c5b6a7f-eventgenack-uuid", "namespace": "" },
  "telemetry": {
    "duration": 2.5
  }
}
```
