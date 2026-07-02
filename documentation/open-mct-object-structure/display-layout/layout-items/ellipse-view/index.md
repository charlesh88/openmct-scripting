---
title: "Layout Item: Ellipse"
---

A filled ellipse drawing primitive, placed in a Display Layout's `configuration.items[]`. See
[Display Layout](../../index.md) for how items fit into the parent object.

<ul>
  <li><strong>Item `type`:</strong> `ellipse-view`</li>
  <li><strong>Domain object reference:</strong> No</li>
  <li><strong>Source:</strong> [`src/plugins/displayLayout/components/EllipseView.vue`](https://github.com/nasa/openmct/blob/master/src/plugins/displayLayout/components/EllipseView.vue) (`makeDefinition`)</li>
</ul>

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | string (uuid) | — | Unique within the layout. |
| `type` | `"ellipse-view"` | — | Item type discriminator. |
| `x` | number | `1` | Grid-unit X position of the bounding box's top-left corner. |
| `y` | number | `1` | Grid-unit Y position of the bounding box's top-left corner. |
| `width` | number | `10` | Bounding box width in grid units. |
| `height` | number | `10` | Bounding box height in grid units. |
| `fill` | string (CSS color) | `"#666666"` | Fill color. |
| `stroke` | string (CSS `border` shorthand or color) | `""` | Border. |

Also supports [conditional styling](../../../conditional-styling/index.md) via the parent layout's
`configuration.objectStyles[id]`.

## Example

```json
{
  "id": "f2b3c4d5-2222-4444-8888-999999999999",
  "type": "ellipse-view",
  "x": 5,
  "y": 5,
  "width": 12,
  "height": 12,
  "fill": "#666666",
  "stroke": ""
}
```
