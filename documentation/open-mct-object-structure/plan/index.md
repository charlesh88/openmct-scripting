---
title: "Plan and Gantt Chart"
---

<ul>
  <li><strong>Source:</strong> [`src/plugins/plan/plugin.js`](https://github.com/nasa/openmct/blob/master/src/plugins/plan/plugin.js), [`src/plugins/plan/PlanViewConfiguration.js`](https://github.com/nasa/openmct/blob/master/src/plugins/plan/PlanViewConfiguration.js), plan JSON format authoritatively documented in [`src/plugins/plan/README.md`](https://github.com/nasa/openmct/blob/master/src/plugins/plan/README.md).</li>
</ul>

Two types share the same underlying plan/activity data model but differ in how creatable they are and what
`configuration` they carry.

## Plan

A non-configurable timeline-like view for a compatible plan file.

<ul>
  <li><strong>Type key:</strong> `plan`</li>
  <li><strong>Creatable:</strong> No by default (`options.creatable` defaults to `false` when the plugin is installed) — must be explicitly enabled by the application; see [Non-Creatable Types](../non-creatable-types/index.md#plan-when-disabled).</li>
  <li><strong>Composition:</strong> No</li>
</ul>

### Properties beyond the [envelope](../object-envelope/index.md)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `configuration.clipActivityNames` | boolean | `false` | Truncate activity name labels that don't fit their duration slot rather than wrapping. |
| `configuration.aheadBehind` | `{ duration: number, isBehind: boolean }` | `{ duration: 0, isBehind: false }` | "Now" marker offset: duration in ms, isBehind = marker trails now vs. leads it. |
| `selectFile` | `{ body: PlanJSON \| string }` | — | The plan data itself (see [Plan JSON format](#plan-json-format) below). Set via the create-form's file upload, or scripted directly as an object (not a JSON string) per plan/README.md. |
| `sourceMap` | object (optional) | not set | Remaps non-standard field/key names in selectFile.body — see [Custom field names](#custom-field-names-sourcemap) below. Omit when using the standard field names. |

### Plan JSON format

`selectFile.body` is an object keyed by category/group name, each holding an array of activities:

```json
{
  "TEST_GROUP": [
    {
      "name": "Event 1 with a really long name",
      "start": 1665323197000,
      "end": 1665344921000,
      "type": "TEST_GROUP",
      "color": "orange",
      "textColor": "white"
    }
  ],
  "GROUP_2": [
    {
      "name": "Event 2",
      "start": 1665409597000,
      "end": 1665456252000,
      "type": "GROUP_2",
      "color": "red",
      "textColor": "white"
    }
  ]
}
```

| Activity field | Type | Description |
| --- | --- | --- |
| `name` | string | Activity label. |
| `start` | number | Start time, Unix epoch **milliseconds**. |
| `end` | number | End time, Unix epoch **milliseconds**. |
| `type` | string | Should match the enclosing category/group key. |
| `color` | string (optional) | Background color for the activity block (CSS color name or hex). |
| `textColor` | string (optional) | Label text color. |

### Custom field names (`sourceMap`)

If your source data doesn't use `name`/`start`/`end`/`type`, map it with a top-level `sourceMap`:

```json
{
  "sourceMap": {
    "start": "start_time",
    "end": "end_time",
    "activities": "items",
    "groupId": "category"
  },
  "selectFile": {
    "body": {
      "items": [
        { "name": "An activity", "start_time": 1665323197000, "end_time": 1665323197100, "category": "SOME_GROUP" }
      ]
    }
  }
}
```

### Full example (standard field names)

```json
{
  "identifier": { "key": "test-plan", "namespace": "" },
  "name": "A plan object",
  "type": "plan",
  "location": "671327d3-e625-435d-8030-1049fc29b9dd",
  "configuration": {
    "clipActivityNames": true,
    "aheadBehind": { "duration": 0, "isBehind": false }
  },
  "selectFile": {
    "body": {
      "SOME_CATEGORY": [
        { "name": "An activity", "start": 1665323197000, "end": 1665323197100, "type": "SOME_CATEGORY" }
      ]
    }
  }
}
```

## Gantt Chart

A configurable timeline-like view for a compatible plan file.

<ul>
  <li><strong>Type key:</strong> `gantt-chart`</li>
  <li><strong>Creatable:</strong> Yes</li>
  <li><strong>Composition:</strong> Yes</li>
</ul>

### Properties beyond the [envelope](../object-envelope/index.md)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `composition` | `Array<{ key, namespace }>` | `[]` | Composable objects (a composition policy restricts what's allowed — typically Plan-shaped data). |
| `configuration.clipActivityNames` | boolean | `true` | Same meaning as for plan — note the different default here. |

Gantt Chart does not itself carry `selectFile`/`sourceMap` — it renders from its composed plan-like objects
rather than an uploaded file.

### Example

```json
{
  "name": "Mission Gantt",
  "type": "gantt-chart",
  "location": "671327d3-e625-435d-8030-1049fc29b9dd",
  "identifier": { "key": "4b5c6d7e-gantt-uuid", "namespace": "" },
  "composition": [
    { "key": "test-plan", "namespace": "" }
  ],
  "configuration": { "clipActivityNames": true }
}
```
