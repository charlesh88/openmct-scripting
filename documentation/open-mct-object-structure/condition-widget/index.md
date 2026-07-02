---
title: "Condition Widget"
---

A button that can be used on its own, or dynamically styled with a Condition Set.

<ul>
  <li><strong>Type key:</strong> `conditionWidget`</li>
  <li><strong>Creatable:</strong> Yes</li>
  <li><strong>Composition:</strong> No</li>
  <li><strong>Source:</strong> [`src/plugins/conditionWidget/plugin.js`](https://github.com/nasa/openmct/blob/master/src/plugins/conditionWidget/plugin.js)</li>
</ul>

## Properties Beyond the [Envelope](../object-envelope/index.md)

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | string | Yes | `"Condition Widget"` | Static label text. |
| `conditionalLabel` | string | No | `""` | Overrides label when set by a matched condition's output (via conditional styling output field — see [Conditional Styling](../conditional-styling/index.md)). Typically left `""` and driven at runtime. |
| `url` | string | No | `""` | Optional URL the widget links to when clicked. |
| `configuration.objectStyles` | object | No | `{}` | See [Conditional Styling](../conditional-styling/index.md) — this is how the widget's color/visibility is driven by a Condition Set. |

## Example

```json
{
  "name": "Uplink Status Widget",
  "type": "conditionWidget",
  "location": "671327d3-e625-435d-8030-1049fc29b9dd",
  "identifier": { "key": "8f9a0b1c-widget-uuid", "namespace": "" },
  "label": "Uplink",
  "conditionalLabel": "",
  "url": "",
  "configuration": {
    "objectStyles": {
      "conditionSetIdentifier": { "namespace": "", "key": "1c07f477-35bf-4d1b-a45b-79e4761df5cc" },
      "styles": [
        {
          "conditionId": "74c25c1f-122d-431f-b2b0-c5f6a626d77c",
          "style": { "backgroundColor": "#008afa", "border": "", "color": "#ffffff", "isStyleInvisible": "", "output": "", "url": "" }
        },
        {
          "conditionId": "bdc68f3d-4f44-4bc6-aed0-93bdabd1c034",
          "style": { "backgroundColor": "", "border": "1px solid #434343", "color": "#ffffff", "isStyleInvisible": "", "output": "", "url": "" }
        }
      ]
    }
  }
}
```
