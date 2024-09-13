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

    TELEMETRY_OBJECTS = csvToObjArray(csv);

    outputMsg('Telemetry file imported, '
        .concat(TELEMETRY_OBJECTS.length.toString())
        .concat(' rows found')
    );

    config = getConfigFromForm();

    // Create the ROOT folder
    FOLDER_ROOT = new Obj(config.outputBaseName, 'folder', true);
    ROOT.addJson(FOLDER_ROOT);
    OBJ_JSON.rootId = FOLDER_ROOT.identifier.key;

    // Create a folder to hold Condition Sets and add it to the ROOT folder
    let folderConditionSets = new Obj('Condition Sets', 'folder', true);
    ROOT.addJson(folderConditionSets);
    FOLDER_ROOT.addToComposition(folderConditionSets.identifier.key);
    folderConditionSets.setLocation(FOLDER_ROOT);

    // Create a folder to hold Condition Widgets and add it to the ROOT folder
    folderConditionWidgets = new Obj('Condition Widgets', 'folder', true);
    ROOT.addJson(folderConditionWidgets);
    FOLDER_ROOT.addToComposition(folderConditionWidgets.identifier.key);
    folderConditionWidgets.setLocation(FOLDER_ROOT);

    // Create a LAD Table
    let LadTable = new Obj('LAD Table', 'LadTable', true);
    ROOT.addJson(LadTable);
    FOLDER_ROOT.addToComposition(LadTable.identifier.key);
    LadTable.setLocation(FOLDER_ROOT);

    for (const telemetryObject of TELEMETRY_OBJECTS) {
        const curIndex = TELEMETRY_OBJECTS.indexOf(telemetryObject);

        LadTable.addToComposition(telemetryObject.dataSource, getNamespace(telemetryObject.dataSource));

        // Allow static styling to be defined in the telemetry file.
        // Will be overridden by styling in the matrix file, if present.
        if (telemetryObject.alphaStyle.length > 0) {
            telemetryObject.alphaStyle = stylesFromObj(convertStringToJSON(telemetryObject.alphaStyle), STYLES_DEFAULTS);
        }

        // If conditions defined for this telemetry parameter, create a Condition Set and add conditions
        if (telemetryObject.cond1.length > 0) {
            const telemObjCondStyles = unpackTelemetryObjectCondStyles(telemetryObject);
            const telemObjStyles = [];
            let cs = new ConditionSet(telemetryObject);

            for (const key in telemObjCondStyles) {
                const condId = cs.addCondition(telemObjCondStyles[key]);

                // Use condId to add a series of styleObjs to a styleObjs array
                telemObjStyles.push(
                    createOpenMCTStyleObj(telemObjCondStyles[key], condId)
                );
            }

            TELEMETRY_OBJECTS[curIndex].cs = cs;
            TELEMETRY_OBJECTS[curIndex].objStyles = telemObjStyles;
            ROOT.addJson(cs);
            folderConditionSets.addToComposition(cs.identifier.key);
            cs.setLocation(folderConditionSets);
        }
    }
    console.log('TELEMETRY_OBJECTS', TELEMETRY_OBJECTS);
}

function createOpenMCTMatrixLayoutJSONfromCSV(csv) {
    // Toggle the matrix file upload button to disabled
    document.getElementById('inputMatrixCsv').toggleAttribute('disabled');
    outputMsg(lineSepStr);

    const rowArr = csvToArray(csv);

    let curY = 0;
    let dlItem = {};
    const arrColWidths = rowArr[0];
    const arrColHeights = [];
    for (let r = 0; r < rowArr.length; r++) {
        arrColHeights.push(rowArr[r][0]);
    }

    const arrGridMargin = arrColWidths[0].length > 0 ? arrColWidths[0].split(',') : [2, 2, 2];
    const gridDimensions = [
        parseInt(arrGridMargin[0]),
        parseInt(arrGridMargin[1])
    ];
    const itemMargin = parseInt(arrGridMargin[2]);

    // Create a layout for the matrix and add it to the ROOT folder
    let dlMatrix = new DisplayLayout({
        'name': 'DL '.concat(config.outputBaseName),
        'layoutGrid': gridDimensions,
        'itemMargin': itemMargin
    });
    ROOT.addJson(dlMatrix);
    FOLDER_ROOT.addToComposition(dlMatrix.identifier.key);
    dlMatrix.setLocation(FOLDER_ROOT);

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

    // Create a folder to hold Hyperlinks and add it to the ROOT folder
    let folderHyperlinks;
    if (csv.includes('_link')) {
        folderHyperlinks = new Obj('Hyperlinks', 'folder', true);
        ROOT.addJson(folderHyperlinks);
        FOLDER_ROOT.addToComposition(folderHyperlinks.identifier.key);
        folderHyperlinks.setLocation(FOLDER_ROOT);
    }

    const outputMsgArr = [[
        'Object',
        'Type'
    ]];
    // Iterate through telemetry collection
    for (let r = 1; r < rowArr.length; r++) {
        const row = rowArr[r];
        const rowH = parseInt(row[0]);
        let curX = 0;

        // Iterate through row cells
        for (let c = 1; c < row.length; c++) {
            // Process each cell in the matrix
            const cObj = unpackCell(row[c].trim());

            const colW = parseInt(arrColWidths[c]);
            let itemW = colW;
            let itemH = rowH;

            if (cObj.span) {
                // Span includes the current column, c
                // Add widths from columns to be spanned to itemW
                for (let i = c + 1; i < (c + parseInt(cObj.span)); i++) {
                    itemW += parseInt(arrColWidths[i]) + itemMargin;
                }
            }

            if (cObj.rspan) {
                for (let i = c + 1; i < (c + parseInt(cObj.rspan)); i++) {
                    itemH += parseInt(arrColHeights[i]) + itemMargin;
                }

            }

            if (cObj.cellValue.length > 0) {
                // console.log('- > ',cObj.cellValue, cObj);
                switch (cObj.type) {
                    case 'alpha':
                        // Create as an alphanumeric
                        dlItem = dlMatrix.addTelemetryView({
                            alphaFormat: cObj.telemetryObject.alphaFormat,
                            alphaShowsUnit: cObj.telemetryObject.alphaShowsUnit,
                            ident: cObj.cellValue.replaceAll('/', '~'),
                            itemH: itemH,
                            itemW: itemW,
                            style: (cObj.style) ? cObj.style : cObj.telemetryObject.alphaStyle,
                            x: curX,
                            y: curY
                        });

                        if (cObj.telemetryObject.objStyles && cObj.telemetryObject.alphaUsesCond === 'TRUE') {
                            dlMatrix.configuration.objectStyles[dlItem.id].styles = cObj.telemetryObject.objStyles;
                            dlMatrix.configuration.objectStyles[dlItem.id].conditionSetIdentifier = createOpenMCTIdentifier(cObj.telemetryObject.cs.identifier.key);
                        }

                        dlMatrix.addToComposition(cObj.cellValue, getNamespace(cObj.cellValue));
                        outputMsgArr.push([
                            dlItem.identifier.key,
                            'Alphanumeric'
                        ]);
                        break;
                    case 'cw':
                        // Create as a Condition Widget
                        let cw = new ConditionWidgetDeprecated(cObj);
                        ROOT.addJson(cw);
                        folderConditionWidgets.addToComposition(cw.identifier.key);
                        cw.setLocation(folderConditionWidgets);

                        // Add Condition Widget to the layout
                        dlMatrix.addSubObjectViewInPlace({
                            itemW: itemW,
                            itemH: itemH,
                            x: curX,
                            y: curY,
                            ident: cw.identifier.key,
                            hasFrame: false
                        });

                        dlMatrix.addToComposition(cw.identifier.key);
                        outputMsgArr.push([
                            cw.label,
                            'Condition Widget'
                        ]);
                        break;
                    case 'link':
                        // Create as a Link
                        // TODO: make sure link objects are being created and styled properly
                        const text = restoreEscChars(cObj.cellValue);
                        let linkBtn = new HyperLink(text, {
                            format: 'button',
                            target: '_blank',
                            url: cObj.url,
                            label: text
                        });

                        ROOT.addJson(linkBtn);
                        folderHyperlinks.addToComposition(linkBtn.identifier.key);
                        linkBtn.setLocation(folderHyperlinks);

                        // Add Hyperlink to the layout
                        dlMatrix.addSubObjectViewInPlace({
                            itemW: itemW,
                            itemH: itemH,
                            x: curX,
                            y: curY,
                            ident: linkBtn.identifier.key,
                            hasFrame: false
                        });

                        dlMatrix.addToComposition(linkBtn.identifier.key);
                        outputMsgArr.push([
                            linkBtn.label,
                            'Link'
                        ]);
                        break;
                    default:
                        // Create as a text object
                        dlItem = dlMatrix.addTextView({
                            itemW: itemW,
                            itemH: itemH,
                            style: cObj.style,
                            text: restoreEscChars(cObj.cellValue),
                            x: curX,
                            y: curY
                        });
                        outputMsgArr.push([
                            dlItem.text,
                            'Text'
                        ]);
                }
            }

            curX += colW + itemMargin;
        }

        curY += rowH + itemMargin;
    }

    outputMsg(htmlGridFromArray(outputMsgArr));

    outputJSON();
    outputMsg('Matrix layout generated');
}

function unpackCell(strCell) {
    const matrixCell = {
        'rspan': undefined,
        'type': 'text',
        'span': undefined,
        'style': undefined,
        'url': undefined
    }

    // Look for `,_` as a pattern to use for split
    const a = strCell.split(',_');
    // The cell's 'value' will always be the first part of the array
    matrixCell.cellValue = a.shift();
    // Restore underbar character that was removed by split
    const arr = a.map(val => {
        return '_'.concat(val)
    });

    if (matrixCell.cellValue.startsWith('~')) {
        matrixCell.telemetryObject = TELEMETRY_OBJECTS.find(e => e.dataSource === matrixCell.cellValue);
        matrixCell.type = 'alpha';
    }

    if (arr.includes('_cw')) {
        matrixCell.type = 'cw';
    }

    let arrIndex = findIndexInArray(arr, '_span', false);
    if (arrIndex > -1) {
        matrixCell.span = Number(getStrBetween(arr[arrIndex], '_span(', ')'));
    }

    arrIndex = findIndexInArray(arr, '_rspan', false);
    if (arrIndex > -1) {
        // console.log('has rspan');
        matrixCell.rspan = Number(getStrBetween(arr[arrIndex], '_rspan(', ')'));
    }

    arrIndex = findIndexInArray(arr, '_style', false);
    if (arrIndex > -1) {
        matrixCell.style = stylesFromObj(
            convertStringToJSON(getStrBetween(arr[arrIndex], '_style(', ')')),
            STYLES_DEFAULTS);
    }

    arrIndex = findIndexInArray(arr, '_link', false);
    if (arrIndex > -1) {
        matrixCell.type = 'link';
    }

    // Capture URLs which can be applied to both Hyperlinks and Condition Widgets
    arrIndex = findIndexInArray(arr, '_url', false);
    if (arrIndex > -1) {
        matrixCell.url = getStrBetween(arr[arrIndex], '_url(', ')');
    }

    return matrixCell;
}
