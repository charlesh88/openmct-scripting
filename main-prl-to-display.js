const INPUT_TYPE = "prl";
const OUTPUT_BASE_NAME_KEY = '_PRL_TO_DISPLAYS_BASE_NAME';
const STEP_LABEL_STYLE = {
    bgColor: '#555',
    fgColor: '#ccc'
}

let globalArrUniquePaths = [];

storeOutputBaseName();
loadLocalSettings();

inputPrl.addEventListener("change", function(ev){
    uploadFiles(ev.currentTarget.files, 'prl');
}, false);

function getConfigFromForm() {
    // Get form values
    const config = {};

    config.outputBaseName = document.getElementById('output-base-name').value;
    config.layoutGrid = document.getElementById('layoutGrid').value.split(',');
    config.itemMargin = getFormNumericVal('itemMargin');

    config.dlAlphas = {};
    // config.dlAlphas.layoutStrategy = document.getElementById('alphaLayoutStrategy').value;
    // config.dlAlphas.layoutStrategyNum = getFormNumericVal('alphaLayoutStrategyNum');
    config.dlAlphas.itemW = getFormNumericVal('alphaLayoutItemWidth');
    config.dlAlphas.itemH = getFormNumericVal('alphaLayoutItemHeight');

    return config;
}

processInputPrls = function (prlFilenames, prlContentArr) {
    // For each elem in prlContentArr, create a LAD Table and Display Layout
    // Put the layouts into a Tab View
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

    for (let i = 0; i < prlFilenames.length; i++) {
        if (i > 0) {
            outputMsg('------------------------------------------------------------------------------------------------');
        }
        const procViews = prlToDisplay(prlFilenames[i], prlContentArr[i]);

        if (Object.keys(procViews).length > 0) {
            // Add the proc's Display Layout
            const procDL = procViews.display_layout;
            root.addJson(procDL);
            procTabs.addToComposition(procDL.identifier.key);
            folderDL.addToComposition(procDL.identifier.key);
            procDL.setLocation(folderDL);

            // Add the proc's Stacked Plot
            const procSP = procViews.stacked_plot;
            root.addJson(procSP);
            folderSP.addToComposition(procSP.identifier.key);
            procSP.setLocation(folderSP);
        }
    }

    outputJSON();
}

prlToDisplay = function (prlFilename, prlContents) {
    const procNameFull = removeExtension(prlFilename); // remove .prl
    // Shorten name by clipping at 2nd '_' in the proc name
    const procName = procNameFull.substring(0, procNameFull.indexOf('_', procNameFull.indexOf('_') + 1));
    const prlObjects = extractFromPrl(prlContents);
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
                    alphaFormat: prlObject.alphaFormat,
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
                        shiftIndex: alphasItemPlacementTracker.shiftIndex,
                        alphaFormat: prlObject.alphaFormat,
                        alphaShowsUnit: prlObject.alphaShowsUnit
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

extractFromPrl = function (str) {
    let xmlDoc = new DOMParser().parseFromString(str, "text/xml");
    const steps = xmlDoc.getElementsByTagName("prl:Step");
    let arrStepsAndTelem = [];

    for (let s = 0; s < steps.length; s++) {
        // COMPILE TELEM FOR A GIVEN STEP
        const arrDataReferences = steps[s].getElementsByTagName("prl:DataReference");
        const arrDataNomenclature = steps[s].getElementsByTagName("prl:DataNomenclature");
        // const arrVerifications = steps[s].getElementsByTagName("prl:VerifyGoal");
        const nodeStepTitle = steps[s].getElementsByTagName("prl:StepTitle")[0];
        // const strStepLabel = 'STEP '
        //     .concat(nodeStepTitle.getElementsByTagName("prl:StepNumber")[0].textContent);

        let arrUniquePathsForStep = [];

        if (arrDataReferences && arrDataReferences.length > 0) {
            const arrPaths = extractTelemFromPrlDataReferences(arrDataReferences);
            for (let i = 0; i < arrPaths.length; i++) {
                if (!arrUniquePathsForStep.includes(arrPaths[i])) {
                    arrUniquePathsForStep.push(arrPaths[i]);
                }
            }
        }

        if (arrDataNomenclature && arrDataNomenclature.length > 0) {
            const arrPaths = extractTelemFromPrlDataNomenclature(arrDataNomenclature);
            for (let i = 0; i < arrPaths.length; i++) {
                if (!arrUniquePathsForStep.includes(arrPaths[i])) {
                    arrUniquePathsForStep.push(arrPaths[i]);
                }
            }
        }

        if (arrUniquePathsForStep.length > 0) {
            // Add a step label
            arrStepsAndTelem.push(createTableObj('label', 'STEP '.concat(nodeStepTitle.getElementsByTagName("prl:StepNumber")[0].textContent)));

            for (let i = 0; i < arrUniquePathsForStep.length; i++) {
                arrStepsAndTelem.push(createTableObj('path', arrUniquePathsForStep[i]));
            }
        }

/*        if (
            arrDataReferences.length > 0 ||
            arrDataNomenclature.length > 0
        ) {
            // NEED A BETTER TEST - ARE THERE ACTUAL GOOD TELEM REFS IN HERE?
            // 1. This step has either data refs or data nomenclature, so add a step label
            arrStepsAndTelem.push(createTableObj('label', strStepLabel));

            // 2. Get all the unique paths for data refs and add them to the uniquepaths array
            if (arrDataReferences.length > 0) {
                arrUniquePathsForStep = extractTelemFromDataReferences(arrDataReferences, arrUniquePathsForStep);
            }

            if (arrDataNomenclature.length > 0) {
                arrUniquePathsForStep = extractTelemFromDataNomenclature(arrDataNomenclature, arrUniquePathsForStep);
            }

            // if (arrVerifications.length > 0) {
            //     arrUniquePathsForStep = extractTelemFromVerifications(arrVerifications, arrUniquePathsForStep);
            // }

            // 4. Iterate through the unique paths array and create table objs for them, adding to arrStepsAndTelem
            for (let j = 0; j < arrUniquePathsForStep.length; j++) {
                arrStepsAndTelem.push(createTableObj('path', arrUniquePathsForStep[j]));
            }
        }*/
    }

    return arrStepsAndTelem;
}

extractTelemFromDataReferences = function (arrToIterate, arrUniquePathsForStep) {
    for (let i = 0; i < arrToIterate.length; i++) {
        let description = '', identifier = ''; //

        if (arrToIterate[i].getElementsByTagName("prl:Description")[0]) {
            description = arrToIterate[i].getElementsByTagName("prl:Description")[0].textContent;
            identifier = arrToIterate[i].getElementsByTagName("prl:Identifier")[0].textContent;
            let path = identifier;

            /*
                Pride stores aggregates like this:
                DataReference > Description: [EpsIo] SaciTelemetry.LIG_CTLR_CURR
                DataReference > Idenfitier: /ViperRover/EpsIo/SaciTelemetry
                So, we have to look for '.' in the Description to figure out if its an aggregate
                If so, grab everything past the first '.' and append it to the Identifier
                to get a valid path
             */

            if (description.includes('.')) {
                const pathEnd = description.substring(description.indexOf('.'), description.length);
                path = identifier.concat(pathEnd);
            }

            if (!path.includes(' ')) {
                // If there are any spaces in the path, ignore it

                if (!arrUniquePathsForStep.includes(path)) {
                    arrUniquePathsForStep.push(path);

                    if (!globalArrUniquePaths.includes(path)) {
                        globalArrUniquePaths.push(path);
                    }
                }
            }
        }
    }

    return arrUniquePathsForStep;
}

extractTelemFromDataNomenclature = function (arrToIterate, arrUniquePathsForStep) {
    for (let i = 0; i < arrToIterate.length; i++) {
        let path = arrToIterate[i].textContent;

        // path = convertSybilStyle(path);

        if (!path.includes(' ')) {
            // If there are any spaces in the path, ignore it

            if (!arrUniquePathsForStep.includes(path)) {
                arrUniquePathsForStep.push(path);

                if (!globalArrUniquePaths.includes(path)) {
                    globalArrUniquePaths.push(path);
                }
            }
        }
    }

    return arrUniquePathsForStep;
}

extractTelemFromVerifications = function (arrToIterate, arrUniquePathsForStep) {
    // arrToIterate is an array of the following
    // <prl:VerifyGoal>
    //    <prl:TargetDescription>
    //         <prl:Text>/ViperRover/MsoloIo/enabledFlag</prl:Text>
    for (let i = 0; i < arrToIterate.length; i++) {
        let path = arrToIterate[i]
            .getElementsByTagName('prl:TargetDescription')[0]
            .getElementsByTagName('prl:Text')[0].textContent;

        if (!path.includes(' ')) {
            // If there are any spaces in the path, ignore it

            // path = convertSybilStyle(path);

            if (!arrUniquePathsForStep.includes(path)) {
                arrUniquePathsForStep.push(path);

                if (!globalArrUniquePaths.includes(path)) {
                    globalArrUniquePaths.push(path);
                }
            }
        }
    }

    return arrUniquePathsForStep;
}

convertSybilStyle = function (strSybilRef) {
    // Converts telem refs like [EpsIo] SaciTelemetry.PAPI6B_BUS_VOLTAGE
    // Replace first '[' with 'ViperRover/'
    // Replace second '] ' with '/'
    const pathRoot = '/ViperRover/';
    return strSybilRef.replace('[', pathRoot).replace('] ', '/');
}

createTableObj = function (type, str) {
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

findLongestLabel = function(objArr) {
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
