---
title: "Folder"
---

Create folders to organize other objects or links to objects without the ability to edit its properties.

<ul>
  <li><strong>Type key:</strong> `folder`</li>
  <li><strong>Creatable:</strong> Yes</li>
  <li><strong>Composition:</strong> Yes — any object type</li>
  <li><strong>Source:</strong> [`src/plugins/folderView/plugin.js`](https://github.com/nasa/openmct/blob/master/src/plugins/folderView/plugin.js)</li>
</ul>

## Properties Beyond the [Envelope](../object-envelope/index.md)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `composition` | `Array<{ key, namespace }>` | `[]` | Child objects of any type. |

Folder has no `configuration` object of its own in `initialize()`. Exports may show a `configuration` block
containing `objectStyles`/`fontStyle` if the folder was ever opened inside a styling-aware view, but these are
not required to create a valid folder and can be safely omitted.

## Example

```json
{
  "name": "Condition Sets",
  "type": "folder",
  "location": "671327d3-e625-435d-8030-1049fc29b9dd",
  "identifier": { "key": "138ccaee-d2ca-4e3c-9089-a75edf5f0c23", "namespace": "" },
  "composition": [
    { "key": "58be0f89-86a6-4784-a024-a413cac923ab", "namespace": "" },
    { "key": "e9e76b3b-658d-45ec-990f-01d0c8409b02", "namespace": "" }
  ]
}
```
