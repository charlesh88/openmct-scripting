---
title: "Hyperlink"
---

A text element or button that links to any URL including Open MCT views.

<ul>
  <li><strong>Type key:</strong> `hyperlink`</li>
  <li><strong>Creatable:</strong> Yes</li>
  <li><strong>Composition:</strong> No</li>
  <li><strong>Source:</strong> [`src/plugins/hyperlink/plugin.js`](https://github.com/nasa/openmct/blob/master/src/plugins/hyperlink/plugin.js)</li>
</ul>

## Properties Beyond the [Envelope](../object-envelope/index.md)

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `url` | string | Yes | — | Target URL. Can be an external URL or an internal Open MCT object URL. |
| `displayText` | string | Yes | — | The text/label shown for the link or button. |
| `displayFormat` | `"link"` \| `"button"` | No | `"link"` | Render as an inline text link or a button. |
| `linkTarget` | `"_self"` \| `"_blank"` | No | `"_self"` | Open in the current tab or a new tab. |

No `configuration` wrapper — these are all top-level properties.

## Example

```json
{
  "name": "Ops Procedure Link",
  "type": "hyperlink",
  "location": "671327d3-e625-435d-8030-1049fc29b9dd",
  "identifier": { "key": "7e8f9a0b-hyperlink-uuid", "namespace": "" },
  "url": "https://example.com/procedures/comm-loss",
  "displayText": "Comm Loss Procedure",
  "displayFormat": "button",
  "linkTarget": "_blank"
}
```
