const INPUT_TYPE = "csv";

inputCsv.addEventListener("change", function(ev){
    uploadFiles(ev.currentTarget.files, 'csv');
}, false);

inputMatrixCsv.addEventListener("change", function(ev){
    uploadMatrixFile(ev.currentTarget.files, 'csv');
}, false);

function getConfigFromForm() {
    // Get form values
    const config = {};

    config.rootName = document.getElementById('rootName').value;
    config.layoutGrid = document.getElementById('layoutGrid').value.split(',');
    config.itemMargin = getFormNumericVal('itemMargin');

    config.dlWidgets = {};
    config.dlWidgets.layoutStrategy = document.getElementById('widgetLayoutStrategy').value;
    config.dlWidgets.layoutStrategyNum = getFormNumericVal('widgetLayoutStrategyNum');
    config.dlWidgets.itemW = getFormNumericVal('widgetLayoutItemWidth');
    config.dlWidgets.itemH = getFormNumericVal('widgetLayoutItemHeight');

    config.dlAlphas = {};
    config.dlAlphas.layoutStrategy = document.getElementById('alphaLayoutStrategy').value;
    config.dlAlphas.layoutStrategyNum = getFormNumericVal('alphaLayoutStrategyNum');
    config.dlAlphas.labelW = getFormNumericVal('alphaLayoutLabelWidth');
    config.dlAlphas.itemW = getFormNumericVal('alphaLayoutItemWidth');
    config.dlAlphas.itemH = getFormNumericVal('alphaLayoutItemHeight');

    return config;
}

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

    outputMsg('Telemetry CSV imported, '
        .concat(telemetryObjects.length.toString())
        .concat(' rows found')
    );

    for (const telemetryObject of telemetryObjects) {
        const curIndex = telemetryObjects.indexOf(telemetryObject);
        const isTelemetry = telemetryObject.dataSource.length > 0;

        // If telemObject dataSource includes "," then it's synthetic
        // Create the source, add it to the telemSource folder and to the composition
        // Update telemtryObject.dataSource to use the UUID of the created object

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

function createOpenMCTMatrixLayoutJSONfromCSV(csv) {
    // console.log('createOpenMCTMatrixLayoutJSONfromCSV\n', csv);
    csv = csv.replaceAll('\r', '');
    csv = csv.replace(/"[^"]+"/g, function (v) {
        // Encode all commas that are within double quote chunks with |
        return v.replace(/,/g, '|');
    });

    const rows = csv.split('\n');
    const rowArr = rows.map(function (row) {
        const values = row.split(',');
        return values;
    });

    // console.log('telemetryObjects', telemetryObjects);

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

    outputMsg('Matrix Layout started: '
        .concat(arrColWidths.length.toString())
        .concat(' columns and ')
        .concat(rowArr.length.toString())
        .concat(' rows')
    );

    // Iterate through telemetry collection
    for (let r = 1; r < rowArr.length; r++) {
        const row = rowArr[r];
        const rowH = parseInt(row[0]);
        let curX = 0;

        // Iterate through row cells
        for (let c = 1; c < row.length; c++) {
            // Process each cell in the matrix
            let cell = row[c].trim();
            let colW = parseInt(arrColWidths[c]);
            let itemW = colW;

            /*
                Look for converted commas, and if present, strip out and handle args
                - If a | followed by "_xx", display as:
                - _cw: Condition Widget
                - _op: Overlay Plot (NOT IMPLEMENTED)
             */

            const argSeparator = '|';
            let cellArgs;

            if (cell.includes(argSeparator)) {
                cellArgs = cell.substring(cell.indexOf(argSeparator) + 1, cell.length);
                cell = cell.substring(0, cell.indexOf(argSeparator)).replaceAll('"','').trim();
            }

            if (cellArgs && cellArgs.includes('_span')) {
                const start = cellArgs.indexOf('_span');
                let spanNumStr = cellArgs.substring(start + 6);
                const spanNum = parseInt(spanNumStr.substring(0, spanNumStr.indexOf(')')));

                // Span includes the current column, c
                // Add widths from columns to be spanned to itemW
                for (let i = c + 1; i < (c + spanNum); i++) {
                    itemW += parseInt(arrColWidths[i]) + config.itemMargin;
                    // console.log('...incrementing itemW',itemW);
                }
            }

            // console.log('Row',r,'Cell',c,'colW',colW,'itemW',itemW);

            if (cell.includes("~")) {
                // If telem, get the corresponding telemetryObject
                const telemetryObject = telemetryObjects.find(e => e.dataSource === cell);

                if (cellArgs) {
                    if (cellArgs.includes('_cw')) {
                        // Add previously created Condition Widget
                        dlMatrix.addSubObjectViewInPlace({
                            itemW: itemW,
                            itemH: rowH,
                            x: curX,
                            y: curY,
                            ident: telemetryObject.cwKey,
                            hasFrame: false
                        });

                        dlMatrix.addToComposition(telemetryObject.cwKey);
                    }
                } else {
                    // Add as a telemetry view (alphanumeric)
                    dlItem = dlMatrix.addTelemetryView({
                        itemW: itemW,
                        itemH: rowH,
                        x: curX,
                        y: curY,
                        ident: cell,
                        alphaFormat: telemetryObject.alphaFormat,
                        alphaShowsUnit: telemetryObject.alphaShowsUnit
                    });

                    if (telemetryObject.alphaObjStyles) {
                        dlMatrix.configuration.objectStyles[dlItem.id].styles = telemetryObject.alphaObjStyles;
                        dlMatrix.configuration.objectStyles[dlItem.id].conditionSetIdentifier = telemetryObject.csKey;
                    }
                }

                dlMatrix.addToComposition(cell, getNamespace(cell));
            }
            else
            if (cell.length > 0) {
                const args = {
                    itemW: itemW,
                    itemH: rowH,
                    x: curX,
                    y: curY,
                    text: cell
                };

                // console.log('args for', cell,'colW:',colW);

                if (cellArgs && cellArgs.includes('_bg')) {
                    const start = cellArgs.indexOf('_bg');
                    const bgColorStr = cellArgs.substring(start + 4, start + 11);
                    args.bgColor = bgColorStr;
                }

                if (cellArgs && cellArgs.includes('_fg')) {
                    const start = cellArgs.indexOf('_fg');
                    const fgColorStr = cellArgs.substring(start + 4, start + 11);
                    args.fgColor = fgColorStr;
                }

                dlItem = dlMatrix.addTextView(args);
            }

            curX += colW + ((c > 1) ? config.itemMargin : 0);
        }

        curY += rowH + config.itemMargin;
    }

    outputMsg('Matrix Layout generated');
}
