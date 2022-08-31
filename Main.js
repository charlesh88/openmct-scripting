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
        datasource, (Fully qualified path to telemetry data using ~ as separators, like ~Lorem~Ipsum~FooCount)
        conditionCriteria, (greaterThan, equals, etc.)
        watchValue,  (0, 1, etc.)
        condMatchBgColor,  (hex color, #00cc00, etc.)
        condMatchFgColor (hex color, #00cc00, etc.)
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

    for (const telemetryObject of telemetryObjects) {
        // Build Condition Sets and Widgets, add to Widgets Layout
        const curIndex = telemetryObjects.indexOf(telemetryObject);

        // Create Condition Set
        let cs = new ConditionSet('CS ' + telemetryObject.name, telemetryObject.datasource);
        cs.addConditions('Enabled', telemetryObject.operation, telemetryObject.watchValue);
        root.addJson(cs);
        folderConditionSets.addToComposition(cs.identifier.key);
        cs.setLocation(folderConditionSets);

        // Create Condition Widget
        let cw = new ConditionWidget('CW ' + telemetryObject.name, cs);
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
            ident: telemetryObject.datasource,
            text: telemetryObject.name,
            layoutStrategy: config.dlAlphas.layoutStrategy,
            layoutStrategyNum: config.dlAlphas.layoutStrategyNum,
        });
        dlAlphas.addToComposition(telemetryObject.datasource, 'taxonomy');

    }

    // Output JSON
    const outputDisplay = document.getElementById('outputGeneratedJson');
    let outputJSON = JSON.stringify(objJson, null, 4);
    outputStatsDisplay.innerHTML = telemetryObjects.length + ' objects; ' + outputJSON.length + ' chars';
    outputDisplay.innerHTML = outputJSON;
}
