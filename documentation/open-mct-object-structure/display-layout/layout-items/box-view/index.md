---
title: "Layout Item: Box"
---

A filled rectangle drawing primitive, placed in a Display Layout's `configuration.items[]`. See
[Display Layout](../../index.md) for how items fit into the parent object.

<ul>
  <li><strong>Item `type`:</strong> `box-view`</li>
  <li><strong>Domain object reference:</strong> No</li>
  <li><strong>Source:</strong> [`src/plugins/displayLayout/components/BoxView.vue`](https://github.com/nasa/openmct/blob/master/src/plugins/displayLayout/components/BoxView.vue) (`makeDefinition`)</li>
</ul>

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | string (uuid) | — | Unique within the layout. Assigned when the item is created; not part of makeDefinition. |
| `type` | `"box-view"` | — | Item type discriminator. |
| `x` | number | `1` | Grid-unit X position of the top-left corner. |
| `y` | number | `1` | Grid-unit Y position of the top-left corner. |
| `width` | number | `10` | Width in grid units. |
| `height` | number | `5` | Height in grid units. |
| `fill` | string (CSS color) | `"#666666"` | Fill color. |
| `stroke` | string (CSS `border` shorthand or color) | `""` | Border. |

Also supports [conditional styling](../../../conditional-styling/index.md) via the parent layout's
`configuration.objectStyles[id]`.

## Example

```json
{
  "id": "e1a2b3c4-1111-4444-8888-999999999999",
  "type": "box-view",
  "x": 0,
  "y": 0,
  "width": 20,
  "height": 10,
  "fill": "#4c4c4c",
  "stroke": ""
}
```
