/*
DESIGN:
1. Read in single Conditions CSV file and create Condition Sets with conditions; each CS and condition must have unique names.
1. Create a folder to hold the Condition Sets.
1. Read in multiple Layout CSV files. For each file, look at each cell element and create it accordingly.
1. If the cell has a _conds() tag, find the condition by set name using the _condset() tag and condition name in CONDITION_SETS
 */

/* TODOs
- [ ] Allow a _format() flag to include a printf statement for alphanumerics in the layout file.
- [ ] Change _span and _rspan to use a single flag _span({col:3}) or _span({col:2,row:2})
 */
const INPUT_TYPE = "csv";
const inputMatrixCsv = document.getElementById("inputMatrixCsv");
const OUTPUT_BASE_NAME_KEY = '_MATRIX_LAYOUT_BASE_NAME';
let CONDITION_SETS = [];
let CONFIG_MATRIX;

storeOutputBaseName();
loadLocalSettings();
inputConditionCsv.addEventListener("change", function (ev) {
    uploadConditionFile(ev.currentTarget.files);
}, false);

inputMatrixCsv.addEventListener("change", function (ev) {
    uploadMatrixFiles(ev.currentTarget.files, 'csv');
}, false);

function getConfigFromForm() {
    // Get form values
    return {
        outputBaseName: document.getElementById('output-base-name').value
    };
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
        createConditionSets(values[0]);
    });
}

function uploadMatrixFiles(files, fileType) {
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
        createOpenMCTMatrixLayouts(filenames, values);
    });
}

function createConditionSets(csv) {
    let curSetName = '';
    let curSetTelemetry = [];
    let cs;

    // condObjs is an array of short-handed conditions, in one or more condition sets
    const condObjs = csvToObjArray(csv);

    outputMsg('Condition file imported, '
        .concat(condObjs.length.toString())
        .concat(' rows found')
    );

    CONFIG_MATRIX = getConfigFromForm();

    for (const condObject of condObjs) {
        let defCondDefined = false;
        if (!condObject.isDefault) {
            condObject.criteriaArr = replaceCommasInBrackets(
                condObject.criteria, ESC_CHARS.comma)
                .split(',')
                .map(s => convertStringToJSON(s.split(ESC_CHARS.comma).join(','))); // Un-escape protected commas
        } else {
            defCondDefined = true;
        }

        if (condObject.setName) {
            // setName only needs to be defined once in the csv for each Condition Set to be created
            curSetName = condObject.setName;
        } else if (!curSetName.length > 0) {
            // There's no curSetName and setName has not been defined, abort
            console.error('No setName has been defined',condObject);
            return false;
        }

        if (!CONDITION_SETS[curSetName]) {
            CONDITION_SETS[curSetName] = new ConditionSet(condObject);
            curSetTelemetry = []; // Reset if we're making a new CS this round.
        }

        cs = CONDITION_SETS[curSetName];
        cs.configuration.conditionCollection.push(
            createOpenMCTCondObj(condObject)
        );

        if (condObject.setTelemetry) {
            // Telemetry has been defined in the .csv file for the current Condition Set
            const arrSetTelem = (condObject.setTelemetry.split(','));
            for (const telem of arrSetTelem) {
                if (!curSetTelemetry.includes(telem)) {
                    // If setTelemetry hasn't been added to the set's composition, do it.
                    curSetTelemetry.push(telem);
                    cs.addToComposition(telem, "taxonomy");
                }
            }
        }
    }

    // Look through all created Condition Sets and make sure they have a default condition.
    // If not, add one.
    const csKeys = Object.keys(CONDITION_SETS);

    for (let k = 0; k < csKeys.length; k++) {
        let csHasDefault = false;
        const cs = CONDITION_SETS[csKeys[k]];
        const cColl = cs.configuration.conditionCollection;
        for (const c of cColl) {
            if (c.isDefault === 'TRUE') {
                csHasDefault = true;
            }
        }

        if (!csHasDefault) {
            // No default condition, so add it.
            cColl.push(createOpenMCTCondObj({
                name: 'Default',
                isDefault: true,
                output: 'Default'
            }))
        }
    }

    // Create the ROOT folder
    FOLDER_ROOT = new Obj(CONFIG_MATRIX.outputBaseName, 'folder', true);

    ROOT.addJson(FOLDER_ROOT);
    OBJ_JSON.rootId = FOLDER_ROOT.identifier.key;

    // Create a folder to hold Conditionals and add it to the ROOT folder
    let folderConditionSets;
    folderConditionSets = new Obj('Condition Sets', 'folder', true);
    ROOT.addJson(folderConditionSets);
    FOLDER_ROOT.addToComposition(folderConditionSets.identifier.key);
    folderConditionSets.setLocation(FOLDER_ROOT);

    const arrCsKeys = Object.keys(CONDITION_SETS);
    for (let i = 0; i < arrCsKeys.length; i++) {
        const curCs = CONDITION_SETS[arrCsKeys[i]];
        ROOT.addJson(curCs);
        folderConditionSets.addToComposition(curCs.identifier.key);
        curCs.setLocation(folderConditionSets);
    }

    console.log('CONDITION_SETS', CONDITION_SETS);
    console.log('OBJ_JSON', OBJ_JSON);
    config = CONFIG_MATRIX;

    return true;
}

function createOpenMCTMatrixLayouts(filenames, values) {
    let folderConditionWidgets;
    let folderHyperlinks;
    let folderDisplayLayouts;
    let tabsView;

    if (!ROOT) {
        initDomainObjects();
    }

    if (!CONFIG_MATRIX) {
        CONFIG_MATRIX = getConfigFromForm();
    }

    if (!FOLDER_ROOT) {
        // Create the ROOT folder if not already created by Condition Sets
        FOLDER_ROOT = new Obj(CONFIG_MATRIX.outputBaseName, 'folder', true);
        ROOT.addJson(FOLDER_ROOT);
        OBJ_JSON.rootId = FOLDER_ROOT.identifier.key;
    }

    if (filenames.length > 1) {
        // If more than one layout file, create a folder and a Tabs View to contain the layouts.
        folderDisplayLayouts = new Obj('Display Layouts','folder',true);
        addDomainObject(folderDisplayLayouts,FOLDER_ROOT);

        tabsView = new TabsView(CONFIG_MATRIX.outputBaseName, false);
        addDomainObject(tabsView,FOLDER_ROOT);
    }

    // ITERATE THROUGH LAYOUT FILES
    for (let i = 0; i < filenames.length; i++) {
        const rowArr = csvToArray(values[i]);
        const layoutName = filenames[i].toString().replaceAll('.csv','');

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
            'name': layoutName,
            'layoutGrid': gridDimensions,
            'itemMargin': itemMargin
        });

        if (tabsView) {
            addDomainObject(dlMatrix,folderDisplayLayouts);
            tabsView.addToComposition(dlMatrix.identifier.key);
        } else {
            addDomainObject(dlMatrix,FOLDER_ROOT);
        }

        outputMsg(lineSepStr);
        outputMsg('Matrix layout started for '.concat(layoutName));
        outputMsg(arrColWidths.length.toString()
            .concat(' columns and ')
            .concat(rowArr.length.toString())
            .concat(' rows;')
            .concat(' grid dimensions: ')
            .concat(gridDimensions.join(','))
            .concat(' item margin: ')
            .concat(itemMargin)
        );

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
                    // console.log('----> cObj', cObj.cellValue, cObj);

                    switch (cObj.type) {
                        case 'alpha':
                            // Create as an alphanumeric
                            dlItem = dlMatrix.addTelemetryView({
                                alphaFormat: cObj.alphaFormat,
                                alphaShowsUnit: cObj.showUnits,
                                ident: cObj.telemetryPath,
                                itemH: itemH,
                                itemW: itemW,
                                style: cObj.style,
                                x: curX,
                                y: curY
                            });

                            dlMatrix.addToComposition(cObj.cellValue, getNamespace(cObj.cellValue));

                            // Add Conditional Styling if present
                            dlMatrix.addCondStylesForLayoutObj(dlItem.id, cObj);

                            outputMsgArr.push([
                                dlItem.identifier.key,
                                'Alphanumeric'
                            ]);
                            break;
                        case 'cw':
                            // Create as a Condition Widget

                            // Create a folder for Condition Widgets if it doesn't exist
                            if (!folderConditionWidgets) {
                                folderConditionWidgets = new Obj('Condition Widgets', 'folder', true);
                                addDomainObject(folderConditionWidgets,FOLDER_ROOT);
                            }

                            let cw = new ConditionWidget(cObj);
                            addDomainObject(cw,folderConditionWidgets);

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
                            // TODO: MAKE THIS WORK
                            const text = restoreEscChars(cObj.cellValue);
                            let linkBtn = new HyperLink(text, {
                                format: 'button',
                                target: '_blank',
                                url: cObj.url,
                                label: text
                            });

                            // Create a folder to hold Hyperlinks and add it to the ROOT folder
                            if (!folderHyperlinks) {
                                folderHyperlinks = new Obj('Hyperlinks', 'folder', true);
                                ROOT.addJson(folderHyperlinks);
                                FOLDER_ROOT.addToComposition(folderHyperlinks.identifier.key);
                                folderHyperlinks.setLocation(FOLDER_ROOT);
                            }

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

                            // Add Conditional Styling if present
                            dlMatrix.addCondStylesForLayoutObj(dlItem.id, cObj);

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
    }

    outputJSON();
    outputMsg('Matrix layouts generated');
    config = CONFIG_MATRIX;
}

function unpackCell(strCell) {
    function getCellArgValue(arr, argToFind) {
        // argToFind like 'span', 'rspan', etc.
        const arrIndex = findIndexInArray(arr, argToFind, false);
        if (arrIndex > -1) {
            return getStrBetween(
                arr[arrIndex],
                '_'.concat(argToFind).concat('('), ')'
            )
        }

        return undefined;
    }

    function unpackCellArgObj(objStr) {
        // Will be like {setName:CS1},{condName:ImgID_200,backgroundColor:#368215,color:#ffffff},{condName:Default,border:1px solid #555555}
        // Returns an array of objects
        return replaceCommasInBrackets(objStr, ESC_CHARS.comma)
            .split(',')
            .map(s => convertStringToJSON(s.split(ESC_CHARS.comma).join(','))); // Un-escape protected commas
    }

    const matrixCell = {
        'alphaFormat': undefined,
        'cw': undefined,
        'name': undefined,
        'styleCondSet': undefined,
        'styleConds': undefined,
        'rspan': undefined,
        'showUnits': undefined,
        'span': undefined,
        'style': undefined,
        'telemetryPath': undefined,
        'useCondOutAsLabel': undefined,
        'type': 'text',
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

    if (matrixCell.cellValue.startsWith('/')) {
        matrixCell.telemetryPath = matrixCell.cellValue
        matrixCell.alphaFormat = getCellArgValue(arr, 'alphaFormat');
        if (arr.includes('_showUnits')) {
            matrixCell.showUnits = true;
        }
        matrixCell.type = 'alpha';
    }

    const cw = getCellArgValue(arr, 'cw');
    if (cw) {
        const cwProps = unpackCellArgObj(cw)[0];
        matrixCell.name = matrixCell.cellValue;
        matrixCell.type = 'cw'
        matrixCell.useCondOutAsLabel = cwProps.useCondOutput;
        matrixCell.url = cwProps.url;
        console.log('matrixCell', matrixCell);
    }

    // TODO: ADD FUNCTIONALITY FOR HYPERLINKS
    //     matrixCell.type = 'link';

    const span = getCellArgValue(arr, 'span');
    if (span) {
        matrixCell.span = Number(span)
    }

    const rspan = getCellArgValue(arr, 'rspan');
    if (rspan) {
        matrixCell.rspan = Number(rspan)
    }

    const styleConds = getCellArgValue(arr, 'conditions');
    if (styleConds) {
        // Expects the first element in the array to be {setName:<string>}
        const conditionsArr = unpackCellArgObj(styleConds);
        matrixCell.styleCondSet = conditionsArr[0].setName;
        conditionsArr.shift();
        matrixCell.styleConds = conditionsArr;
        console.log('styleConds',matrixCell);
    }

    const style = getCellArgValue(arr, 'style');
    if (style) {
        matrixCell.style = stylesFromObj(
            convertStringToJSON(style),
            STYLES_DEFAULTS);
    }

    return matrixCell;
}

/**************************************** CONDITIONAL STYLING */
function getCondSetAndStyles(argsObj) {
    /*
    Creates a styles [] from argsObj, which is a passed in instance of cObj
    argsObj:
        styleCondSet: name of Condition Set
        styleConds: array of objects with condition names and style arguments
    1. Get the ref'd CS by looking it up in CONDITION_SETS by name.
    1. Iterate through named conditions in styleConds and create conditional styles accordingly.
    1. Return an obj with a conditionSetIdentifier value and a styles []. Recipient will have to decode and use.
     */
    const o = {};

    const openMCTCondSet = CONDITION_SETS[argsObj.styleCondSet];
    if (openMCTCondSet) {
        o.conditionSetIdentifier = openMCTCondSet.identifier.key;

        // Iterate through the named conditions and styles in argsObj.styleConds and formulate a
        // valid styles []
        const stylesArr = [];
        const conditionCollection = openMCTCondSet.configuration.conditionCollection;
        for (let i = 0; i < argsObj.styleConds.length; i++) {
            const styleCondName = argsObj.styleConds[i].name;
            // Look for a matching condition in conditionCollection [].configuration.name;
            // Get the resulting [].configuration.id
            const openMCTCond = searchArrayOfObjects(conditionCollection, 'configuration.name', styleCondName);
            if (openMCTCond) {
                // console.log('openMCTCond',openMCTCond);
                stylesArr.push(createOpenMCTStyleObj(argsObj.styleConds[i], openMCTCond.id));
            }
        }

        o.styles = stylesArr;
        return o;
    }

    return undefined;
}
