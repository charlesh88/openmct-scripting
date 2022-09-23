const objJson = {};
let config = {};
let telemetryObjects = [];
let itemPlaceIndex = 0; // Tracks where an item is within a row or column
let itemShiftIndex = 0; // Tracks the row or column that an item is in

function createOpenMCTJSON(telemetryObjects) {
    /*
    telemetryObjects: array of objects like this:
    [{
        name, (Used for alpha labels and domain object naming)
        dataSource (Fully qualified path to telemetry data using ~ as separators, like ~Lorem~Ipsum~FooCount)
        condWidgetUsesOutputAsLabel (either TRUE of FALSE if Condition Widgets should use the output string from Condition Sets) TODO: wire this up!
        condDefOutput (optional string for Condition Set default condition output)
        cond1Criteria, (greaterThan, equals, etc.)
        cond1Value  (0, 1, etc.)
        cond1Output (optional string for Condition Set matching condition output)
        cond1BgColor  (hex color, #00cc00, etc.)
        cond1FgColor (hex color, #00cc00, etc.)
    }]
     */

    config = getConfigFromForm();
    let root = objJson.openmct = new Container();

    // Create the root folder
    let folder = new Obj(config.rootName, 'folder', true);
    root.addJson(folder);
    objJson.rootId = folder.identifier.key;

    // Create a folder to hold Condition Sets and add it to the root folder
    let folderConditionSets = new Obj('Condition Sets', 'folder', true);
    root.addJson(folderConditionSets);
    folder.addToComposition(folderConditionSets.identifier.key);
    folderConditionSets.setLocation(folder);

    // Create a folder to hold Condition Widgets and add it to the root folder
    let folderConditionWidgets = new Obj('Condition Widgets', 'folder', true);
    root.addJson(folderConditionWidgets);
    folder.addToComposition(folderConditionWidgets.identifier.key);
    folderConditionWidgets.setLocation(folder);

    //Create a LAD Table
    let LadTable = new Obj('LAD Table', 'LadTable', true);
    root.addJson(LadTable);
    folder.addToComposition(LadTable.identifier.key);
    LadTable.setLocation(folder);

    // Create a Display Layout for widgets and add it to the root folder
    let dlWidgets = new DisplayLayout({
        'name': 'DL Widgets',
        'layoutGrid': [parseInt(config.layoutGrid[0]), parseInt(config.layoutGrid[1])],
        'itemMargin': config.itemMargin
    });
    root.addJson(dlWidgets);
    folder.addToComposition(dlWidgets.identifier.key);
    dlWidgets.setLocation(folder);

    //Create a Display Layout for alphas and add it to the root folder
    let dlAlphas = new DisplayLayout({
        'name': 'DL Alphas',
        'layoutGrid': [parseInt(config.layoutGrid[0]), parseInt(config.layoutGrid[1])],
        'itemMargin': config.itemMargin
    });
    root.addJson(dlAlphas);
    folder.addToComposition(dlAlphas.identifier.key);
    dlAlphas.setLocation(folder);

    itemPlaceIndex = 0; // Tracks where an item is within a row or column
    itemShiftIndex = 0; // Tracks the row or column that an item is in

    for (const telemetryObject of telemetryObjects) {
        // Build Condition Sets and Widgets, add to Widgets Layout
        const curIndex = telemetryObjects.indexOf(telemetryObject);
        // console.log(telemetryObject);

        // Add telem object to LadTable
        LadTable.addToComposition(telemetryObject.dataSource, 'taxonomy');

        // Create Condition Set
        let cs = new ConditionSet(telemetryObject);
        cs.addConditions(telemetryObject);
        root.addJson(cs);
        folderConditionSets.addToComposition(cs.identifier.key);
        cs.setLocation(folderConditionSets);

        // Create Condition Widget
        let cw = new ConditionWidget(cs, telemetryObject);
        root.addJson(cw);
        folderConditionWidgets.addToComposition(cw.identifier.key);
        cw.setLocation(folderConditionWidgets);

        // Add Widget to Widgets Display Layout
        dlWidgets.addToComposition(cw.identifier.key);

        dlWidgets.addSubObjectView({
            index: curIndex,
            ident: cw.identifier.key,
            itemW: config.dlWidgets.itemW,
            itemH: config.dlWidgets.itemH,
            hasFrame: false,
            layoutStrategy: config.dlWidgets.layoutStrategy,
            layoutStrategyNum: config.dlWidgets.layoutStrategyNum,
        });
    }

    // Reset indexers for Alphas
    itemPlaceIndex = 0; // Tracks where an item is within a row or column
    itemShiftIndex = 0; // Tracks the row or column that an item is in

    for (const telemetryObject of telemetryObjects) {
        const curIndex = telemetryObjects.indexOf(telemetryObject);

        // Build Alphas Layout
        dlAlphas.addTextAndAlphaViewPair({
            index: curIndex,
            labelW: config.dlAlphas.labelW,
            itemW: config.dlAlphas.itemW,
            itemH: config.dlAlphas.itemH,
            ident: telemetryObject.dataSource,
            text: telemetryObject.name,
            layoutStrategy: config.dlAlphas.layoutStrategy,
            layoutStrategyNum: config.dlAlphas.layoutStrategyNum,
        });
        dlAlphas.addToComposition(telemetryObject.dataSource, 'taxonomy');

    }

    // Output JSON
    const outputDisplay = document.getElementById('outputGeneratedJson');
    let outputJSON = JSON.stringify(objJson, null, 4);
    outputStatsDisplay.innerHTML = telemetryObjects.length + ' objects; ' + outputJSON.length + ' chars';
    outputDisplay.innerHTML = outputJSON;
}
