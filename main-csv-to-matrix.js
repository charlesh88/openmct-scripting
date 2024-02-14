const INPUT_TYPE = "csv";
const inputMatrixCsv = document.getElementById("inputMatrixCsv");
let folderConditionWidgets;

inputCsv.addEventListener("change", function (ev) {
    uploadTelemetryFile(ev.currentTarget.files);
}, false);

inputMatrixCsv.addEventListener("change", function (ev) {
    uploadMatrixFile(ev.currentTarget.files, 'csv');
}, false);

function getConfigFromForm() {
    // Get form values
    const config = {};

    config.rootName = document.getElementById('rootName').value;
    config.layoutGrid = document.getElementById('layoutGrid').value.split(',');
    config.itemMargin = getFormNumericVal('itemMargin');

    return config;
}

function uploadTelemetryFile(files) {
    let readers = [];
    let filenames = [];

    // Abort if there were no files selected
    if (!files.length) return;

    // Store promises in array
    for (let i = 0; i < files.length; i++) {
        filenames.push(files[i].name);
        readers.push(readFileAsText(files[i]));
    }

    // Trigger Promises
    Promise.all(readers).then((values) => {
        // Values will be an array that contains an item
        // with the text of every selected file
        // ["File1 Content", "File2 Content" ... "FileN Content"]
        parseCSVTelemetry(values[0]);
    });
}

function parseCSVTelemetry(csv) {
    telemetryObjects = csvToArray(csv);

    outputMsg('Telemetry CSV imported, '
        .concat(telemetryObjects.length.toString())
        .concat(' rows found')
    );

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
    folderConditionWidgets = new Obj('Condition Widgets', 'folder', true);
    root.addJson(folderConditionWidgets);
    folderRoot.addToComposition(folderConditionWidgets.identifier.key);
    folderConditionWidgets.setLocation(folderRoot);

    for (const telemetryObject of telemetryObjects) {
        const curIndex = telemetryObjects.indexOf(telemetryObject);
        const isTelemetry = telemetryObject.dataSource.length > 0;

        // Add conditionals
        if (telemetryObject.cond1.length > 0) {
            let cs = new ConditionSet(telemetryObject);

            const conditionsArr = cs.conditionsToArr(telemetryObject);
            cs.addConditions(telemetryObject, conditionsArr);

            telemetryObjects[curIndex].csKey = cs.identifier.key;
            telemetryObjects[curIndex].cs = cs;
            // telemetryObject[curIndex].conditionsArr = conditionsArr;
            console.log(telemetryObject, conditionsArr);

            // Add a "styles" collection for Conditional styling in the matrix layout
            if (telemetryObject.alphaUsesCond === 'TRUE') {
                telemetryObjects[curIndex].alphaObjStyles = [];

                for (const cond of cs.configuration.conditionCollection) {
                    const args = {
                        border: ALPHA_BORDER,
                        bgColor: cond.bgColor,
                        fgColor: cond.fgColor,
                        id: cond.id
                    }
                    telemetryObjects[curIndex].alphaObjStyles.push(createStyleObj(args));
                }
            }

            root.addJson(cs);
            folderConditionSets.addToComposition(cs.identifier.key);
            cs.setLocation(folderConditionSets);
        }
    }
    // console.log(telemetryObjects);
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
                cell = cell.substring(0, cell.indexOf(argSeparator)).replaceAll('"', '').trim();
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
                        if (telemetryObject && telemetryObject.cs) {
                            // Create Condition Widget
                            let cw = new ConditionWidget(telemetryObject.cs, telemetryObject);
                            root.addJson(cw);
                            folderConditionWidgets.addToComposition(cw.identifier.key);
                            cw.setLocation(folderConditionWidgets);
                            // telemetryObjects[curIndex].cwKey = cw.identifier.key;

                            // Add Condition Widget to the layout
                            dlMatrix.addSubObjectViewInPlace({
                                itemW: itemW,
                                itemH: rowH,
                                x: curX,
                                y: curY,
                                ident: cw.identifier.key,
                                hasFrame: false
                            });

                            dlMatrix.addToComposition(cw.identifier.key);
                        } else {
                            // The matrix file wanted a Condition Widget, but there wasn't corresponding info in the
                            // telemetry CSV file
                            outputMsg(cell.concat(' designated to display as a Condition Widget, but no corresponding entry was found in the telemetry CSV'));
                        }
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
            } else if (cell.length > 0) {
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

    outputJSON();
    outputMsg('Matrix Layout generated');
}
