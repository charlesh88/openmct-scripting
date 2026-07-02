---
title: "Conditional Styling (`configuration.objectStyles`)"
---

Many container and visualization types support styling driven by a [Condition Set](../condition-set/index.md):
`layout`, `flexible-layout`, `LadTable`, `table`, `telemetry.plot.overlay`, `telemetry.plot.stacked`,
`gauge`, `conditionWidget`, and Display Layout items. All of them share the same `objectStyles` shape, applied
via a `get` interceptor registered per type (e.g.
[`displayLayoutStylesInterceptor.js`](https://github.com/nasa/openmct/blob/master/src/plugins/displayLayout/displayLayoutStylesInterceptor.js)) and
edited through the Styles inspector tab
([`StyleEditor.vue`](https://github.com/nasa/openmct/blob/master/src/plugins/condition/components/inspector/StyleEditor.vue),
[`constants.js`](https://github.com/nasa/openmct/blob/master/src/plugins/condition/utils/constants.js)).

## Two Shapes of objectStyles

### 1. Whole-object styling

Set directly on `configuration.objectStyles` for types that are styled as a single unit (Gauge, LAD Table,
Condition Widget, Overlay/Stacked Plot):

```json
{
  "objectStyles": {
    "styles": [
      {
        "conditionId": "<id of a condition in the linked Condition Set's conditionCollection>",
        "style": { "backgroundColor": "", "border": "", "color": "", "isStyleInvisible": "", "output": "", "url": "" }
      }
    ],
    "staticStyle": {
      "style": { "backgroundColor": "", "border": "", "color": "", "isStyleInvisible": "", "output": "", "url": "" }
    },
    "conditionSetIdentifier": { "key": "<uuid>", "namespace": "<namespace>" }
  }
}
```

(See [`Style` object](#style-object) below for the fields inside each `style`.)

- `conditionSetIdentifier` — identifier of the Condition Set object driving this style. Omit entirely for
  static-only styling (no condition set applied).
- `styles[]` — one entry per condition in the referenced Condition Set's `configuration.conditionCollection`,
  matched by `conditionId`. Applied when that condition is the active (matched) one.
- `staticStyle` — fallback style applied when no condition set is linked, or before evaluation.

### 2. Per-item styling (Display Layout / Flexible Layout)

For layout-type containers, `configuration.objectStyles` is instead a **map keyed by layout item `id`**
(the `id` of an entry in `configuration.items[]`), each value having the same `{ styles, staticStyle, conditionSetIdentifier }` shape as above:

```json
{
  "objectStyles": {
    "<layout item id>": {
      "staticStyle": { "style": { "backgroundColor": "", "border": "", "color": "", "isStyleInvisible": "", "output": "", "url": "" } },
      "styles": []
    },
    "<another layout item id>": {
      "styles": [
        { "conditionId": "<condition id>", "style": { "backgroundColor": "#008afa", "border": "", "color": "#ffffff", "isStyleInvisible": "", "output": "", "url": "" } },
        { "conditionId": "<default condition id>", "style": { "backgroundColor": "", "border": "1px solid #434343", "color": "#ffffff", "isStyleInvisible": "", "output": "", "url": "" } }
      ],
      "conditionSetIdentifier": { "namespace": "", "key": "<conditionSet uuid>" }
    }
  }
}
```

By convention, when a condition set is linked to an item, `styles[]` contains one entry per condition
(including the Condition Set's built-in `Default` condition) so every possible output has a defined style; the
last entry is typically the `Default` condition's style.

## Style Object

The value under `style` in either shape above. All fields are strings; use `""` to mean "unset / inherit".

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `backgroundColor` | string (CSS color or `""`) | `""` | Fill/background color, e.g. `"#008afa"`. |
| `border` | string (CSS `border` shorthand or `""`) | `""` | E.g. `"1px solid #434343"`. |
| `color` | string (CSS color or `""`) | `""` | Text/foreground color. |
| `isStyleInvisible` | `""` \| `"is-style-invisible"` | `""` | Set to `"is-style-invisible"` to hide the object/item entirely when this style is active (source: STYLE_CONSTANTS.isStyleInvisible in condition/utils/constants.js). |
| `output` | string | `""` | Reserved for condition-driven text substitution in some views. |
| `url` | string | `""` | Used by Image layout items to swap the displayed image per-condition; `""` for non-image styles. |

## Example (From a Real Export)

A Display Layout item styled by the `bitSyncLock` Condition Set, blue when locked and outlined gray otherwise:

```json
{
  "49183500-d149-4416-a474-545c1e15120c": {
    "styles": [
      {
        "conditionId": "5dd0aae3-8ec6-46ad-bbba-d70964064f69",
        "style": {
          "backgroundColor": "#008afa",
          "border": "",
          "color": "#ffffff",
          "isStyleInvisible": "",
          "output": "",
          "url": ""
        }
      },
      {
        "conditionId": "e35a144e-90ce-44a6-86ce-9a04e5d8c5b7",
        "style": {
          "backgroundColor": "",
          "border": "1px solid #434343",
          "color": "#ffffff",
          "isStyleInvisible": "",
          "output": "",
          "url": ""
        }
      }
    ],
    "conditionSetIdentifier": {
      "namespace": "",
      "key": "a16d48c2-aea0-4032-8149-ddc167fba540"
    }
  }
}
```

## Import/Export Note

`configuration.objectStyles.conditionSetIdentifier` (and per-item `conditionSetIdentifier` values) are **not**
part of the object's `composition`, but the referenced Condition Set object still needs to be included in an
importable tree. `ExportAsJSONAction` walks these references explicitly
(`#getConditionSetIdentifier` / `#hasItemConditionSetIdentifiers`) specifically because they'd otherwise be
missed. When hand-scripting a tree that uses conditional styling, make sure the referenced `conditionSet`
object is also present in the `openmct` map, even though nothing in `composition` points to it.
