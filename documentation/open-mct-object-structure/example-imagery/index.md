---
title: "Example Imagery"
---

For development use. Creates example imagery data that mimics a live imagery stream, cycling through a set of sample images — useful for testing the Imagery view without a real camera feed.

<ul>
  <li><strong>Type key:</strong> `example.imagery`</li>
  <li><strong>Creatable:</strong> Yes</li>
  <li><strong>Composition:</strong> No</li>
  <li><strong>Source:</strong> [`example/imagery/plugin.js`](https://github.com/nasa/openmct/blob/master/example/imagery/plugin.js)</li>
</ul>

## Properties Beyond the [Envelope](../object-envelope/index.md)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `configuration.imageLocation` | string | `""` | Comma-separated list of image URLs to cycle through. When empty, falls back to a built-in set of sample Apollo mission photos. |
| `configuration.imageLoadDelayInMilliSeconds` | number | `20000` | Delay between simulated image captures. Enforced minimum of `5000` at runtime — lower values are reset back to the default. |
| `configuration.imageSamples` | array | `[]` | Reserved; not populated by `initialize()`. |
| `configuration.layers` | array | `[]` | Reserved; not populated by `initialize()`. |
| `telemetry.values` | array | fixed value-metadata array (see below) | Telemetry metadata describing this object's own output fields. Unlike the Sine Wave/State/Event generators, this is written once into the object itself at creation, not computed at runtime from the type key. |

`telemetry.values` is a literal array of value-metadata objects, always the same for a newly-created Example
Imagery object: `name`, `utc` (domain), `local` (domain, local-format), `url` (the image, format `image`, with
three built-in overlay layers — 16:9, Safe, Scale), `thumbnail-url` (format `thumbnail`, sourced from `url`),
`imageDownloadName`.

## Example

```json
{
  "name": "Example Imagery",
  "type": "example.imagery",
  "location": "671327d3-e625-435d-8030-1049fc29b9dd",
  "identifier": { "key": "5b6a7f8e-exampleimagery-uuid", "namespace": "" },
  "configuration": {
    "imageLocation": "",
    "imageLoadDelayInMilliSeconds": 20000,
    "imageSamples": [],
    "layers": []
  },
  "telemetry": {
    "values": [
      { "name": "Name", "key": "name" },
      { "name": "Time", "key": "utc", "format": "utc", "hints": { "domain": 2 } },
      { "name": "Local Time", "key": "local", "format": "local-format", "hints": { "domain": 1 } },
      {
        "name": "Image",
        "key": "url",
        "format": "image",
        "hints": { "image": 1 },
        "layers": [
          { "source": "dist/imagery/example-imagery-layer-16x9.png", "name": "16:9" },
          { "source": "dist/imagery/example-imagery-layer-safe.png", "name": "Safe" },
          { "source": "dist/imagery/example-imagery-layer-scale.png", "name": "Scale" }
        ]
      },
      {
        "name": "Image Thumbnail",
        "key": "thumbnail-url",
        "format": "thumbnail",
        "hints": { "thumbnail": 1 },
        "source": "url"
      },
      {
        "name": "Image Download Name",
        "key": "imageDownloadName",
        "format": "imageDownloadName",
        "hints": { "imageDownloadName": 1 }
      }
    ]
  }
}
```
