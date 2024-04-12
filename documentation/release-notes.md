# Release Notes
## v3.1.0 12 April 2024
- Added Conditional Graphics capability:
  - Create conditionally styled images in Display Layouts from CSV input.
  - Added Sine Wave Generator creation.
- Enhancements and fixes in Matrix Layout:
  - Up to 10 conditions can now be defined in the telemetry CSV file.
  - Display Layout grid units and item margin are now defined in the layout CSV file and have been removed as form inputs.
- Significant internal changes to code involved with creating Condition Sets and conditional styling for clarity and maintainability. This has no effect on how conditions are formatted in CSV files.
- Fixes to how special characters are escaped and handled; now _link()  arguments can include Open MCT urls with a mix of "/" and "~" without breaking.
- Removed "Legacy" Display Layout / Widgets page, no longer supporting as all capability and more is covered with Matrix Layout.
