---
title: "Timer"
---

A timer that counts up or down to a datetime. Timers can be started, stopped and reset whenever needed, and support a variety of display formats. Each Timer displays the same value to all users. Timers can be added to Display Layouts.

<ul>
  <li><strong>Type key:</strong> `timer`</li>
  <li><strong>Creatable:</strong> Yes</li>
  <li><strong>Composition:</strong> No</li>
  <li><strong>Source:</strong> [`src/plugins/timer/plugin.js`](https://github.com/nasa/openmct/blob/master/src/plugins/timer/plugin.js)</li>
</ul>

## Properties Beyond the [Envelope](../object-envelope/index.md)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `configuration.timerFormat` | `"long"` \| `"short"` | `"long"` | `"long"` = DDD hh:mm:ss, `"short"` = hh:mm:ss. |
| `configuration.timestamp` | number \| `undefined` | not set | Target Unix epoch milliseconds the timer counts to/from. |
| `configuration.timezone` | string | `"UTC"` | Timezone used to interpret/display timestamp. |
| `configuration.timerState` | string \| `undefined` | not set | Runtime start/stop/pause state; not typically set when scripting a new object. |
| `configuration.pausedTime` | number \| `undefined` | not set | Runtime paused-at timestamp; not typically set when scripting a new object. |

> **Legacy note:** older persisted `timer` objects may instead have top-level `timerFormat`, `timestamp`,
> `timerState`, `pausedTime` properties. A get-interceptor migrates these into `configuration` on read; when
> scripting new objects, use `configuration` directly.

## Example

```json
{
  "name": "T-Minus to Sunrise",
  "type": "timer",
  "location": "671327d3-e625-435d-8030-1049fc29b9dd",
  "identifier": { "key": "0d1e2f3a-timer-uuid", "namespace": "" },
  "configuration": {
    "timerFormat": "long",
    "timestamp": 1785000000000,
    "timezone": "UTC"
  }
}
```

> `timestamp`, `timerState`, and `pausedTime` default to JavaScript's `undefined`, which has no JSON
> representation — simply omit those keys entirely in a scripted file rather than writing `null`.
