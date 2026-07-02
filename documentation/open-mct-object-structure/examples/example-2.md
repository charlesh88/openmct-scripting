---
title: "Overlay Plot with Telemetry Source"
sidebar_label: "Plot with Telemetry"
---

An Overlay Plot composed of a telemetry source. 

:::caution
The telemetry in this example is anonymized and will not work as a source if imported into Open MCT.
:::

```json
{
  "openmct": {
    "8d54f375-6924-4d66-8b5f-870e3bc74522": {
      "name": "Example Overlay Plot",
      "type": "telemetry.plot.overlay",
      "composition": [
        {
          "key": "~Spacecraft~SubSystem~parameterName",
          "namespace": "taxonomy"
        }
      ],
      "configuration": {
        "series": [
          {
            "identifier": {
              "key": "~Spacecraft~SubSystem~parameterName",
              "namespace": "taxonomy"
            },
            "markerShape": "diamond",
            "markerSize": 5,
            "color": "#05a300"
          }
        ],
        "yAxis": {
          "label": "State"
        }
      },
      "modified": 1782943068715,
      "location": "69ab322b-c567-40b5-b078-ea06d1c054ae",
      "modifiedBy": "chacskay",
      "createdBy": "chacskay",
      "created": 1782943001883,
      "persisted": 1782943068716,
      "identifier": {
        "namespace": "",
        "key": "8d54f375-6924-4d66-8b5f-870e3bc74522"
      }
    }
  },
  "rootId": "8d54f375-6924-4d66-8b5f-870e3bc74522"
}
```
