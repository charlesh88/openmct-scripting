const INPUT_TYPE = "prl";
const OUTPUT_BASE_NAME_KEY = '_PRL_TO_DISPLAYS_BASE_NAME';
const STEP_LABEL_STYLE = {
    backgroundColor: '#555555',
    color: '#cccccc'
}

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
        let root = objJson.openmct = new Container();

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

        // Create a Tabs view for Display Layouts
        let tabsDL = new TabsView('Procedure Displays', false);
        root.addJson(tabsDL);
        folderRoot.addToComposition(tabsDL.identifier.key);
        tabsDL.setLocation(folderRoot);

        // Create a Tabs view for Stacked Plots
        let tabsSP = new TabsView('Procedure Stacked Plots', false);
        root.addJson(tabsSP);
        folderRoot.addToComposition(tabsSP.identifier.key);
        tabsSP.setLocation(folderRoot);

        for (let i = 0; i < procKeys.length; i++) {
            // Make a Display Layout for the current proc
            const procName = procKeys[i];
            const procNameShort = getProcShortName(procName);
            const curProcObj = arrAllProcsAndTelem[procName];
            const curProcObjSteps = curProcObj.steps; // Array of objects, keyed by step number
            const stepKeys = Object.keys(curProcObjSteps);
            let uniqueTelemPaths = [];

            //Create a Display Layout for alphas and add it to the root folder
            let procDisplayLayout = new DisplayLayout({
                'name': procNameShort,
                'layoutGrid': [parseInt(config.layoutGrid[0]), parseInt(config.layoutGrid[1])],
                'itemMargin': config.itemMargin
            });

            initAlphasItemPlacementTracker();

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
                        placeIndex: alphasItemPlacementTracker.placeIndex,
                        shiftIndex: alphasItemPlacementTracker.shiftIndex,
                        text: stepKeys[s].concat(' ').concat(curStepObj.crewMembers)
                    }
                );

                alphasItemPlacementTracker.placeIndex = dlItem.placeIndex;
                alphasItemPlacementTracker.shiftIndex = dlItem.shiftIndex;

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
                        placeIndex: alphasItemPlacementTracker.placeIndex,
                        shiftIndex: alphasItemPlacementTracker.shiftIndex,
                        text: curStepObj.pathsShort[p]
                    });

                    procDisplayLayout.addToComposition(curStepPath, getNamespace(curStepPath));
                    if (!uniqueTelemPaths.includes(curStepPath)) {
                        uniqueTelemPaths.push(curStepPath);
                    }
                    // procStackedPlot.addToComposition(prlObject.dataSource, getNamespace(prlObject.dataSource));
                    alphasItemPlacementTracker.placeIndex = dlItem.placeIndex;
                    alphasItemPlacementTracker.shiftIndex = dlItem.shiftIndex;
                }
            } // Closes steps context

            // Add the proc's Display Layout
            root.addJson(procDisplayLayout);
            tabsDL.addToComposition(procDisplayLayout.identifier.key);
            folderDL.addToComposition(procDisplayLayout.identifier.key);
            procDisplayLayout.setLocation(folderDL);

            //Create a Stacked Plot for telemetry
            let procStackedPlot = new StackedPlot(procNameShort);
            uniqueTelemPaths.map(p => {
                procStackedPlot.addToComposition(p, getNamespace(p));
            });

            // Add the proc's Stacked Plot
            root.addJson(procStackedPlot);
            tabsSP.addToComposition(procStackedPlot.identifier.key);
            folderSP.addToComposition(procStackedPlot.identifier.key);
            procStackedPlot.setLocation(folderSP);
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

