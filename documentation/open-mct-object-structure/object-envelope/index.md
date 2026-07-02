---
title: "Object Envelope"
---

Every persisted Open MCT domain object — regardless of `type` — is a plain JSON object with the same outer
shape. Source: `@property` JSDoc block in
[`src/api/objects/ObjectAPI.js`](https://github.com/nasa/openmct/blob/master/src/api/objects/ObjectAPI.js), and the shape enforced by
[`src/plugins/importFromJSONAction/ImportFromJSONAction.js`](https://github.com/nasa/openmct/blob/master/src/plugins/importFromJSONAction/ImportFromJSONAction.js)
/ [`src/plugins/exportAsJSONAction/ExportAsJSONAction.js`](https://github.com/nasa/openmct/blob/master/src/plugins/exportAsJSONAction/ExportAsJSONAction.js).

## The Import/Export File

A file produced by **Export as JSON**, and accepted by **Import from JSON**, has exactly two top-level keys:

```json
{
  "openmct": {
    "<keyString>": { "...": "a domain object model, keyed by its own key string" }
  },
  "rootId": "<keyString of the object that becomes the child of the folder you import into>"
}
```

- `openmct` is a flat map. Every object in the tree — the root plus every descendant reachable through
  `composition` or a `conditionSetIdentifier` reference — appears here once, keyed by its own key string.
- `rootId` identifies which entry in `openmct` is attached to the object you run **Import from JSON** on. On
  import, `rootId` and every object's own key are given brand-new UUIDs and all internal references are
  rewritten consistently — you do not need pre-existing IDs to be globally unique, only internally consistent
  within the file.
- Import validates only that both `openmct` and `rootId` are present
  (`ImportFromJSONAction.#_validateJSON`); it does not otherwise validate the tree.

## Key Strings vs. Identifiers

Open MCT uses two different representations for "which object is this" depending on context:

| Representation | Shape | Used for |
| --- | --- | --- |
| **Identifier** | `{ "key": "<uuid>", "namespace": "<namespace>" }` | `identifier` property, entries in `composition[]`, `conditionSetIdentifier`, layout item `identifier` |
| **Key string** | `"<namespace>:<key>"`, or bare `"<key>"` when the namespace is `""` | Object keys in the `openmct` map, `location` |

Getting these backwards is the most common scripting mistake — `location` is a **string**, not an object with
`key`/`namespace` fields.

## Common Properties

These appear on (almost) every domain object. Type-specific docs only list what they add on top of this.

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `identifier` | `{ key, namespace }` | Yes | — | This object's own identifier. The key is normally a v4 UUID. The namespace is usually `""` for objects you create; non-empty namespaces are reserved for objects served by a custom object/telemetry provider (e.g. a dictionary-backed namespace like `"taxonomy"` in the example file). |
| `type` | string | Yes | — | The type key, e.g. `"folder"`, `"layout"`, `"conditionSet"`. Must match a key registered via `openmct.types.addType(key, ...)`. See the [type index](../index.md#object-types). |
| `name` | string | Yes | — | Display name shown in the tree and title bar. |
| `location` | string \| `null` | Yes | — | Key string of the parent object, or `null` only for the object that has no parent (the import root's location is overwritten by the importer to point at the folder you imported into). |
| `composition` | `Array<{ key, namespace }>` | Only if the type supports composition | `[]` | Ordered list of child object identifiers. Absent entirely on types that cannot contain other objects (e.g. webPage, hyperlink, clock). Set by `initialize()` for container types even when empty. |
| `configuration` | object | Type-dependent | not set | Type-specific settings object. Shape is entirely defined by each type — see the individual type docs. Not every type has one. |
| `modified` | number | No | auto-set by Open MCT on save | Unix epoch **milliseconds** of last modification (`Date.now()` — see the JSDoc in ObjectAPI.js: *"the time, in milliseconds since the UNIX epoch..."*). Safe to omit when hand-scripting. |
| `persisted` | number | No | auto-set by Open MCT on save | Unix epoch **milliseconds** of last successful persistence. The importer explicitly deletes this field from every incoming object before creating it, so any value you supply is discarded — omit it. |
| `telemetry` | object | Only telemetry-producing types | `{}` | Present when a type provides its own telemetry (e.g. conditionSet, comps, telemetry-mean, telemetry.correlator). Populated by a telemetry metadata provider at runtime, not scripted directly. |

> **Note on timestamps:** the sample export referenced when writing this guide contains 10-digit `modified`/
> `persisted` values (e.g. `1782764890`), which are Unix **seconds**, not the milliseconds Open MCT's core API
> expects. That file was produced by a mission-specific integration; treat it as an example of object *shape*,
> not of these two timestamp fields. Since both are optional and rewritten on save/import, the safest approach
> when scripting is to omit them.

## Creatable Objects Only

Both **Export as JSON** and **Import from JSON** filter through
`type.definition.creatable`(`#isCreatableAndPersistable` / `appliesTo`). Only object types registered with
`creatable: true` can be created by a scripted import. A handful of types are intentionally `creatable: false`
because they are system-managed (see [Non-Creatable Types](../non-creatable-types/index.md)); referencing objects of
those types (e.g. as telemetry sources in a layout) is fine — you just can't manufacture new instances of them
by import.

## Minimal Example

The smallest valid object — an empty folder — combining the envelope with the
[Folder](../folder/index.md) type's own `initialize()`:

```json
{
  "openmct": {
    "a1b2c3d4-e5f6-4789-a012-3456789abcde": {
      "name": "My Folder",
      "type": "folder",
      "location": null,
      "identifier": {
        "key": "a1b2c3d4-e5f6-4789-a012-3456789abcde",
        "namespace": ""
      },
      "composition": []
    }
  },
  "rootId": "a1b2c3d4-e5f6-4789-a012-3456789abcde"
}
```
