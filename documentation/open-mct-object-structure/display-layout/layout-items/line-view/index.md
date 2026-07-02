---
title: "Layout Item: Line"
---

A straight line drawing primitive, placed in a Display Layout's `configuration.items[]`. Unlike every other
layout item, a line has no `width`/`height` — it's defined by two endpoints. See
[Display Layout](../../index.md) for how items fit into the parent object.

<ul>
  <li><strong>Item `type`:</strong> `line-view`</li>
  <li><strong>Domain object reference:</strong> No</li>
  <li><strong>Source:</strong> [`src/plugins/displayLayout/components/LineView.vue`](https://github.com/nasa/openmct/blob/master/src/plugins/displayLayout/components/LineView.vue) (`makeDefinition`)</li>
</ul>

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | string (uuid) | — | Unique within the layout. |
| `type` | `"line-view"` | — | Item type discriminator. |
| `x` | number | `5` | Grid-unit X of the start point. |
| `y` | number | `10` | Grid-unit Y of the start point. |
| `x2` | number | `10` | Grid-unit X of the end point. |
| `y2` | number | `5` | Grid-unit Y of the end point. |
| `stroke` | string (CSS color) | `"#666666"` | Line color. |

Also supports [conditional styling](../../../conditional-styling/index.md) via the parent layout's
`configuration.objectStyles[id]`.

## Example

```json
{
  "id": "a3c4d5e6-3333-4444-8888-999999999999",
  "type": "line-view",
  "x": 0,
  "y": 0,
  "x2": 20,
  "y2": 15,
  "stroke": "#666666"
}
```
