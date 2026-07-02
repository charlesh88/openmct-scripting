---
title: "Flexible Layout"
---

A fluid, flexible layout canvas that can display multiple objects in rows or columns.

<ul>
  <li><strong>Type key:</strong> `flexible-layout`</li>
  <li><strong>Creatable:</strong> Yes</li>
  <li><strong>Composition:</strong> Yes — objects placed in a column/row</li>
  <li><strong>Source:</strong> [`src/plugins/flexibleLayout/plugin.js`](https://github.com/nasa/openmct/blob/master/src/plugins/flexibleLayout/plugin.js), [`src/ui/layout/Container.js`](https://github.com/nasa/openmct/blob/master/src/ui/layout/Container.js), [`src/ui/layout/Frame.js`](https://github.com/nasa/openmct/blob/master/src/ui/layout/Frame.js)</li>
</ul>

## Properties Beyond the [Envelope](../object-envelope/index.md)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `composition` | `Array<{ key, namespace }>` | `[]` | Every object placed in any container's frames[]. |
| `configuration.rowsLayout` | boolean | `false` | `false` = arrange containers as columns (side by side); `true` = arrange as rows (stacked). |
| `configuration.containers` | `Array<Container>` | two 50/50 containers | The columns or rows. `initialize()` seeds this. |
| `configuration.objectStyles` | object (optional) | `{}` | Per-frame conditional styling. See [Conditional Styling](../conditional-styling/index.md). |

## Container Object

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | string (uuid) | — | Unique within the layout. |
| `size` | number | — | Relative flex size (a percentage-like weight; two containers of `50`/`50` split evenly). |
| `frames` | `Array<Frame>` | `[]` | Objects placed in this container, in order. |

## Frame Object

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | string (uuid) | — | Unique within the layout. |
| `domainObjectIdentifier` | `{ key, namespace }` | — | Identifier of the embedded object. Must also appear in the layout's composition[]. |
| `size` | number | — | Relative flex size within the container. |
| `noFrame` | boolean | `false` | `true` to hide the standard frame/title bar around this object. |

## Example

Two objects side by side, 60/40 split, in a single 100-wide row container:

```json
{
  "name": "Spacecraft Status Row",
  "type": "flexible-layout",
  "location": "671327d3-e625-435d-8030-1049fc29b9dd",
  "identifier": { "key": "9b1c2d3e-flex-uuid", "namespace": "" },
  "composition": [
    { "key": "aabbccdd-plot-uuid", "namespace": "" },
    { "key": "eeff0011-table-uuid", "namespace": "" }
  ],
  "configuration": {
    "rowsLayout": false,
    "objectStyles": {},
    "containers": [
      {
        "id": "c1a2b3c4-container-a",
        "size": 100,
        "frames": [
          {
            "id": "f1a2b3c4-frame-a",
            "domainObjectIdentifier": { "key": "aabbccdd-plot-uuid", "namespace": "" },
            "size": 60,
            "noFrame": false
          },
          {
            "id": "f2a2b3c4-frame-b",
            "domainObjectIdentifier": { "key": "eeff0011-table-uuid", "namespace": "" },
            "size": 40,
            "noFrame": false
          }
        ]
      }
    ]
  }
}
```
