---
title: "Layout Item: Telemetry Alphanumeric"
---

Displays a single alphanumeric current value (with optional label) from a telemetry-producing object, placed in a Display Layout's
`configuration.items[]`. This is the item type used for individual telemetry parameters in a Display Layout
(as opposed to a view — for those, use [Subobject](../subobject-view/index.md)). See
[Display Layout](../../index.md) for how items fit into the parent object.

<ul>
  <li><strong>Item `type`:</strong> `telemetry-view`</li>
  <li><strong>Domain object reference:</strong> Yes — `identifier` must also appear in the parent layout's `composition[]`</li>
  <li><strong>Source:</strong> [`src/plugins/displayLayout/components/TelemetryView.vue`](https://github.com/nasa/openmct/blob/master/src/plugins/displayLayout/components/TelemetryView.vue) (`makeDefinition`)</li>
</ul>

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | string (uuid) | — | Unique within the layout. |
| `type` | `"telemetry-view"` | — | Item type discriminator. |
| `identifier` | `{ key, namespace }` | — | Identifier of the source telemetry object. Must also be added to the layout's composition[]. |
| `x` | number | position-dependent | Grid-unit X position. |
| `y` | number | position-dependent | Grid-unit Y position. |
| `width` | number | telemetry default width | Width in grid units. |
| `height` | number | telemetry default height | Height in grid units. |
| `displayMode` | `"all"` \| `"label"` \| `"value"` | `"all"` | Whether to show the field label, the value, or both. |
| `value` | string | the object's default display value key | Which telemetry metadata value key to render (usually `"value"`, but can be any key from the object's telemetry metadata, e.g. a specific enumeration field). |
| `showUnits` | boolean | not set (falsy) | Whether to append the value's unit suffix, when the telemetry metadata defines one. |
| `format` | string (optional) | not set | Key of a custom string format (see AlphanumericFormatViewProvider) to apply instead of the value's default formatter. |
| `stroke` | string (CSS `border` shorthand or color) | `""` | Border. |
| `fill` | string (CSS color) | `""` | Background fill. |
| `color` | string (CSS color) | `""` | Text color. |
| `fontSize` | string | `"default"` | Font size, or `"default"` to inherit the layout's font style. |
| `font` | string | `"default"` | Font family, or `"default"` to inherit the layout's font style. |

Also supports [conditional styling](../../../conditional-styling/index.md) via the parent layout's
`configuration.objectStyles[id]`.

## Example

```json
{
  "id": "95cb9498-f571-439f-aa7a-17978c4efcda",
  "type": "telemetry-view",
  "x": 31,
  "y": 5,
  "width": 30,
  "height": 4,
  "stroke": "transparent",
  "fontSize": "default",
  "font": "default",
  "identifier": { "key": "~Spacecraft~SubSystem~parameterName", "namespace": "taxonomy" },
  "displayMode": "value",
  "value": "value",
  "showUnits": true
}
```

Remember to also add `{ "key": "~Spacecraft~SubSystem~parameterName", "namespace": "taxonomy" }` to the parent
layout's `composition[]` — the layout tracks a reference count per composed object across its
`telemetry-view`/`subobject-view` items (`DisplayLayout.vue#trackItem`), and views that expect the object to be
in composition (e.g. the inspector) won't resolve it otherwise.
