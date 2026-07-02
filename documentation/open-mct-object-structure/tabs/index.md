---
title: "Tabs View"
---

Quickly navigate between multiple objects of any type using tabs.

<ul>
  <li><strong>Type key:</strong> `tabs`</li>
  <li><strong>Creatable:</strong> Yes</li>
  <li><strong>Composition:</strong> Yes — any object type, one per tab</li>
  <li><strong>Source:</strong> [`src/plugins/tabs/plugin.js`](https://github.com/nasa/openmct/blob/master/src/plugins/tabs/plugin.js)</li>
</ul>

## Properties Beyond the [Envelope](../object-envelope/index.md)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `composition` | `Array<{ key, namespace }>` | `[]` | One tab per composed object, in tab order. |
| `keep_alive` | boolean | `false` (unless the application's install of the plugin sets `eagerLoad`) | `true` keeps every tab's view mounted/updating even when not active (eager load); `false` mounts a tab's view only when selected. No configuration wrapper — this is a top-level property. |

## Example

```json
{
  "name": "Spacecraft Subsystems",
  "type": "tabs",
  "location": "671327d3-e625-435d-8030-1049fc29b9dd",
  "identifier": { "key": "9a0b1c2d-tabs-uuid", "namespace": "" },
  "composition": [
    { "key": "aabbccdd-plot-uuid", "namespace": "" },
    { "key": "eeff0011-table-uuid", "namespace": "" }
  ],
  "keep_alive": false
}
```
