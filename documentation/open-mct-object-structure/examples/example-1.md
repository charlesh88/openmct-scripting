---
title: "Folder with Display Layout and Sine Wave Generator"
sidebar_label: "Folder with Items"
---

A folder containing a Sine Wave Generator and a Display Layout. The layout includes an alphanumeric view of the Sine Wave Generator.

```json
{
  "openmct": {
    "8075c3ce-fc75-444e-bacc-b5cda838667f": {
      "name": "Example Folder",
      "type": "folder",
      "composition": [
        {
          "key": "94c308fc-23a7-433e-8a01-c92cb2d3386c",
          "namespace": ""
        },
        {
          "key": "38d3c7f8-442f-410c-9946-e86a1a6dbb49",
          "namespace": ""
        }
      ],
      "modified": 1782942241587,
      "location": "69ab322b-c567-40b5-b078-ea06d1c054ae",
      "modifiedBy": "chacskay",
      "createdBy": "chacskay",
      "created": 1782942217966,
      "persisted": 1782942241587,
      "identifier": {
        "namespace": "",
        "key": "8075c3ce-fc75-444e-bacc-b5cda838667f"
      }
    },
    "94c308fc-23a7-433e-8a01-c92cb2d3386c": {
      "name": "Example Sine Wave Generator",
      "type": "generator",
      "telemetry": {
        "period": 10,
        "amplitude": 1,
        "offset": 0,
        "dataRateInHz": 1,
        "phase": 0,
        "randomness": 0,
        "loadDelay": 0,
        "infinityValues": false,
        "exceedFloat32": false,
        "staleness": false
      },
      "modified": 1782942229882,
      "location": "8075c3ce-fc75-444e-bacc-b5cda838667f",
      "modifiedBy": "chacskay",
      "createdBy": "chacskay",
      "created": 1782942229882,
      "persisted": 1782942229882,
      "identifier": {
        "namespace": "",
        "key": "94c308fc-23a7-433e-8a01-c92cb2d3386c"
      }
    },
    "38d3c7f8-442f-410c-9946-e86a1a6dbb49": {
      "name": "Example Display Layout",
      "type": "layout",
      "composition": [
        {
          "namespace": "",
          "key": "94c308fc-23a7-433e-8a01-c92cb2d3386c"
        }
      ],
      "configuration": {
        "items": [
          {
            "identifier": {
              "namespace": "",
              "key": "94c308fc-23a7-433e-8a01-c92cb2d3386c"
            },
            "x": 0,
            "y": 0,
            "width": 38,
            "height": 3,
            "displayMode": "all",
            "value": "sin",
            "stroke": "",
            "fill": "",
            "color": "",
            "fontSize": "default",
            "font": "default",
            "type": "telemetry-view",
            "id": "5bc16cab-671b-476c-b575-092eb84d6734"
          }
        ],
        "layoutGrid": [
          10,
          10
        ]
      },
      "modified": 1782942258865,
      "location": "8075c3ce-fc75-444e-bacc-b5cda838667f",
      "modifiedBy": "chacskay",
      "createdBy": "chacskay",
      "created": 1782942241435,
      "persisted": 1782942258866,
      "identifier": {
        "namespace": "",
        "key": "38d3c7f8-442f-410c-9946-e86a1a6dbb49"
      }
    }
  },
  "rootId": "8075c3ce-fc75-444e-bacc-b5cda838667f"
}
```
