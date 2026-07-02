---
title: "Clock"
---

A digital clock that uses system time and supports a variety of display formats and timezones.

<ul>
  <li><strong>Type key:</strong> `clock`</li>
  <li><strong>Creatable:</strong> Yes</li>
  <li><strong>Composition:</strong> No</li>
  <li><strong>Source:</strong> [`src/plugins/clock/plugin.js`](https://github.com/nasa/openmct/blob/master/src/plugins/clock/plugin.js)</li>
</ul>

## Properties Beyond the [Envelope](../object-envelope/index.md)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `configuration.baseFormat` | string | `"YYYY/MM/DD hh:mm:ss"` | A moment.js-style format string. The create-form offers `"YYYY/MM/DD hh:mm:ss"`, `"YYYY/DDD hh:mm:ss"`, `"hh:mm:ss"`, but any valid moment format string works. |
| `configuration.use24` | `"clock12"` \| `"clock24"` | `"clock12"` | 12- vs 24-hour display. |
| `configuration.timezone` | string | `"UTC"` | An IANA timezone name (e.g. `"UTC"`, `"America/Los_Angeles"`) — any value from moment-timezone's `tz.names()`. |

> **Legacy note:** older persisted `clock` objects may instead have top-level `clockFormat: [baseFormat, use24]`
> and `timezone` properties. A get-interceptor migrates these into `configuration` on read; when scripting new
> objects, use `configuration` directly.

## Example

```json
{
  "name": "Mission Clock (UTC)",
  "type": "clock",
  "location": "671327d3-e625-435d-8030-1049fc29b9dd",
  "identifier": { "key": "9c0d1e2f-clock-uuid", "namespace": "" },
  "configuration": {
    "baseFormat": "YYYY/DDD hh:mm:ss",
    "use24": "clock24",
    "timezone": "UTC"
  }
}
```
