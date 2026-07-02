---
title: "Condition Set"
---

Monitor and evaluate telemetry values in real-time with a wide variety of criteria. Use to control the styling of many objects in Open MCT.

<ul>
  <li><strong>Type key:</strong> `conditionSet`</li>
  <li><strong>Creatable:</strong> Yes</li>
  <li><strong>Composition:</strong> Yes — telemetry objects whose values are evaluated by this Condition Set's criteria</li>
  <li><strong>Source:</strong> [`src/plugins/condition/plugin.js`](https://github.com/nasa/openmct/blob/master/src/plugins/condition/plugin.js)</li>
</ul>

## Properties Beyond the [Envelope](../object-envelope/index.md)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `composition` | `Array<{ key, namespace }>` | `[]` | Telemetry objects available to this Condition Set's criteria as sources. |
| `telemetry` | object | `{}` | Populated by ConditionSetMetadataProvider / ConditionSetTelemetryProvider at runtime — not scripted. |
| `configuration.shouldFetchHistorical` | boolean | `false` | Whether to evaluate against historical (not just real-time) telemetry. |
| `configuration.conditionTestData` | array | `[]` | Saved test-data values used by the "Test data" panel in the UI. |
| `configuration.conditionCollection` | `Array<Condition>` | one seeded `Default` condition | Ordered list of conditions, evaluated top to bottom; the first matching condition wins. Must always end with one isDefault: true condition (empty criteria) as a catch-all. |

## Condition Object

Each entry in `configuration.conditionCollection`. Defaults below reflect the single `Default` condition
`initialize()` seeds for every new Condition Set; conditions you add yourself have no schema-level default and
must be fully specified.

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | string (uuid) | — | Unique within this Condition Set. Referenced by conditionId in [conditional styling](../conditional-styling/index.md#style-object). |
| `isDefault` | boolean | `true` for the seeded condition | `true` for exactly one condition — the fallback with no criteria. `false` (or `""` in some exports) for all others. |
| `summary` | string | `"Default condition"` | Human-readable summary shown in the UI; auto-generated but harmless to set. |
| `configuration.name` | string | `"Default"` | Condition name, shown in the editor. |
| `configuration.output` | string | `"Default"` | The output/label produced when this condition matches (e.g. `"ENAB"`, `"ERR"`, `"LOCKED"`, or `"Default"` for the fallback). |
| `configuration.trigger` | `"all"` \| `"any"` \| `"not"` \| `"xor"` | `"all"` | How multiple criteria combine (`TRIGGER` in condition/utils/constants.js): all criteria met / any criterion met / no criteria met / exactly one criterion met. |
| `configuration.criteria` | `Array<Criterion>` | `[]` | Empty for the default condition. |

## Criterion Object

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | string (uuid) | — | Unique within the condition. |
| `telemetry` | `"any"` \| `"all"` \| a telemetry object identifier | — | `"any"`/`"all"` apply the operation across every object in the Condition Set's composition; otherwise reference one specific composed object. |
| `metadata` | string | — | Key of the telemetry value to test (e.g. `"value"`, or a specific field key from that object's telemetry metadata). |
| `operation` | string | — | One of the operator names below. |
| `input` | array | `[]` | Operand value(s) for the operation. Length depends on the operator's inputCount (0, 1, or 2 — between/notBetween take 2). Omit or use `[]` for zero-input operators. |

## Operators

Source: [`src/plugins/condition/utils/operations.js`](https://github.com/nasa/openmct/blob/master/src/plugins/condition/utils/operations.js)
(`OPERATIONS`).

| `operation` | Applies to | Inputs | Meaning |
| --- | --- | --- | --- |
| `equalTo` | number | 1 | `value == input` |
| `notEqualTo` | number | 1 | `value != input` |
| `greaterThan` | number | 1 | `value > input` |
| `lessThan` | number | 1 | `value < input` |
| `greaterThanOrEq` | number | 1 | `value >= input` |
| `lessThanOrEq` | number | 1 | `value <= input` |
| `between` | number | 2 | `smaller < value < larger` |
| `notBetween` | number | 2 | `value < smaller or value > larger` |
| `textContains` | string | 1 | value includes input |
| `textDoesNotContain` | string | 1 | value does not include input |
| `textStartsWith` | string | 1 | value starts with input |
| `textEndsWith` | string | 1 | value ends with input |
| `textIsExactly` | string | 1 | `value === input` |
| `isUndefined` | string, number, enum | 0 | value is `undefined` |
| `isDefined` | string, number, enum | 0 | value is not `undefined` |
| `enumValueIs` | enum | 1 | enum string value equals input |
| `enumValueIsNot` | enum | 1 | enum string value does not equal input |
| `isOneOf` | string, number | 1 | value matches one of a comma-separated list in `input[0]` |
| `isNotOneOf` | string, number | 1 | value matches none of a comma-separated list in `input[0]` |
| `isOldKey` (`isStale`) | number | 1 | value has been unchanged for at least N seconds |
| `isStale.new` | number | 0 | value is currently flagged stale |

## Example (From a Real Export)

A Condition Set with an enum criterion and a default fallback, evaluated against one composed telemetry point:

```json
{
  "name": "CS Subsystem enabledFlag",
  "type": "conditionSet",
  "location": "138ccaee-d2ca-4e3c-9089-a75edf5f0c23",
  "identifier": { "key": "ef6946f8-01d3-495d-97e5-c51e4fd0ac87", "namespace": "" },
  "configuration": {
    "conditionTestData": [],
    "conditionCollection": [
      {
        "isDefault": false,
        "id": "05b0adf8-66ea-4992-995e-154eedaf4a8c",
        "configuration": {
          "name": "condEnabledFlag",
          "output": "ENAB",
          "trigger": "all",
          "criteria": [
            {
              "id": "4e051bfb-8d08-437c-9bc8-f7e156543d5b",
              "telemetry": "any",
              "operation": "enumValueIs",
              "input": [1],
              "metadata": "value"
            }
          ]
        },
        "summary": "any value enumValueIs"
      },
      {
        "isDefault": true,
        "id": "f5ef0365-9238-4e86-a588-0f4271ff909e",
        "configuration": { "name": "Default", "output": "Default", "trigger": "all", "criteria": [] },
        "summary": "Scripted default"
      }
    ]
  },
  "composition": [
    { "key": "~Spacecraft~SubSystem~parameterName", "namespace": "taxonomy" }
  ]
}
```

> **Note:** some exports (including the mission-specific sample this reference was checked against) include a
> top-level `"telemetry": ["/path/to/point"]` array on `conditionSet` objects. That is **not** part of core
> Open MCT's `conditionSet` schema — the type's `initialize()` sets `telemetry` to an object (`{}`), not an
> array of path strings. It appears to be a convenience field added by a mission-specific taxonomy/export
> integration for human readability, and core Open MCT does not read it. Don't rely on it being present or
> honored by a stock Open MCT install.
