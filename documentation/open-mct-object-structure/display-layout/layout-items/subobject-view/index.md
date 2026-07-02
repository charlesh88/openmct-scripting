---
title: "Layout Item: Sub-Object View"
---

Embeds an Open MCT view such as a Plot, Table, Gauge, another Display Layout, an Overlay Plot, Notebook, etc.) as a frame inside a Display Layout's `configuration.items[]`. For a single alphanumeric telemetry value,
use [Telemetry Alphanumeric](../telemetry-view/index.md) instead. See [Display Layout](../../index.md) for how items fit
into the parent object.

<ul>
  <li><strong>Item `type`:</strong> `subobject-view`</li>
  <li><strong>Domain object reference:</strong> Yes — `identifier` must also appear in the parent layout's `composition[]`</li>
  <li><strong>Source:</strong> [`src/plugins/displayLayout/components/SubobjectView.vue`](https://github.com/nasa/openmct/blob/master/src/plugins/displayLayout/components/SubobjectView.vue) (`makeDefinition`)</li>
</ul>

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | string (uuid) | — | Unique within the layout. |
| `type` | `"subobject-view"` | — | Item type discriminator. |
| `identifier` | `{ key, namespace }` | — | Identifier of the embedded object. Must also be added to the layout's composition[]. |
| `x` | number | position-dependent | Grid-unit X position. |
| `y` | number | position-dependent | Grid-unit Y position. |
| `width` | number | grid-scaled default (min. frame size) | Width in grid units. |
| `height` | number | grid-scaled default (min. frame size) | Height in grid units. |
| `hasFrame` | boolean | `true`, except `false` for `hyperlink`, `summary-widget`, and `conditionWidget` embedded types | Whether to draw the standard frame/title bar around the embedded view. |
| `fontSize` | string | `"default"` | Font size for embedded views that render text (e.g. alphanumeric formats), or `"default"` to inherit. |
| `font` | string | `"default"` | Font family, or `"default"` to inherit. |
| `viewKey` | string (optional) | — | Key of a specific object view to force, when the embedded object supports more than one view. Omit to use the default view for that type. |

Also supports [conditional styling](../../../conditional-styling/index.md) via the parent layout's
`configuration.objectStyles[id]`.

## Example

Embedding an Overlay Plot inside a Display Layout, framed:

```json
{
  "id": "c5e6f7a8-5555-4444-8888-999999999999",
  "type": "subobject-view",
  "x": 0,
  "y": 0,
  "width": 40,
  "height": 20,
  "identifier": { "key": "d4a1b2c3-plot-uuid", "namespace": "" },
  "hasFrame": true,
  "fontSize": "default",
  "font": "default"
}
```

Remember to also add `{ "key": "d4a1b2c3-plot-uuid", "namespace": "" }` to the parent layout's `composition[]`.
