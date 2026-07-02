---
title: "Non-Creatable Types"
---

Both **Export as JSON** and **Import from JSON** check `type.definition.creatable` and skip/reject anything
false (see [Object Envelope: Creatable objects only](../object-envelope/index.md#creatable-objects-only)). The
following types cannot be manufactured by a scripted JSON import on a stock Open MCT install. They're
documented here for completeness, since you may still see them referenced (e.g. as `composition` targets or
`objectStyles.conditionSetIdentifier` targets) inside an otherwise-scriptable tree.

## Plan, When Disabled

<ul>
  <li><strong>Type key:</strong> `plan`</li>
  <li><strong>Source:</strong> [`src/plugins/plan/plugin.js`](https://github.com/nasa/openmct/blob/master/src/plugins/plan/plugin.js)</li>
</ul>

`creatable: options.creatable ?? false` — the [Plan](../plan/index.md) type is only creatable if the hosting application
explicitly passes `{ creatable: true }` when installing the plan plugin. Check your application's plugin
configuration before assuming Plan objects can be imported. The related `gantt-chart` type is always
creatable regardless of this option.

## Fault Management

<ul>
  <li><strong>Type key:</strong> `faultManagement`</li>
  <li><strong>Source:</strong> [`src/plugins/faultManagement/FaultManagementPlugin.js`](https://github.com/nasa/openmct/blob/master/src/plugins/faultManagement/FaultManagementPlugin.js)</li>
</ul>

A single, application-provided view over active faults, served by `FaultManagementObjectProvider` from a
dedicated namespace rather than the normal persistence store. `creatable: false`, no `configuration` shape to
document — there is nothing to script.

## Annotation

<ul>
  <li><strong>Type key:</strong> `annotation`</li>
  <li><strong>Source:</strong> [`src/api/annotation/AnnotationAPI.js`](https://github.com/nasa/openmct/blob/master/src/api/annotation/AnnotationAPI.js)</li>
</ul>

User-created notes/markers attached to plots, images, and other views (bounding boxes, geospatial features,
notebook entries). `creatable: false` — annotations are created exclusively through `AnnotationAPI#create` in
response to UI interaction, never by direct object creation. Shape, for reference only:

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `targets` | array | `[]` | What the annotation is attached to — shape varies by context (e.g. a plot bounding box `{ keyString, minX, maxX, minY, maxY }`, or a notebook `{ entryId }`). |
| `tags` | array | `[]` | Tag identifiers applied to the annotation. |
| `contentText` | string | `""` | The annotation's note text. |
| `annotationType` | string | `"plotspatial"` | One of AnnotationAPI.ANNOTATION_TYPES, e.g. `"plotspatial"`, `"notebook"`. |
| `originalContextPath` | string | `""` | Object path the annotation was created from, for navigation. |
| `_deleted` | boolean | `false` | Soft-delete flag. |

## Notebook Snapshot Image Storage

<ul>
  <li><strong>Type key:</strong> `notebookSnapshotImage`</li>
  <li><strong>Source:</strong> [`src/plugins/notebook/plugin.js`](https://github.com/nasa/openmct/blob/master/src/plugins/notebook/plugin.js)</li>
</ul>

Internal storage object created automatically when a [Notebook](../notebook/index.md) entry embeds an image snapshot.
`creatable: false`. Shape, for reference only:

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `configuration.fullSizeImageURL` | string \| `undefined` | not set | URL/data reference to the full-size stored image. |
| `configuration.thumbnailImageURL` | string \| `undefined` | not set | URL/data reference to the thumbnail. |
