const INPUT_TYPE = "csv";
const inputMatrixCsv = document.getElementById("inputMatrixCsv");
const OUTPUT_BASE_NAME_KEY = '_MATRIX_LAYOUT_BASE_NAME';
let folderConditionWidgets;

storeOutputBaseName();
loadLocalSettings();
inputCsv.addEventListener("change", function (ev) {
    uploadTelemetryFile(ev.currentTarget.files);
}, false);

inputMatrixCsv.addEventListener("change", function (ev) {
    uploadMatrixFile(ev.currentTarget.files, 'csv');
}, false);

function getConfigFromForm() {
    // Get form values
    const config = {};

    config.outputBaseName = document.getElementById('output-base-name').value;

    return config;
}

function uploadTelemetryFile(files) {
    initDomainObjects();
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
    document.getElementById('inputCsv').toggleAttribute('disabled');
    document.getElementById('inputMatrixCsv').toggleAttribute('disabled');

    telemetryObjects = csvToObjArray(csv);

    outputMsg('Telemetry file imported, '
        .concat(telemetryObjects.length.toString())
        .concat(' rows found')
    );

    config = getConfigFromForm();

    // Create the root folder
    folderRoot = new Obj(config.outputBaseName, 'folder', true);
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

    // Create a LAD Table
    let LadTable = new Obj('LAD Table', 'LadTable', true);
    root.addJson(LadTable);
    folderRoot.addToComposition(LadTable.identifier.key);
    LadTable.setLocation(folderRoot);

    for (const telemetryObject of telemetryObjects) {
        const curIndex = telemetryObjects.indexOf(telemetryObject);

        LadTable.addToComposition(telemetryObject.dataSource, getNamespace(telemetryObject.dataSource));

        // If conditions defined for this telemetry parameter, create a Condition Set and add conditions
        if (telemetryObject.cond1.length > 0) {
            const telemObjCondStyles = unpackTelemetryObjectCondStyles(telemetryObject);
            const telemObjStyles = [];
            let cs = new ConditionSet(telemetryObject);
            // console.log('telemObjCondStyles', telemObjCondStyles);

            for (const key in telemObjCondStyles) {
                const condId = cs.addCondition(telemObjCondStyles[key]);

                // Use condId to add a series of styleObjs to a styleObjs array
                telemObjStyles.push(
                    createOpenMCTStyleObj(telemObjCondStyles[key], condId)
                );
            }
            // console.log('cs', cs);
            telemetryObjects[curIndex].cs = cs;
            telemetryObjects[curIndex].objStyles = telemObjStyles;

            root.addJson(cs);
            folderConditionSets.addToComposition(cs.identifier.key);
            cs.setLocation(folderConditionSets);
        }
    }
    console.log('telemetryObjects', telemetryObjects)
}

function createOpenMCTMatrixLayoutJSONfromCSV(csv) {
    document.getElementById('inputMatrixCsv').toggleAttribute('disabled');

    const rowArr = csvToArray(csv);

    // Create a folder to hold Hyperlinks and add it to the root folder
    let folderHyperlinks;

    if (csv.includes('_link')) {
        folderHyperlinks = new Obj('Hyperlinks', 'folder', true);
        root.addJson(folderHyperlinks);
        folderRoot.addToComposition(folderHyperlinks.identifier.key);
        folderHyperlinks.setLocation(folderRoot);
    }

    const arrColWidths = rowArr[0];
    const arrGridMargin = arrColWidths[0].length > 0 ? arrColWidths[0].split(',') : [2, 2, 2];
    const gridDimensions = [
        parseInt(arrGridMargin[0]),
        parseInt(arrGridMargin[1])
    ];
    const itemMargin = parseInt(arrGridMargin[2]);

    // Create a layout for the matrix and add it to the root folder
    let dlMatrix = new DisplayLayout({
        'name': 'DL '.concat(config.outputBaseName),
        'layoutGrid': gridDimensions,
        'itemMargin': itemMargin
    });
    root.addJson(dlMatrix);
    folderRoot.addToComposition(dlMatrix.identifier.key);
    dlMatrix.setLocation(folderRoot);


    let curY = 0;
    let dlItem = {};

    outputMsg('Matrix layout started: '
        .concat(arrColWidths.length.toString())
        .concat(' columns and ')
        .concat(rowArr.length.toString())
        .concat(' rows;')
        .concat(' grid dimensions: ')
        .concat(gridDimensions.join(','))
        .concat(' item margin: ')
        .concat(itemMargin)
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

            const argSeparator = ',';
            let cellArgs;
            let cellArgsArr = [];
            let cellArgsObj = {};

            if (cell.includes(argSeparator)) {
                cellArgs = cell.substring(cell.indexOf(argSeparator) + 1, cell.length);
                cell = cell.substring(0, cell.indexOf(argSeparator)).replaceAll('"', '').trim();
                cellArgsArr = cellArgs.split(argSeparator);
            }

            if (cellArgsArr.length > 0) {
                const spanArg = extractArg(cellArgsArr, '_span');
                if (spanArg) {
                    cellArgsObj.span = parseInt(spanArg);
                    // Span includes the current column, c
                    // Add widths from columns to be spanned to itemW
                    for (let i = c + 1; i < (c + cellArgsObj.span); i++) {
                        itemW += parseInt(arrColWidths[i]) + itemMargin;
                    }
                }

                let linkArg = extractArg(cellArgsArr, '_link');
                if (linkArg) {
                    cellArgsObj.url = linkArg;
                }
            }

            if (cell.startsWith("~")) {
                // If telem, get the corresponding telemetryObject
                const telemetryObject = telemetryObjects.find(e => e.dataSource === cell);

                if (cellArgs) {
                    if (cellArgs.includes('_cw')) {
                        // Create Condition Widget
                        let cw = new ConditionWidget(telemetryObject);
                        root.addJson(cw);
                        folderConditionWidgets.addToComposition(cw.identifier.key);
                        cw.setLocation(folderConditionWidgets);

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
                        outputMsg(' Added Condition Widget: '.concat(telemetryObject.name));
                    }
                } else {
                    // Add as a telemetry view (alphanumeric)
                    dlItem = dlMatrix.addTelemetryView({
                        itemW: itemW,
                        itemH: rowH,
                        x: curX,
                        y: curY,
                        ident: cell.replaceAll('/', '~'),
                        alphaFormat: telemetryObject.alphaFormat,
                        alphaShowsUnit: telemetryObject.alphaShowsUnit
                    });

                    if (telemetryObject.objStyles) {
                        dlMatrix.configuration.objectStyles[dlItem.id].styles = telemetryObject.objStyles;
                        dlMatrix.configuration.objectStyles[dlItem.id].conditionSetIdentifier = createIdentifier(telemetryObject.cs.identifier.key);
                    }

                    dlMatrix.addToComposition(cell, getNamespace(cell));
                    outputMsg(' Added telemetry alphanumeric: '.concat(telemetryObject.name));
                }
            } else if (cell.length > 0) {
                // Add as a text object or a Hyperlink button
                const args = {
                    itemW: itemW,
                    itemH: rowH,
                    x: curX,
                    y: curY,
                    text: restoreEscChars(cell)
                };

                if (cellArgs && cellArgs.includes('_bg')) {
                    const start = cellArgs.indexOf('_bg');
                    args.backgroundColor = cellArgs.substring(start + 4, start + 11);
                }

                if (cellArgs && cellArgs.includes('_fg')) {
                    const start = cellArgs.indexOf('_fg');
                    args.color = cellArgs.substring(start + 4, start + 11);
                }

                if (cellArgs && cellArgs.includes('_link')) {
                    const linkName = restoreEscChars(args.text);
                    let linkBtn = new HyperLink(linkName, {
                        format: 'button',
                        target: '_blank',
                        url: cellArgsObj.url,
                        label: linkName
                    });
                    root.addJson(linkBtn);
                    folderHyperlinks.addToComposition(linkBtn.identifier.key);
                    linkBtn.setLocation(folderHyperlinks);

                    // Add Hyperlink to the layout
                    dlMatrix.addSubObjectViewInPlace({
                        itemW: itemW,
                        itemH: rowH,
                        x: curX,
                        y: curY,
                        ident: linkBtn.identifier.key,
                        hasFrame: false
                    });

                    dlMatrix.addToComposition(linkBtn.identifier.key);
                    outputMsg(' Added link: '.concat(linkName));

                } else {
                    dlItem = dlMatrix.addTextView(args);
                    outputMsg(' Added text: '.concat(args.text));
                }
            }

            curX += colW + itemMargin;
        }

        curY += rowH + itemMargin;
    }

    outputJSON();
    outputMsg('Matrix layout generated');
}

function extractArg(arr, argKey) {
    // expects arr[argKey(value)]
    const argStr = arr.find(
        (elem) => elem.includes(argKey)
    );

    if (argStr) {
        return argStr
            .substring(0, argStr.length - 1) // Get rid of last )
            .split('(')[1]
    }

    return false;
}
