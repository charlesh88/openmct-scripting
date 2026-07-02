---
title: "Derived Telemetry"
---

Add one or more telemetry end points, apply a mathematical operation to them, and output the result as new telemetry.

<ul>
  <li><strong>Type key:</strong> `comps`</li>
  <li><strong>Creatable:</strong> Yes</li>
  <li><strong>Composition:</strong> Yes — telemetry objects used as inputs to the expression; a composition policy requires every composed object to be a telemetry object</li>
  <li><strong>Source:</strong> [`src/plugins/comps/plugin.js`](https://github.com/nasa/openmct/blob/master/src/plugins/comps/plugin.js), [`src/plugins/comps/CompsManager.js`](https://github.com/nasa/openmct/blob/master/src/plugins/comps/CompsManager.js)</li>
</ul>

## Properties Beyond the [Envelope](../object-envelope/index.md)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `composition` | `Array<{ key, namespace }>` | `[]` | Input telemetry objects, referenced by name (parameters[].name) inside expression. |
| `telemetry` | object | `{}` | Populated by CompsMetadataProvider/CompsTelemetryProvider at runtime. |
| `configuration.comps.expression` | string | `""` | A JavaScript-like math expression referencing each parameter's name (e.g. `"A + B"`). |
| `configuration.comps.parameters` | `Array<Parameter>` | `[]` | One entry per composed input, keyed by keyString. CompsManager normally keeps this array in sync with composition automatically as objects are added/removed — when hand-scripting, add one entry per composed object. |

## Parameter Object

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `keyString` | string | — | Key string of the corresponding composed telemetry object. Must match an entry in composition. |
| `name` | string | auto-assigned `A`, `B`, `C`, ... | The variable name used for this parameter inside expression (can be any valid identifier). |
| `valueToUse` | string | the first numeric/range-hinted value | Telemetry metadata value key to read from this input. |
| `testValue` | number | `0` | Value used when previewing the expression with static test data. |
| `timeMetaData` | object | — | The input's domain (time) metadata entry, used to align samples across inputs. Derived from the object's telemetry metadata — copy it from the source object's domain value metadata rather than hand-authoring. |
| `accumulateValues` | boolean | `false` | `true` to make a rolling window of this parameter's recent values available to the expression (see sampleSize). |
| `sampleSize` | number | `10` | Window size when accumulateValues is `true`. |

## Example

```json
{
  "name": "Subsystem Health Score",
  "type": "comps",
  "location": "671327d3-e625-435d-8030-1049fc29b9dd",
  "identifier": { "key": "2d3e4f5a-comps-uuid", "namespace": "" },
  "composition": [
    { "key": "~Spacecraft~SubSystem~parameterName", "namespace": "taxonomy" }
  ],
  "telemetry": {},
  "configuration": {
    "comps": {
      "expression": "A > 0 ? 0 : 1",
      "parameters": [
        {
          "keyString": "taxonomy:~Spacecraft~SubSystem~parameterName",
          "name": "A",
          "valueToUse": "value",
          "testValue": 0,
          "accumulateValues": false,
          "sampleSize": 10
        }
      ]
    }
  }
}
```
