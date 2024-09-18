const INPUT_TYPE = "prl";
const OUTPUT_BASE_NAME_KEY = '_PRL_TO_DISPLAYS_BASE_NAME';
const STEP_LABEL_STYLE = {
    backgroundColor: '#555555',
    color: '#cccccc'
}

storeOutputBaseName();
loadLocalSettings();

inputPRL.addEventListener("change", function (ev) {
    initDomainObjects();
    uploadFiles(ev.currentTarget.files, 'prl');
}, false);

function getConfigFromForm() {
    // Get form values
    const config = {};

    config.outputBaseName = document.getElementById('output-base-name').value;
    config.layoutGrid = document.getElementById('layoutGrid').value.split(',');
    config.itemMargin = getFormNumericVal('itemMargin');

    config.dlAlphas = {};
    config.dlAlphas.itemW = getFormNumericVal('alphaLayoutItemWidth');
    config.dlAlphas.itemH = getFormNumericVal('alphaLayoutItemHeight');

    return config;
}

/*********************************** MULTIPLE FILE HANDLING */
processPrlFiles = function (filenames, values) {
    let arrAllProcsAndTelem = [];
    const outputMsgArr = [[
        'Procedure File',
        'Non-unique Telem'
    ]];
    let responseObj = {};


    for (let i = 0; i < filenames.length; i++) {
        const arrStepsAndTelem = extractFromPrlTraverse(values[i], filenames[i]);

        outputMsgArr.push([
            filenames[i],
            arrStepsAndTelem.length
        ]);

        let consolidatedTelemByStep = [];
        let longestLabelCharCnt = 0;

        if (arrStepsAndTelem && arrStepsAndTelem.length > 0) {
            for (let j = 0; j < arrStepsAndTelem.length; j++) {
                const curStep = arrStepsAndTelem[j];
                // console.log('curStep',curStep);
                const curStepNumber = curStep.number.toString();
                if (!Object.keys(consolidatedTelemByStep).includes(curStepNumber)) {
                    consolidatedTelemByStep[curStepNumber] = {
                        'paths': [],
                        'pathsShort': []
                    };
                }
                if (curStep.pathShort.length > longestLabelCharCnt) {
                    longestLabelCharCnt = curStep.pathShort.length;
                }
                consolidatedTelemByStep[curStepNumber].paths.push(curStep.path);
                consolidatedTelemByStep[curStepNumber].pathsShort.push(curStep.pathShort);
                consolidatedTelemByStep[curStepNumber].crewMembers = curStep.crewMembers;
                consolidatedTelemByStep[curStepNumber].refType = curStep.refType;
            }

            arrAllProcsAndTelem[filenames[i]] = {
                'steps': consolidatedTelemByStep,
                'longestLabelCharCnt': longestLabelCharCnt
            };
        }
    }

    outputMsg(htmlGridFromArray(outputMsgArr));

    const procKeys = Object.keys(arrAllProcsAndTelem);

    if (procKeys && procKeys.length > 0) {
        initDomainObjects();
        config = getConfigFromForm();

        // Create the ROOT folder
        let FOLDER_ROOT = new Obj(config.outputBaseName, 'folder', true);
        ROOT.addJson(FOLDER_ROOT);
        OBJ_JSON.rootId = FOLDER_ROOT.identifier.key;

        // Create a Display Layouts folder
        let folderDL = new Obj('Display Layouts', 'folder', true);
        addDomainObject(folderDL, FOLDER_ROOT);

        // Create a Stacked Plots folder
        let folderSP = new Obj('Stacked Plots', 'folder', true);
        addDomainObject(folderSP, FOLDER_ROOT);

        // Create a Tabs view for Display Layouts
        let tabsDL = new TabsView('Procedure Displays', false);
        addDomainObject(tabsDL, FOLDER_ROOT);

        // Create a Tabs view for Stacked Plots
        let tabsSP = new TabsView('Procedure Stacked Plots', false);
        addDomainObject(tabsSP, FOLDER_ROOT);

        for (let i = 0; i < procKeys.length; i++) {
            // Make a Display Layout for the current proc
            const procName = procKeys[i];
            const procNameShort = getProcShortName(procName);
            const curProcObj = arrAllProcsAndTelem[procName];
            const curProcObjSteps = curProcObj.steps; // Array of objects, keyed by step number
            const stepKeys = Object.keys(curProcObjSteps);
            let uniqueTelemPaths = [];

            //Create a Display Layout for alphas and add it to the ROOT folder
            let procDisplayLayout = new DisplayLayout({
                'name': procNameShort,
                'layoutGrid': [parseInt(config.layoutGrid[0]), parseInt(config.layoutGrid[1])],
                'itemMargin': config.itemMargin
            });

            initLayoutItemPlacement();

            // Per-step context starts here. Note that a telemetry path can be present more than once in a proc.
            for (let s = 0; s < stepKeys.length; s++) {
                // Iterate through each step object
                const curStepObj = curProcObjSteps[stepKeys[s]];
                // console.log('curStepObj',curStepObj);

                const curIndex = s;
                const labelWidth = labelWidthFromChars(
                    parseInt(config.layoutGrid[0]),
                    curProcObj.longestLabelCharCnt
                );

                // Make a header that combines the step number and crewMembers
                let dlItem = procDisplayLayout.addLabel(
                    {
                        style: {
                            backgroundColor: STEP_LABEL_STYLE.backgroundColor,
                            color: STEP_LABEL_STYLE.color
                        },
                        index: curIndex,
                        itemW: labelWidth + config.itemMargin + config.dlAlphas.itemW,
                        itemH: config.dlAlphas.itemH,
                        ident: stepKeys[s],
                        layoutStrategy: config.dlAlphas.layoutStrategy,
                        layoutStrategyNum: config.dlAlphas.layoutStrategyNum,
                        placeIndex: DL_ITEM_PLACEMENT.placeIndex,
                        shiftIndex: DL_ITEM_PLACEMENT.shiftIndex,
                        text: stepKeys[s].concat(' ').concat(curStepObj.crewMembers)
                    }
                );

                DL_ITEM_PLACEMENT.placeIndex = dlItem.placeIndex;
                DL_ITEM_PLACEMENT.shiftIndex = dlItem.shiftIndex;

                // Iterate through the pathsShort array and make label and alpha pairs for each
                for (let p = 0; p < curStepObj.paths.length; p++) {
                    const curStepPath = curStepObj.paths[p].replaceAll('/', '~');

                    dlItem = procDisplayLayout.addTextAndAlphaViewPair({
                        alphaFormat: config.dlAlphas.alphaFormat,
                        alphaShowsUnit: true,
                        index: curIndex,
                        itemW: config.dlAlphas.itemW,
                        itemH: config.dlAlphas.itemH,
                        ident: curStepPath,
                        labelW: labelWidth,
                        layoutStrategy: config.dlAlphas.layoutStrategy,
                        layoutStrategyNum: config.dlAlphas.layoutStrategyNum,
                        placeIndex: DL_ITEM_PLACEMENT.placeIndex,
                        shiftIndex: DL_ITEM_PLACEMENT.shiftIndex,
                        text: curStepObj.pathsShort[p]
                    });

                    procDisplayLayout.addToComposition(curStepPath, getNamespace(curStepPath));
                    if (!uniqueTelemPaths.includes(curStepPath)) {
                        uniqueTelemPaths.push(curStepPath);
                    }
                    // procStackedPlot.addToComposition(prlObject.dataSource, getNamespace(prlObject.dataSource));
                    DL_ITEM_PLACEMENT.placeIndex = dlItem.placeIndex;
                    DL_ITEM_PLACEMENT.shiftIndex = dlItem.shiftIndex;
                }
            } // Closes steps context

            // Add the proc's Display Layout
            addDomainObject(procDisplayLayout, folderDL);
            tabsDL.addToComposition(procDisplayLayout.identifier.key);

            //Create a Stacked Plot for telemetry
            let procStackedPlot = new StackedPlot(procNameShort);
            uniqueTelemPaths.map(p => {
                procStackedPlot.addToComposition(p, getNamespace(p));
            });

            // Add the proc's Stacked Plot
            addDomainObject(procStackedPlot, folderSP);
            tabsSP.addToComposition(procStackedPlot.identifier.key);
        } // Closes single procedure context
    }

    outputJSON();
}

createTableObj = function (type, str, referenceType) {
    let tableObj = {};
    tableObj.alphaFormat = '';
    tableObj.alphaShowsUnit = 'TRUE';
    tableObj.alphaUsesCond = '';

    if (type.includes('label')) {
        tableObj.name = str;
        tableObj.type = 'label';
        tableObj.dataSource = '';
    }

    if (type.includes('path')) {
        tableObj.name = nameFromPath(str, '/', 2);
        tableObj.dataSource = str.replaceAll('/', '~');
        tableObj.type = 'telemetry';
        tableObj.referenceType = referenceType;
    }

    return tableObj;
}

nameFromPath = function (str, delim, places) {
    // 'places' counts backwards from the end of the path
    const pathArr = str.split(delim);
    let name = '';

    for (let i = pathArr.length - places; i < pathArr.length; i++) {
        name = name.concat(pathArr[i] + ' ');
    }

    return name.trim();
}

