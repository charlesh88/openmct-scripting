---
title: "Summary Widget"
---

A compact status update for collections of telemetry-producing items.

<ul>
  <li><strong>Type key:</strong> `summary-widget`</li>
  <li><strong>Creatable:</strong> Yes</li>
  <li><strong>Composition:</strong> Yes — telemetry objects evaluated by the widget's own rule conditions</li>
  <li><strong>Source:</strong> [`src/plugins/summaryWidget/plugin.js`](https://github.com/nasa/openmct/blob/master/src/plugins/summaryWidget/plugin.js)</li>
</ul>

Unlike [Condition Set](../condition-set/index.md)–driven styling used elsewhere, Summary Widget has its own self-
contained rule engine (`ruleConfigById`) rather than referencing an external Condition Set object.

## Properties Beyond the [Envelope](../object-envelope/index.md)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `composition` | `Array<{ key, namespace }>` | `[]` | Telemetry objects available to rule conditions. |
| `telemetry` | object | `{}` | Populated by SummaryWidgetMetadataProvider/SummaryWidgetTelemetryProvider at runtime. |
| `openNewTab` | `"thisTab"` \| `"newTab"` | `"thisTab"` | Whether a configured url opens in the current tab or a new one. Top-level property, no configuration wrapper. |
| `configuration.ruleOrder` | `Array<string>` | `["default"]` | Evaluation/display order of rule IDs. |
| `configuration.ruleConfigById` | `Record<string, Rule>` | one seeded `default` rule | Rules, keyed by rule id. |
| `configuration.testDataConfig` | `Array<{ object: string, key: string, value: string }>` | one empty entry | Saved test-data values for the rule editor's "Test data" panel. |

## Rule Object

Each value in `configuration.ruleConfigById`. Defaults below reflect the single `default` rule `initialize()`
seeds for every new Summary Widget; rules you add yourself have no schema-level default and must be fully
specified.

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | string | `"default"` | Matches its own key in ruleConfigById. |
| `name` | string | `"Default"` | Internal rule name. |
| `label` | string | `"Unnamed Rule"` | Editor-facing label. |
| `message` | string | `""` | Message text shown when the rule is active. |
| `icon` | string | `" "` (single space) | Icon glyph/class. |
| `description` | string | `"Default appearance for the widget"` | Human-readable description. |
| `style` | `{ color, "background-color", "border-color" }` | `{ color: "#ffffff", "background-color": "#38761d", "border-color": "rgba(0,0,0,0)" }` | CSS colors (note the hyphenated keys, unlike objectStyles' camelCase). |
| `conditions` | `Array<{ object, key, operation, values }>` | one empty template entry | Rule conditions: object is a composed telemetry key string, key is the telemetry field, operation is a comparator, values is the array of comparison operands. |
| `jsCondition` | string | `""` | Optional raw JavaScript expression evaluated instead of conditions, for advanced rules. |
| `trigger` | `"any"` \| `"all"` | `"any"` | Combine multiple conditions with OR / AND. |
| `expanded` | `"true"` \| `"false"` (string) | `"true"` | Whether the rule is expanded in the editor UI. Persisted as a string, not a boolean. |

## Example

```json
{
  "name": "Spacecraft Health Summary",
  "type": "summary-widget",
  "location": "671327d3-e625-435d-8030-1049fc29b9dd",
  "identifier": { "key": "0b1c2d3e-summary-uuid", "namespace": "" },
  "composition": [
    { "key": "~Spacecraft~SubSystem~parameterName", "namespace": "taxonomy" }
  ],
  "openNewTab": "thisTab",
  "telemetry": {},
  "configuration": {
    "ruleOrder": ["default"],
    "ruleConfigById": {
      "default": {
        "name": "Default",
        "label": "Unnamed Rule",
        "message": "",
        "id": "default",
        "icon": " ",
        "style": { "color": "#ffffff", "background-color": "#38761d", "border-color": "rgba(0,0,0,0)" },
        "description": "Default appearance for the widget",
        "conditions": [{ "object": "", "key": "", "operation": "", "values": [] }],
        "jsCondition": "",
        "trigger": "any",
        "expanded": "true"
      }
    },
    "testDataConfig": [{ "object": "", "key": "", "value": "" }]
  }
}
```
