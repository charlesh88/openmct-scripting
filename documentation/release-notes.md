# Release Notes

## v3.2 - May 22, 2024

- Better parameter extraction from procedures and GCS's, and adds optional validation against the mission dictionary.
    - Better approach to telemetry extraction, also taken advantage of by procedure displays.
    - Procedure displays now use more detailed step numbering and include operator responsible for the step.
    - Now uses Yamcs web api for parameter validation.
    - Procedure and GCS extraction now outputs a CSV matrix of parameters, and the procedures and GCS's they're used in.
- App now uses an in-component scrolling layout.
- Fixed a problem with conditional graphics that caused gray borders to be displayed on graphics when no telemetry was
  available.
- 
## v3.1.0 - April 12 2024

- Added Conditional Graphics capability:
    - Create conditionally styled images in Display Layouts from CSV input.
    - Added Sine Wave Generator creation.
- Enhancements and fixes in Matrix Layout:
    - Up to 10 conditions can now be defined in the telemetry CSV file.
    - Display Layout grid units and item margin are now defined in the layout CSV file and have been removed as form
      inputs.
- Significant internal changes to code involved with creating Condition Sets and conditional styling for clarity and
  maintainability. This has no effect on how conditions are formatted in CSV files.
- Fixes to how special characters are escaped and handled; now _link()  arguments can include Open MCT urls with a mix
  of "/" and "~" without breaking.
- Removed "Legacy" Display Layout / Widgets page, no longer supporting as all capability and more is covered with Matrix
  Layout.
