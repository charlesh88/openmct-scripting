/*
DESIGN:
1. Read in single Conditions CSV file and create Condition Sets with conditions; each CS and condition must have unique names.
1. Create a folder to hold the Condition Sets.
1. Read in multiple Layout CSV files. For each file, look at each cell element and create it accordingly.
1. If the cell has a _conds() tag, find the condition by set name using the _condset() tag and condition name in CONDITION_SETS
 */

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
        createConditionSets(values[0]);
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
                    'telemetry': criteriaObj.telemetry.includes('~')?
                        createIdentifier(criteriaObj.telemetry, 'taxonomy') :
                        criteriaObj.telemetry,
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

    config = getConfigFromForm();


    for (const condObject of condObjs) {
        let defCondDefined = false;
        if (!condObject.isDefault) {
            condObject.criteriaArr = replaceCommasInBrackets(
                condObject.criteria, ESC_CHARS.comma)
                .split(',')
                .map(s => convertStringToJSON(s.split(ESC_CHARS.comma).join(','))); // Un-escape protected commas
            // console.log('condObject.criteriaArr',condObject)
        } else {
            defCondDefined = true;
        }

        if (condObject.setName) {
            // setName only needs to be defined once in the csv for each Condition Set to be created
            curSetName = condObject.setName;
        } else if (!curSetName.length > 0) {
            // There's no curSetName and setName has not been defined, abort
            console.error('No setName has been defined');
            return false;
        }

        if (!CONDITION_SETS[curSetName]) {
            CONDITION_SETS[curSetName] = new ConditionSet2(condObject);
            curSetTelemetry = []; // Reset if we're making a new CS this round.
        }

        cs = CONDITION_SETS[curSetName];
        // cs.addCondition(createOpenMCTCondObj2(condObject));
        cs.configuration.conditionCollection.push(
            createOpenMCTCondObj2(condObject)
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
    // console.log('CONDITION_SETS', CONDITION_SETS);
    const csKeys = Object.keys(CONDITION_SETS);

    for (let k = 0; k < csKeys.length; k++) {
        let csHasDefault = false;
        const cs = CONDITION_SETS[csKeys[k]];
        const cColl = cs.configuration.conditionCollection;
        // console.log(csKeys[k], cColl, cColl.length);
        for (const c of cColl) {
            if (c.isDefault === 'TRUE') {
                csHasDefault = true;
            }
            // console.log('c',c, c.isDefault === 'TRUE');
        }

        if (!csHasDefault) {
            // No default condition, so add it.
            cColl.push(createOpenMCTCondObj2({
                name: 'Default',
                isDefault: true,
                output: 'Default'
            }))
        }
    }

    // Create the ROOT folder
    FOLDER_ROOT = new Obj(config.outputBaseName, 'folder', true);

    ROOT.addJson(FOLDER_ROOT);
    OBJ_JSON.rootId = FOLDER_ROOT.identifier.key;

    // Create a folder to hold Conditionals and add it to the ROOT folder
    let folderConditionals;
    folderConditionals = new Obj('Conditionals', 'folder', true);
    ROOT.addJson(folderConditionals);
    FOLDER_ROOT.addToComposition(folderConditionals.identifier.key);
    folderConditionals.setLocation(FOLDER_ROOT);

    const arrCsKeys = Object.keys(CONDITION_SETS);
    for (let i = 0; i < arrCsKeys.length; i++) {
        const curCs = CONDITION_SETS[arrCsKeys[i]];
        ROOT.addJson(curCs);
        folderConditionals.addToComposition(curCs.identifier.key);
        curCs.setLocation(folderConditionals);
    }

    console.log('CONDITION_SETS', CONDITION_SETS);
    console.log('OBJ_JSON',OBJ_JSON);

    return true;
}

function createOpenMCTMatrixLayout(csv) {
    // Toggle the matrix file upload button to disabled
    // document.getElementById('inputMatrixCsv').toggleAttribute('disabled');
    outputMsg(lineSepStr);

    if (!ROOT) {
        initDomainObjects();
    }

    config = getConfigFromForm();

    if (!FOLDER_ROOT) {
        // Create the ROOT folder if not already created
        FOLDER_ROOT = new Obj(config.outputBaseName, 'folder', true);
        ROOT.addJson(FOLDER_ROOT);
        OBJ_JSON.rootId = FOLDER_ROOT.identifier.key;
    }

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
    // console.log('ROOT', ROOT, dlMatrix);

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
                            ident: cObj.telemetryPath.replaceAll('/', '~'),
                            itemH: itemH,
                            itemW: itemW,
                            style: cObj.style, // TODO: make sure undefined is Ok here
                            x: curX,
                            y: curY
                        });

                        dlMatrix.addToComposition(cObj.cellValue, getNamespace(cObj.cellValue));
                        outputMsgArr.push([
                            dlItem.identifier.key,
                            'Alphanumeric'
                        ]);
                        break;
                    case 'cw':
                        // Create as a Condition Widget
                        let cw = new ConditionWidget2(cObj);
                        ROOT.addJson(cw);

                        // TODO: gotta create a folder for Condition Widgets if it doesn't exist yet
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

                        // Add Conditional Styling if present
                        dlMatrix.addObjectStylesForLayoutObj(dlItem.id, cObj);

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

    function unpackCellConditions(condStr) {
        // Will be like {set:CS1},{name:ImgID_200,backgroundColor:#368215,color:#ffffff},{name:Default,border:1px solid #555555}
        // Each condition's name must be unique
        return replaceCommasInBrackets(condStr, ESC_CHARS.comma)
            .split(',')
            .map(s => convertStringToJSON(s.split(ESC_CHARS.comma).join(','))); // Un-escape protected commas
    }


    const matrixCell = {
        'alphaFormat': undefined,
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

    if (matrixCell.cellValue.startsWith('~')) {
        // TODO: refactor this to add path and taxonomy, not lookup in TELEMETRY_OBJECTS
        // matrixCell.telemetryObject = TELEMETRY_OBJECTS.find(e => e.dataSource === matrixCell.cellValue);
        matrixCell.telemetryPath = matrixCell.cellValue;
        matrixCell.alphaFormat = getCellArgValue(arr, 'alphaFormat');
        if (arr.includes('_showUnits')) {
            matrixCell.showUnits = true;
        }
        matrixCell.type = 'alpha';
    }

    if (arr.includes('_cw')) {
        matrixCell.type = 'cw';

        if (arr.includes('_outIsLabel')) {
            matrixCell.useCondOutAsLabel = true;
        }
    } else if (arr.includes('_link')) {
        matrixCell.type = 'link';
    }

    matrixCell.url = getCellArgValue(arr, 'url');

    const span = getCellArgValue(arr, 'span');
    if (span) {
        matrixCell.span = Number(span)
    }

    const rspan = getCellArgValue(arr, 'rspan');
    if (rspan) {
        matrixCell.rspan = Number(rspan)
    }

    const styleConds = getCellArgValue(arr, 'conds');
    if (styleConds) {
        // Expects the first element in the array to be {set: setName}
        const conditionsArr = unpackCellConditions(styleConds);
        matrixCell.styleCondSet = conditionsArr[0].set;
        conditionsArr.shift();
        matrixCell.styleConds = conditionsArr;
        // console.log('matrixCell', matrixCell, matrixCell.styleConds)
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
function getObjectStylesForDomainObj (openMCTDomainObj, argsObj) {
    // Expects openMCTDomainObj will have a configuration.objectStyles {}
    // Adds the CS identifier and a styles [] into that.
    // Returns openMCTDomainObj
    // TODO: consider migrating this to a function of DomainObjects.js Obj() function

}

function getCondSetAndStyles (argsObj) {
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
                stylesArr.push(createOpenMCTStyleObj(argsObj.styleConds[i],openMCTCond.id));
            }
        }

        o.styles = stylesArr;
        return o;
    }

    return undefined;
}

function createOpenMCTCondObj(args) {
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

    const condObj = {};
    condObj.isDefault = args.isDefault;
    condObj.id = createUUID();
    condObj.configuration = {
        'name': args.name,
        'output': args.output,
        'trigger': args.isDefault ? 'all' : args.trigger,
        'criteria': args.isDefault ? [] :
            [{
                'id': createUUID(),
                'telemetry': args.telemetry,
                'operation': args.operation,
                'input': args.input,
                'metadata': args.metadata
            }]
    };
    condObj.summary = args.isDefault ? 'Scripted: default' :
        'Scripted: match if any criteria are met: '
            .concat(args.telemetry)
            .concat(' telemetry ')
            .concat(args.metadata)
            .concat(' ')
            .concat(args.operation)
            .concat(' ')
            .concat(args.input.toString())

    return condObj;
}
