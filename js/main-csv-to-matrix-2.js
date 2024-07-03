const INPUT_TYPE = "csv";
const inputMatrixCsv = document.getElementById("inputMatrixCsv");
const OUTPUT_BASE_NAME_KEY = '_MATRIX_LAYOUT_BASE_NAME';
let CONDITION_SETS = [];
let folderConditionWidgets;

storeOutputBaseName();
loadLocalSettings();
inputConditionCsv.addEventListener("change", function (ev) {
    uploadConditionFile(ev.currentTarget.files);
}, false);

inputMatrixCsv.addEventListener("change", function (ev) {
    uploadMatrixFile2(ev.currentTarget.files, 'csv');
}, false);

function getConfigFromForm() {
    // Get form values
    const config = {};

    config.outputBaseName = document.getElementById('output-base-name').value;

    return config;
}

function uploadConditionFile(files) {
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
        createConditionSetObjs(values[0]);
    });
}

function uploadMatrixFile2(files, fileType) {
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
        createOpenMCTMatrixLayout(values[0]);
    });
}

const ConditionSet2 = function (condSetArgsObj) {
    Obj.call(this, condSetArgsObj.setName, 'conditionSet', true);
    this.configuration = {};
    this.configuration.conditionTestData = [];
    this.configuration.conditionCollection = [];

    this.addCondition = function (condObj) {
        this.configuration.conditionCollection.push(
            createOpenMCTCondObj2(condObj)
        );
    }
}

function createOpenMCTCondObj2(args) {
    /*
    "id": "3fbee1a9-496d-45ed-865e-60f9632a11ec",
    "configuration": {
      "name": "Disabled",
      "output": "Disabled",
      "trigger": "any",
      "criteria": [
        {
          "id": "3f8b53a4-8dc0-4c59-a722-3687dacc70e2",
          "telemetry": "any",
          "operation": "lessThan",
          "input": [
            1
          ],
          "metadata": "value"
        }
      ]
    },
    "summary": "Match if any criteria are met:  any telemetry Value  < 1 "
     */
    const summaryTriggerStrings = {
        'all': 'and',
        'any': 'or'
    }
    const condObj = {};
    condObj.isDefault = args.isDefault;
    condObj.id = createUUID();
    let condSummaryArr = [];



    condObj.configuration = {
        'name': args.name,
        'output': args.output,
        'trigger': args.isDefault ? 'all' : args.trigger,
        'criteria': []
    };

    if (condObj.isDefault) {
        condSummaryArr.push('Scripted default');
    } else {
        for (let i = 0; i < args.criteriaArr.length; i++) {
            const criteriaObj = args.criteriaArr[i];
            const condSummaryStr = criteriaObj.telemetry
                .concat(' ')
                .concat(criteriaObj.metadata)
                .concat(' ')
                .concat(criteriaObj.operation)
                .concat(' ')
                .concat(criteriaObj.input.toString());

            condSummaryArr.push(condSummaryStr);

            condObj.configuration.criteria.push(
                {
                    'id': createUUID(),
                    'telemetry': criteriaObj.telemetry,
                    'operation': criteriaObj.operation,
                    'input': criteriaObj.input,
                    'metadata': criteriaObj.metadata
                }
            )
        }
    }
    condObj.summary = condSummaryArr.join(' ' + summaryTriggerStrings[condObj.configuration.trigger] + ' ');

    return condObj;
}

function createConditionSetObjs(csv) {
    document.getElementById('inputConditionCsv').toggleAttribute('disabled');
    document.getElementById('inputMatrixCsv').toggleAttribute('disabled');

    let cs;

    const condObjs = csvToObjArray(csv);

    outputMsg('Condition file imported, '
        .concat(condObjs.length.toString())
        .concat(' rows found')
    );

    config = getConfigFromForm();

    for (const condObject of condObjs) {
        if (!condObject.isDefault) {
            condObject.criteriaArr = replaceCommasInBrackets(condObject.criteria, ESC_CHARS.comma)
                .split(',')
                .map(s => convertStringToJSON(s.split(ESC_CHARS.comma).join(','))); // Un-escape protected commas
        }

        const setName = condObject.setName;

        if (!CONDITION_SETS[setName]) {
            CONDITION_SETS[setName] = new ConditionSet2(condObject)
        }

        cs = CONDITION_SETS[setName];

        cs.configuration.conditionCollection.push(
            createOpenMCTCondObj2(condObject)
        );
    }

/*
    TODO:
    - [ ] Create Condition Sets folder, add to composition,etc.
*/

    console.log(CONDITION_SETS);

    return cs;
}

function createOpenMCTMatrixLayout(csv) {
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

    // Create a layout for the matrix and add it to the root folder
    let dlMatrix = new DisplayLayout({
        'name': 'DL '.concat(config.outputBaseName),
        'layoutGrid': gridDimensions,
        'itemMargin': itemMargin
    });
    root.addJson(dlMatrix);
    folderRoot.addToComposition(dlMatrix.identifier.key);
    dlMatrix.setLocation(folderRoot);

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

    // Create a folder to hold Hyperlinks and add it to the root folder
    let folderHyperlinks;
    if (csv.includes('_link')) {
        folderHyperlinks = new Obj('Hyperlinks', 'folder', true);
        root.addJson(folderHyperlinks);
        folderRoot.addToComposition(folderHyperlinks.identifier.key);
        folderHyperlinks.setLocation(folderRoot);
    }

    const outputMsgArr = [[
        'Object',
        'Type'
    ]];
    // Iterate through matrix rows
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
                            dlMatrix.configuration.objectStyles[dlItem.id].conditionSetIdentifier = createIdentifier(cObj.telemetryObject.cs.identifier.key);
                        }

                        dlMatrix.addToComposition(cObj.cellValue, getNamespace(cObj.cellValue));
                        outputMsgArr.push([
                            dlItem.identifier.key,
                            'Alphanumeric'
                        ]);
                        break;
                    case 'cw':
                        // Create as a Condition Widget
                        let cw = new ConditionWidget(cObj);
                        root.addJson(cw);
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

                        root.addJson(linkBtn);
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
        'conditions': undefined,
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

    arrIndex = findIndexInArray(arr, '_conditions', false);
    if (arrIndex > -1) {
        const conditionsStr = getStrBetween(arr[arrIndex], '_conditions(', ')')

        // 200,_conditions("ImgID_200":{"style:{"backgroundColor":"#368215","color":"#ffffff"}},"Default":{"border":"1px solid #555555"})
        matrixCell.conditions = stylesFromObj(
            convertStringToJSON(getStrBetween(arr[arrIndex], '_conditions(', ')')),
            STYLES_DEFAULTS);
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
