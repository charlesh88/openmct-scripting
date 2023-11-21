const objJson = {};
let telemetryObjects = [];
const ALPHA_BORDER = '1px solid #555555';
const downloadFilenames = {
    'csv': 'from CSV',
    'prl': 'from Pride procedures'
}
const VALID_PATH = [
    'Viper',
    'yamcs'
];
let config = {};
let alphasItemPlacementTracker = {};
let widgetsItemPlacementTracker = {};
let root = objJson.openmct = new Container();
let folderRoot;

function createOpenMCTJSONfromCSV(csv) {
    /*
    telemetryObjects: array of objects like this:
    [{
        name, (Used for alpha labels and domain object naming)
        dataSource (Fully qualified path to telemetry data using ~ as separators, like ~Lorem~Ipsum~FooCount)
        alphaFormat (printf string, like %9.4f)
        alphaUsesCond (TRUE if an alpha should use defined conditions; requires condDef and cond1 at least)
        alphaShowsUnit (TRUE if an alpha should should display its units)
        condWidgetUsesOutputAsLabel (TRUE if Condition Widgets should use the output string from Condition Sets)
        condDefault (output string, bgColor, fgColor)
        cond1, cond2, etc. (output string, bgColor, fgColor, trigger, criteria, value)
    }]
    */

    telemetryObjects = csvToArray(csv);

    config = getConfigFromForm();
    // let root = objJson.openmct = new Container();

    // Create the root folder
    folderRoot = new Obj(config.rootName, 'folder', true);
    root.addJson(folderRoot);
    objJson.rootId = folderRoot.identifier.key;

    // Create a folder to hold Condition Sets and add it to the root folder
    let folderConditionSets = new Obj('Condition Sets', 'folder', true);
    root.addJson(folderConditionSets);
    folderRoot.addToComposition(folderConditionSets.identifier.key);
    folderConditionSets.setLocation(folderRoot);

    // Create a folder to hold Condition Widgets and add it to the root folder
    let folderConditionWidgets = new Obj('Condition Widgets', 'folder', true);
    root.addJson(folderConditionWidgets);
    folderRoot.addToComposition(folderConditionWidgets.identifier.key);
    folderConditionWidgets.setLocation(folderRoot);

    //Create a LAD Table
    let LadTable = new Obj('LAD Table', 'LadTable', true);
    root.addJson(LadTable);
    folderRoot.addToComposition(LadTable.identifier.key);
    LadTable.setLocation(folderRoot);

    for (const telemetryObject of telemetryObjects) {
        LadTable.addToComposition(telemetryObject.dataSource, getNamespace(telemetryObject.dataSource));
    }

    // Create a Display Layout for widgets and add it to the root folder
    let dlWidgets = new DisplayLayout({
        'name': 'DL Widgets',
        'layoutGrid': [parseInt(config.layoutGrid[0]), parseInt(config.layoutGrid[1])],
        'itemMargin': config.itemMargin
    });
    root.addJson(dlWidgets);
    folderRoot.addToComposition(dlWidgets.identifier.key);
    dlWidgets.setLocation(folderRoot);

    //Create a Display Layout for alphas and add it to the root folder
    let dlAlphas = new DisplayLayout({
        'name': 'DL Alphas',
        'layoutGrid': [parseInt(config.layoutGrid[0]), parseInt(config.layoutGrid[1])],
        'itemMargin': config.itemMargin
    });
    root.addJson(dlAlphas);
    folderRoot.addToComposition(dlAlphas.identifier.key);
    dlAlphas.setLocation(folderRoot);

    initAlphasItemPlacementTracker();
    initWidgetsItemPlacementTracker();

    for (const telemetryObject of telemetryObjects) {
        const curIndex = telemetryObjects.indexOf(telemetryObject);
        const isTelemetry = telemetryObject.dataSource.length > 0;

        // If telemObject dataSource includes "," then it's synthetic
        // Create the source, add it to the telemSource folder and to the composition
        // Update telemtryObject.dataSource to use the UUID of the created object

        // LadTable.addToComposition(telemetryObject.dataSource, getNamespace(telemetryObject.dataSource));

        let dlItem = {};

        if (isTelemetry) {
            // If there's a datasource, add a label + alpha pair
            dlItem = dlAlphas.addTextAndAlphaViewPair({
                index: curIndex,
                labelW: config.dlAlphas.labelW,
                itemW: config.dlAlphas.itemW,
                itemH: config.dlAlphas.itemH,
                ident: telemetryObject.dataSource,
                text: telemetryObject.name,
                layoutStrategy: config.dlAlphas.layoutStrategy,
                layoutStrategyNum: config.dlAlphas.layoutStrategyNum,
                placeIndex: alphasItemPlacementTracker.placeIndex,
                shiftIndex: alphasItemPlacementTracker.shiftIndex,
                alphaFormat: telemetryObject.alphaFormat,
                alphaShowsUnit: telemetryObject.alphaShowsUnit
            });

            dlAlphas.addToComposition(telemetryObject.dataSource, getNamespace(telemetryObject.dataSource));
        } else {
            // If no datasource, treat as a standalone label
            dlItem = dlAlphas.addLabel(
                {
                    index: curIndex,
                    itemW: config.dlAlphas.labelW + config.itemMargin + dlAlphas.itemW,
                    itemH: config.dlAlphas.itemH,
                    ident: telemetryObject.dataSource,
                    text: telemetryObject.name,
                    layoutStrategy: config.dlAlphas.layoutStrategy,
                    layoutStrategyNum: config.dlAlphas.layoutStrategyNum,
                    placeIndex: alphasItemPlacementTracker.placeIndex,
                    shiftIndex: alphasItemPlacementTracker.shiftIndex,
                    alphaFormat: telemetryObject.alphaFormat,
                    alphaShowsUnit: telemetryObject.alphaShowsUnit

                }
            )
        }

        alphasItemPlacementTracker.placeIndex = dlItem.placeIndex;
        alphasItemPlacementTracker.shiftIndex = dlItem.shiftIndex;

        // Add conditionals
        if (telemetryObject.cond1.length > 0) {
            let cs = new ConditionSet(telemetryObject);

            const conditionsArr = cs.conditionsToArr(telemetryObject);
            cs.addConditions(telemetryObject, conditionsArr);

            telemetryObjects[curIndex].csKey = cs.identifier.key;

            // Add a "styles" collection for Conditional styling in dlAlpha.objectStyles[dlItem.id]
            if (telemetryObject.alphaUsesCond === 'TRUE') {
                for (const cond of cs.configuration.conditionCollection) {
                    const args = {
                        border: ALPHA_BORDER,
                        bgColor: cond.bgColor,
                        fgColor: cond.fgColor,
                        id: cond.id
                    }
                    const alphaCondStyleObj = createStyleObj(args);
                    dlAlphas.configuration.objectStyles[dlItem.id].styles.push(alphaCondStyleObj);
                    dlAlphas.configuration.objectStyles[dlItem.id].conditionSetIdentifier = createIdentifier(cs.identifier.key);

                    telemetryObjects[curIndex].csStyleObj = alphaCondStyleObj;
                }
                telemetryObjects[curIndex].alphaObjStyles = dlAlphas.configuration.objectStyles[dlItem.id].styles;
            }

            root.addJson(cs);
            folderConditionSets.addToComposition(cs.identifier.key);
            cs.setLocation(folderConditionSets);

            // Create Condition Widget
            let cw = new ConditionWidget(cs, telemetryObject, conditionsArr);
            root.addJson(cw);
            folderConditionWidgets.addToComposition(cw.identifier.key);
            cw.setLocation(folderConditionWidgets);

            telemetryObjects[curIndex].cwKey = cw.identifier.key;

            // Add Widget to Widgets Display Layout
            dlWidgets.addToComposition(cw.identifier.key);

            const widget = dlWidgets.addSubObjectView({
                index: curIndex,
                ident: cw.identifier.key,
                itemW: config.dlWidgets.itemW,
                itemH: config.dlWidgets.itemH,
                hasFrame: false,
                layoutStrategy: config.dlWidgets.layoutStrategy,
                layoutStrategyNum: config.dlWidgets.layoutStrategyNum,
                placeIndex: widgetsItemPlacementTracker.placeIndex,
                shiftIndex: widgetsItemPlacementTracker.shiftIndex
            });

            widgetsItemPlacementTracker.placeIndex = widget.placeIndex;
            widgetsItemPlacementTracker.shiftIndex = widget.shiftIndex;
        }
    }

    outputJSON();
}

function initAlphasItemPlacementTracker() {
    alphasItemPlacementTracker.placeIndex = 0;
    alphasItemPlacementTracker.shiftIndex = 0;
}

function initWidgetsItemPlacementTracker() {
    widgetsItemPlacementTracker.placeIndex = 0;
    widgetsItemPlacementTracker.shiftIndex = 0;
}

function createOpenMCTMatrixLayoutJSONfromCSV(csv) {
    console.log('createOpenMCTMatrixLayoutJSONfromCSV\n', csv);
    csv = csv.replaceAll('\r', '');
    csv = csv.replace(/"[^"]+"/g, function (v) {
        // Encode all commas that are within double quote chunks with |
        return v.replace(/,/g, '|');
    });

    const rows = csv.split('\n');
    // console.log(rows);

    const rowArr = rows.map(function (row) {
        const values = row.split(',');
        return values;
    });

    console.log('tO',telemetryObjects);

    // Create a layout for the matrix and add it to the root folder
    let dlMatrix = new DisplayLayout({
        'name': 'DL Matrix',
        'layoutGrid': [parseInt(config.layoutGrid[0]), parseInt(config.layoutGrid[1])],
        'itemMargin': config.itemMargin
    });
    root.addJson(dlMatrix);
    folderRoot.addToComposition(dlMatrix.identifier.key);
    dlMatrix.setLocation(folderRoot);

    const arrColWidths = rowArr[0];
    let curY = 0;
    let dlItem = {};

    // Iterate through telemetry collection
    for (let r = 1; r < rowArr.length; r++) {
        const row = rowArr[r];
        console.log(row);

        const rowH = parseInt(row[0]);

        let curX = 0;

        // Iterate through row cells
        for (let c = 1; c < row.length; c++) {
            // Process each cell in the matrix
            let cell = row[c];
            const colW = parseInt(arrColWidths[c]);

            /*
                TODO: Look for commas, and if present, strip out and handle args
                - If a comma followed by "_xx", display as:
                - _cw: Condition Widget
                - _op: Overlay Plot
             */

            if (cell.includes(',')) {
                const cellArgs = cell.substring(cell.indexOf(','),cell.length);
                cell = cell.substring(0,cell.indexOf(','));
            }

            if (cell.includes("~")) {
                // It's a telemetry path, add a telemetry view
                console.log('Add telem for '
                    .concat(cell)
                    .concat(' at ')
                    .concat(curX.toString())
                    .concat(', ')
                    .concat(curY.toString())
                    .concat('; w = ')
                    .concat(colW)
                    .concat('; h = ')
                    .concat(rowH)
                );

                // If telem, get the corresponding telemetryObject
                const telemetryObject = telemetryObjects.find(e => e.dataSource === cell);

                dlItem = dlMatrix.addTelemetryView({
                    itemW: colW,
                    itemH: rowH,
                    x: curX,
                    y: curY,
                    ident: cell,
                    alphaFormat: telemetryObject.alphaFormat,
                    alphaShowsUnit: telemetryObject.alphaShowsUnit
                });

                dlMatrix.addToComposition(cell, getNamespace(cell));
            } else if (cell.length > 0) {
                // It's a label, add a text view
                console.log('Add label for '
                    .concat(cell)
                    .concat(' at ')
                    .concat(curX.toString())
                    .concat(', ')
                    .concat(curY.toString())
                    .concat('; w = ')
                    .concat(colW)
                    .concat('; h = ')
                    .concat(rowH)
                );

                dlItem = dlMatrix.addTextView({
                    itemW: colW,
                    itemH: rowH,
                    x: curX,
                    y: curY,
                    text: cell
                });
            } else {
                // Blank cell, skip it
                console.log('Blank cell at '
                    .concat(curX.toString())
                    .concat(', ')
                    .concat(curY.toString())
                    .concat('; w = ')
                    .concat(colW)
                    .concat('; h = ')
                    .concat(rowH)
                );
            }

            curX += colW + ((c > 1)? config.itemMargin : 0);
        }

        curY += rowH + ((r > 1)? config.itemMargin : 0);
    }




}
