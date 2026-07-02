---
title: "Open MCT JSON Object Structure"
---

This reference documents the JSON structure of Open MCT **domain objects**, so that object definitions can be
scripted and imported into Open MCT via **Import from JSON**
(`src/plugins/importFromJSONAction`), rather than built by hand through the UI.

It was written against the [nasa/openmct](https://github.com/nasa/openmct) source. Every property listed here
is backed by an `openmct.types.addType(...)` definition (or the equivalent `initialize()` function) in
`src/plugins/`. Each doc links to the specific source file it was derived from — that file is the ground truth;
if the two disagree, trust the code. Source links point at `master`, so line numbers and exact shapes may drift
slightly from a given release.

:::tip
The fastest way to learn a new type's shape is still to build one object of that type in the running
application, then use **Export as JSON** on it. Use this reference to understand why each field is there and
what values are valid, and to generate variations without going back to the UI each time.
:::

## Common Structures

- **[Object Envelope](object-envelope/index.md)** — the file-level wrapper (`openmct` / `rootId`) and the properties
  every domain object has in common (`identifier`, `type`, `name`, `location`, `composition`, `modified`,
  `persisted`). Read this first.
- **[Conditional Styling](conditional-styling/index.md)** — the `configuration.objectStyles` structure used by Display
  Layout, Flexible Layout, LAD Tables, Telemetry Tables, Plots, Gauges, and Condition Widgets to apply
  Condition Set–driven styles.
- **[Condition Set](condition-set/index.md)** — criteria, operators, and outputs, since most conditional styling in a
  scripted tree is driven by a Condition Set.

## Object Types

### Containers

| Type | Key | Doc |
| --- | --- | --- |
| Folder | `folder` | [View](folder/index.md) |
| Display Layout | `layout` | [View](display-layout/index.md) |
| Flexible Layout | `flexible-layout` | [View](flexible-layout/index.md) |
| Tabs View | `tabs` | [View](tabs/index.md) |
| LAD Table Set | `LadTableSet` | [View](lad-table/index.md) |

Display Layout items (box, line, text, image, telemetry value, and embedded-object frames) are not domain
objects in their own right — they are entries in a layout's `configuration.items` array. See
[Display Layout](display-layout/index.md) for a table linking to each item type's shape.

### Telemetry visualization

| Type | Key | Doc |
| --- | --- | --- |
| Overlay Plot | `telemetry.plot.overlay` | [View](overlay-plot/index.md) |
| Stacked Plot | `telemetry.plot.stacked` | [View](stacked-plot/index.md) |
| Scatter Plot | `telemetry.plot.scatter-plot` | [View](scatter-plot/index.md) |
| Graph (bar/line) | `telemetry.plot.bar-graph` | [View](bar-graph/index.md) |
| Gauge | `gauge` | [View](gauge/index.md) |
| LAD Table | `LadTable` | [View](lad-table/index.md) |
| Telemetry Table | `table` | [View](telemetry-table/index.md) |
| Condition Widget | `conditionWidget` | [View](condition-widget/index.md) |

### Telemetry processing (produce derived telemetry)

| Type | Key | Doc |
| --- | --- | --- |
| Condition Set | `conditionSet` | [View](condition-set/index.md) |
| Derived Telemetry | `comps` | [View](derived-telemetry/index.md) |
| Telemetry Filter (rolling mean) | `telemetry-mean` | [View](telemetry-filter/index.md) |
| Correlation Telemetry | `telemetry.correlator` | [View](correlation-telemetry/index.md) |

### Timelines and Planning

| Type | Key | Doc |
| --- | --- | --- |
| Time Strip | `time-strip` | [View](time-strip/index.md) |
| Time List | `timelist` | [View](timelist/index.md) |
| Plan | `plan` | [View](plan/index.md) |
| Gantt Chart | `gantt-chart` | [View](plan/index.md) |
| Timer | `timer` | [View](timer/index.md) |
| Clock | `clock` | [View](clock/index.md) |

### Notes and General Purpose

| Type | Key | Doc |
| --- | --- | --- |
| Notebook | `notebook` | [View](notebook/index.md) |
| Notebook Shift Log | `restricted-notebook` | [View](notebook/index.md) |
| Web Page | `webPage` | [View](web-page/index.md) |
| Hyperlink | `hyperlink` | [View](hyperlink/index.md) |
| Summary Widget | `summary-widget` | [View](summary-widget/index.md) |

### Example & Test Objects

Bundled with Open MCT for development and demos — not intended for production telemetry systems, but useful
scripting targets when you need something that produces live-looking data without a real telemetry source.

| Type | Key | Doc |
| --- | --- | --- |
| Sine Wave Generator | `generator` | [View](sine-wave-generator/index.md) |
| State Generator | `example.state-generator` | [View](state-generator/index.md) |
| Event Message Generator | `eventGenerator` | [View](event-generator/index.md) |
| Event Message Generator with Acknowledge | `eventGeneratorWithAcknowledge` | [View](event-generator-with-acknowledge/index.md) |
| Example Imagery | `example.imagery` | [View](example-imagery/index.md) |
| Example Data Visualization Source | `exampleDataVisualizationSource` | [View](example-data-visualization-source/index.md) |

### Not scriptable

[Non-Creatable Types](non-creatable-types/index.md) covers `plan` when `creatable` is disabled (default), and the
system-managed types `fault management`, `annotation`, and `notebookSnapshotImage`, which cannot be created by
Import from JSON.

## Conventions Used in This Reference

- `identifier` objects are always `{ "key": "<uuid>", "namespace": "<namespace>" }`. In an exported/importable
  JSON file, object keys in the `openmct` map are the **key string** (`namespace:key`, or just `key` when the
  namespace is `""`).
- `location` is a **key string** (a `namespace:key` string, not an identifier object) pointing at the parent
  object, or `null` for the tree root.
- Types marked `creatable: false` in source cannot be created by Import from JSON; Open MCT's import/export
  actions both check this flag (see [Object Envelope](object-envelope/index.md#creatable-objects-only)).
- All property tables list only what a type adds beyond the common envelope in
  [Object Envelope](object-envelope/index.md).
