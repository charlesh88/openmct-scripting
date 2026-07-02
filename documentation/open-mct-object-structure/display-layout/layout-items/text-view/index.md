---
title: "Layout Item: Text"
---

A static, editable text label, placed in a Display Layout's `configuration.items[]`. Used for section
headers and static labels (e.g. row/column captions next to a `telemetry-view` item). See
[Display Layout](../../index.md) for how items fit into the parent object.

<ul>
  <li><strong>Item `type`:</strong> `text-view`</li>
  <li><strong>Domain object reference:</strong> No</li>
  <li><strong>Source:</strong> [`src/plugins/displayLayout/components/TextView.vue`](https://github.com/nasa/openmct/blob/master/src/plugins/displayLayout/components/TextView.vue) (`makeDefinition`)</li>
</ul>

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | string (uuid) | — | Unique within the layout. |
| `type` | `"text-view"` | — | Item type discriminator. |
| `x` | number | `1` | Grid-unit X position. |
| `y` | number | `1` | Grid-unit Y position. |
| `width` | number | `10` | Width in grid units. |
| `height` | number | `5` | Height in grid units. |
| `text` | string | — | The literal text to display. Required — has no default. |
| `fill` | string (CSS color) | `""` | Background fill. |
| `stroke` | string (CSS `border` shorthand or color) | `""` | Border. |
| `color` | string (CSS color) | `""` | Text color. |
| `fontSize` | string | `"default"` | Font size, or the sentinel `"default"` to inherit the layout's configuration.fontStyle.fontSize. |
| `font` | string | `"default"` | Font family, or the sentinel `"default"` to inherit the layout's configuration.fontStyle.font. |

Also supports [conditional styling](../../../conditional-styling/index.md) via the parent layout's
`configuration.objectStyles[id]`.

## Example

```json
{
  "id": "f1806674-330a-4832-a6c2-df5cc3619e5c",
  "type": "text-view",
  "x": 0,
  "y": 0,
  "width": 61,
  "height": 4,
  "stroke": "transparent",
  "fontSize": "default",
  "font": "default",
  "text": "Subsystem"
}
```
