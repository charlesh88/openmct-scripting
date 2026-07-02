---
title: "Display Layout"
---

Assemble other objects and components together into a reusable screen layout. Simply drag in the objects you want, position and size them. Save your design and view or edit it at any time.

<ul>
  <li><strong>Type key:</strong> `layout`</li>
  <li><strong>Creatable:</strong> Yes</li>
  <li><strong>Composition:</strong> Yes — objects placed as frames/embedded objects in the layout</li>
  <li><strong>Source:</strong> [`src/plugins/displayLayout/DisplayLayoutType.js`](https://github.com/nasa/openmct/blob/master/src/plugins/displayLayout/DisplayLayoutType.js)</li>
</ul>

## Properties Beyond the [Envelope](../object-envelope/index.md)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `composition` | `Array<{ key, namespace }>` | `[]` | Identifiers of every object embedded via a subobject-view or telemetry-view item (see below). Objects referenced only by text-view, box-view, ellipse-view, line-view, or image-view items are **not** added to composition — those item types don't reference other domain objects. |
| `configuration.items` | `Array<LayoutItem>` | `[]` | The visual elements placed on the canvas, in z-order (later entries draw on top). See the table below for the shape of each item type. |
| `configuration.layoutGrid` | `[number, number]` | `[10, 10]` | `[horizontalGridPx, verticalGridPx]` snap grid size. |
| `configuration.layoutDimensions` | `[number, number]` (optional) | not set | `[widthPx, heightPx]` fixed canvas size, if set via the "Horizontal/Vertical size" fields on the type's create form. Omit for an auto-sized layout. |
| `configuration.objectStyles` | object (optional) | `{}` | Per-item conditional styling, keyed by layout item id. See [Conditional Styling](../conditional-styling/index.md#2-per-item-styling-display-layout--flexible-layout). |
| `configuration.fontStyle` | `{ fontSize: string, font: string }` (optional) | not set | Layout-wide default font, applied to items that don't override it. Values are the same `"default"` sentinel or named size/family used per-item (see [Text](layout-items/text-view/index.md)). Not set by `initialize()`; only appears if edited in the UI. |

## Layout Item Types

`configuration.items[]` entries are **not** domain objects — they don't have their own `identifier`/`type`
envelope, only a local `id` (uuid) unique within the layout, and an item `type` chosen from:

| Item `type` | Doc                                                            | References a domain object? |
| --- |----------------------------------------------------------------| --- |
| `box-view` | [Box](layout-items/box-view/index.md)                          | No |
| `ellipse-view` | [Ellipse](layout-items/ellipse-view/index.md)                  | No |
| `line-view` | [Line](layout-items/line-view/index.md)                        | No |
| `text-view` | [Text](layout-items/text-view/index.md)                        | No |
| `image-view` | [Image](layout-items/image-view/index.md)                      | No |
| `telemetry-view` | [Telemetry Alphanumeric](layout-items/telemetry-view/index.md) | Yes — must also appear in `composition` |
| `subobject-view` | [Sub-Object View](layout-items/subobject-view/index.md)        | Yes — must also appear in `composition` |

## Example

A layout with a text label and a telemetry value side-by-side, grid-snapped at 5x5px:

```json
{
  "name": "Command Displays Scripting v5",
  "type": "layout",
  "location": "671327d3-e625-435d-8030-1049fc29b9dd",
  "identifier": { "key": "bbcb85da-b80d-411a-8f9e-4e3816ba3f0a", "namespace": "" },
  "composition": [
    { "key": "~Spacecraft~SubSystem~parameterName", "namespace": "taxonomy" }
  ],
  "configuration": {
    "layoutGrid": [5, 5],
    "objectStyles": {},
    "items": [
      {
        "id": "982bac73-9c30-4b33-bc27-e21a856a883e",
        "type": "text-view",
        "x": 0,
        "y": 5,
        "width": 30,
        "height": 4,
        "stroke": "transparent",
        "fontSize": "default",
        "font": "default",
        "text": "parameterName"
      },
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
    ]
  }
}
```

## Composition Rules

A `folder` cannot be dropped directly into a Display Layout — enforced by a composition policy in
`plugin.js` (`parent.type === 'layout' && child.type === 'folder'` is rejected).
