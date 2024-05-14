const INPUT_TYPE = "prl";
const OUTPUT_BASE_NAME_KEY = '_PRL_TO_DISPLAYS_BASE_NAME';
const STEP_LABEL_STYLE = {
    bgColor: '#555',
    fgColor: '#ccc'
}

let globalArrUniquePaths = [];

storeOutputBaseName();
loadLocalSettings();

inputPRL.addEventListener("change", function (ev) {
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
    let responseObj = {};


    for (let i = 0; i < filenames.length; i++) {
        const arrStepsAndTelem = extractFromPrlTraverse(values[i], filenames[i]);

        outputMsg(filenames[i] + ' has ' + arrStepsAndTelem.length + ' telem ref(s)');

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

    console.log('arrAllProcsAndTelem', arrAllProcsAndTelem);

    const procKeys = Object.keys(arrAllProcsAndTelem);

    if (procKeys && procKeys.length > 0) {
        initDomainObjects();
        config = getConfigFromForm();
        let root = objJson.openmct = new Container();

        // Clear out the outputMsgs display
        outputMsgText.innerHTML = '';

        // Create the root folder
        let folderRoot = new Obj(config.outputBaseName, 'folder', true);
        root.addJson(folderRoot);
        objJson.rootId = folderRoot.identifier.key;

        // Create a Display Layouts folder
        let folderDL = new Obj('Display Layouts', 'folder', true);
        root.addJson(folderDL);
        folderRoot.addToComposition(folderDL.identifier.key);
        folderDL.setLocation(folderRoot);

        // Create a Stacked Plots folder
        let folderSP = new Obj('Stacked Plots', 'folder', true);
        root.addJson(folderSP);
        folderRoot.addToComposition(folderSP.identifier.key);
        folderSP.setLocation(folderRoot);

        // Create a Tabs view
        let procTabs = new TabsView('Procedure Displays');
        root.addJson(procTabs);
        folderRoot.addToComposition(procTabs.identifier.key);
        procTabs.setLocation(folderRoot);

        for (let i = 0; i < procKeys.length; i++) {
            // Make a Display Layout for the current proc
            const procName = procKeys[i];
            const procNameShort = getProcShortName(procName);
            const curProcObj = arrAllProcsAndTelem[procName];
            const curProcObjSteps = curProcObj.steps; // Array of objects, keyed by step number
            const stepKeys = Object.keys(curProcObjSteps);

            //Create a Display Layout for alphas and add it to the root folder
            let procDisplayLayout = new DisplayLayout({
                'name': procNameShort,
                'layoutGrid': [parseInt(config.layoutGrid[0]), parseInt(config.layoutGrid[1])],
                'itemMargin': config.itemMargin
            });

            initAlphasItemPlacementTracker();

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
                        index: curIndex,
                        itemW: labelWidth + config.itemMargin + config.dlAlphas.itemW,
                        itemH: config.dlAlphas.itemH,
                        ident: stepKeys[s],
                        text: stepKeys[s].concat(' ').concat(curStepObj.crewMembers),
                        layoutStrategy: config.dlAlphas.layoutStrategy,
                        layoutStrategyNum: config.dlAlphas.layoutStrategyNum,
                        placeIndex: alphasItemPlacementTracker.placeIndex,
                        shiftIndex: alphasItemPlacementTracker.shiftIndex
                    }
                );

                alphasItemPlacementTracker.placeIndex = dlItem.placeIndex;
                alphasItemPlacementTracker.shiftIndex = dlItem.shiftIndex;

                // Iterate through the pathsShort array and make label and alpha pairs for each
                for (let p = 0; p < curStepObj.paths.length; p++) {
                    const curStepPath = curStepObj.paths[p].replaceAll('/','~');

                    dlItem = procDisplayLayout.addTextAndAlphaViewPair({
                        index: curIndex,
                        labelW: labelWidth,
                        itemW: config.dlAlphas.itemW,
                        itemH: config.dlAlphas.itemH,
                        ident: curStepPath,
                        text: curStepObj.pathsShort[p],
                        layoutStrategy: config.dlAlphas.layoutStrategy,
                        layoutStrategyNum: config.dlAlphas.layoutStrategyNum,
                        placeIndex: alphasItemPlacementTracker.placeIndex,
                        shiftIndex: alphasItemPlacementTracker.shiftIndex,
                        alphaFormat: config.dlAlphas.alphaFormat,
                        alphaShowsUnit: true
                    });

                    procDisplayLayout.addToComposition(curStepPath, getNamespace(curStepPath));
                    // procStackedPlot.addToComposition(prlObject.dataSource, getNamespace(prlObject.dataSource));
                    alphasItemPlacementTracker.placeIndex = dlItem.placeIndex;
                    alphasItemPlacementTracker.shiftIndex = dlItem.shiftIndex;

                }


            } // Closes steps context

            // Add the proc's Display Layout
            root.addJson(procDisplayLayout);
            procTabs.addToComposition(procDisplayLayout.identifier.key);
            folderDL.addToComposition(procDisplayLayout.identifier.key);
            procDisplayLayout.setLocation(folderDL);

            // Add the proc's Stacked Plot
            // root.addJson(procStackedPlot);
            // folderSP.addToComposition(procStackedPlot.identifier.key);
            // procStackedPlot.setLocation(folderSP);


        } // Closes single procedure context
    }

    outputJSON();
}

/*
prlToDisplay = function (prlFilename, prlContents) {
    const procNameFull = removeExtension(prlFilename); // remove .prl
    // Shorten name by clipping at 2nd '_' in the proc name
    const procName = procNameFull.substring(0, procNameFull.indexOf('_', procNameFull.indexOf('_') + 1));
    const prlObjects = extractFromPrlTraverse(prlFilename, prlContents);
    let responseObj = {};

    if (prlObjects.length == 0) {
        outputMsg(procName.concat(' -- NO TELEMETRY FOUND'));
    } else {
        outputMsg(procName);
        //Create a Display Layout for alphas and add it to the root folder
        let procDisplayLayout = new DisplayLayout({
            'name': procName,
            'layoutGrid': [parseInt(config.layoutGrid[0]), parseInt(config.layoutGrid[1])],
            'itemMargin': config.itemMargin
        });

        //Create a Stacked Plot for telemetry
        let procStackedPlot = new StackedPlot(procName + ' Telemetry');

        initAlphasItemPlacementTracker();

        const longestLabel = findLongestLabel(prlObjects);
        const labelWidth = labelWidthFromChars(parseInt(config.layoutGrid[0]), longestLabel);

        for (const prlObject of prlObjects) {
            const curIndex = prlObjects.indexOf(prlObject);
            const isTelemetry = prlObject.dataSource.length > 0;
            let dlItem = {};

            outputMsg(prlObject.name.concat(': ').concat(prlObject.dataSource));

            if (isTelemetry) {
                // If there's a datasource, add a label + alpha pair
                dlItem = procDisplayLayout.addTextAndAlphaViewPair({
                    index: curIndex,
                    labelW: labelWidth,
                    itemW: config.dlAlphas.itemW,
                    itemH: config.dlAlphas.itemH,
                    ident: prlObject.dataSource,
                    text: prlObject.name,
                    layoutStrategy: config.dlAlphas.layoutStrategy,
                    layoutStrategyNum: config.dlAlphas.layoutStrategyNum,
                    placeIndex: alphasItemPlacementTracker.placeIndex,
                    shiftIndex: alphasItemPlacementTracker.shiftIndex,
                    alphaFormat: config.dlAlphas.alphaFormat,
                    alphaShowsUnit: prlObject.alphaShowsUnit
                });

                procDisplayLayout.addToComposition(prlObject.dataSource, getNamespace(prlObject.dataSource));
                procStackedPlot.addToComposition(prlObject.dataSource, getNamespace(prlObject.dataSource));

            } else {
                dlItem = procDisplayLayout.addLabel(
                    {
                        index: curIndex,
                        itemW: labelWidth + config.itemMargin + config.dlAlphas.itemW,
                        itemH: config.dlAlphas.itemH,
                        ident: prlObject.dataSource,
                        text: prlObject.name,
                        layoutStrategy: config.dlAlphas.layoutStrategy,
                        layoutStrategyNum: config.dlAlphas.layoutStrategyNum,
                        placeIndex: alphasItemPlacementTracker.placeIndex,
                        shiftIndex: alphasItemPlacementTracker.shiftIndex
                    }
                )
            }

            alphasItemPlacementTracker.placeIndex = dlItem.placeIndex;
            alphasItemPlacementTracker.shiftIndex = dlItem.shiftIndex;
        }

        responseObj.display_layout = procDisplayLayout;
        responseObj.stacked_plot = procStackedPlot;
    }

    return responseObj;
}
*/
/*
findLongestLabel = function (objArr) {
    let maxLen = 0;
    let curLen = 0;
    for (let i = 0; i < objArr.length; i++) {
        curLen = objArr[i].name.toString().length;
        if (curLen > maxLen) {
            maxLen = curLen;
        }
    }

    return maxLen;
}
*/

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

