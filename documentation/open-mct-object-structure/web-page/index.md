---
title: "Web Page"
---

Embed a web page or web-based image in a resizeable window component. Note that the URL being embedded must allow iframing.

<ul>
  <li><strong>Type key:</strong> `webPage`</li>
  <li><strong>Creatable:</strong> Yes</li>
  <li><strong>Composition:</strong> No</li>
  <li><strong>Source:</strong> [`src/plugins/webPage/plugin.js`](https://github.com/nasa/openmct/blob/master/src/plugins/webPage/plugin.js)</li>
</ul>

## Properties Beyond the [Envelope](../object-envelope/index.md)

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `url` | string | Yes | — | The URL to embed in an `<iframe>`. No configuration wrapper — this is a top-level property. |

Web Page has no `initialize()` function, so no defaults are set automatically; `url` must be supplied.

## Example

```json
{
  "name": "Spacecraft Ops Wiki",
  "type": "webPage",
  "location": "671327d3-e625-435d-8030-1049fc29b9dd",
  "identifier": { "key": "6d7e8f9a-webpage-uuid", "namespace": "" },
  "url": "https://example.com/rover-ops"
}
```
