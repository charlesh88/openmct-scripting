---
title: "Layout Item: Image"
---

A static image, placed in a Display Layout's `configuration.items[]`. See
[Display Layout](../../index.md) for how items fit into the parent object.

<ul>
  <li><strong>Item `type`:</strong> `image-view`</li>
  <li><strong>Domain object reference:</strong> No</li>
  <li><strong>Source:</strong> [`src/plugins/displayLayout/components/ImageView.vue`](https://github.com/nasa/openmct/blob/master/src/plugins/displayLayout/components/ImageView.vue) (`makeDefinition`)</li>
</ul>

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | string (uuid) | — | Unique within the layout. |
| `type` | `"image-view"` | — | Item type discriminator. |
| `x` | number | `1` | Grid-unit X position. |
| `y` | number | `1` | Grid-unit Y position. |
| `width` | number | `10` | Width in grid units. |
| `height` | number | `5` | Height in grid units. |
| `url` | string | — | Image URL. Required — has no default. |
| `stroke` | string (CSS `border` shorthand or color) | `"transparent"` | Border. |

Also supports [conditional styling](../../../conditional-styling/index.md) via the parent layout's
`configuration.objectStyles[id]`. Conditional styles for image items may additionally set `style.url` to swap
the image per matched condition (see [Conditional Styling](../../../conditional-styling/index.md#style-object)).

## Example

```json
{
  "id": "b4d5e6f7-4444-4444-8888-999999999999",
  "type": "image-view",
  "x": 2,
  "y": 2,
  "width": 30,
  "height": 20,
  "url": "images/rover-diagram.png",
  "stroke": "transparent"
}
```
