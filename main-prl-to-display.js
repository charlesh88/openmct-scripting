const STEP_LABEL_STYLE = {
    bgColor: '#333',
    fgColor: '#999'
}

prlToDisplays = function(prlFilenames, prlContentArr) {
    // For each elem in prlContentArr, create a LAD Table and Display Layout
    // Put the layouts into a Tab View
    config = getConfigFromForm();
    let root = objJson.openmct = new Container();

    // Create the root folder
    let folderRoot = new Obj(config.rootName, 'folder', true);
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
        const procViews = prlToDisplay(prlFilenames[i], prlContentArr[i]);

        // Add the proc's Display Layout
        const procDL = procViews.display_layout;
        root.addJson(procDL);
        procTabs.addToComposition(procDL.identifier.key); // Change this later to add a flex layout
        folderDL.addToComposition(procDL.identifier.key);
        procDL.setLocation(folderDL);

        // Add the proc's Stacked Plot
        const procSP = procViews.stacked_plot;
        root.addJson(procSP);
        folderSP.addToComposition(procSP.identifier.key);
        procSP.setLocation(folderSP);
    }

    outputJSON();
}

prlToDisplay = function(prlFilename, prlContents) {
    const prlObjects = extractFromPrl(prlContents);
    const procName = prlFilename.split('.')[0]; // remove .prl
    let responseObj = {};

    //Create a Display Layout for alphas and add it to the root folder
    let procDisplayLayout = new DisplayLayout({
        'name': procName,
        'layoutGrid': [parseInt(config.layoutGrid[0]), parseInt(config.layoutGrid[1])],
        'itemMargin': config.itemMargin
    });

    //Create a Stacked Plot for telemetry
    let procStackedPlot = new StackedPlot(procName + ' Telemetry');

    initAlphasItemPlacementTracker();

    for (const prlObject of prlObjects) {
        const curIndex = prlObjects.indexOf(prlObject);
        const isTelemetry = prlObject.dataSource.length > 0;
        let dlItem = {};

        if (isTelemetry) {
            // If there's a datasource, add a label + alpha pair
            dlItem = procDisplayLayout.addTextAndAlphaViewPair({
                index: curIndex,
                labelW: config.dlAlphas.labelW,
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
                    itemW: config.dlAlphas.labelW + config.itemMargin + config.dlAlphas.itemW,
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

    return responseObj;
}

extractFromPrl = function (str) {
    let xmlDoc = new DOMParser().parseFromString(str,"text/xml");
    const steps = xmlDoc.getElementsByTagName("prl:Step");
    let arrStepsAndTelem = [];

    for (let i = 0; i < steps.length; i++) {
        const arrDataReferences = steps[i].getElementsByTagName("prl:DataReference");
        const nodeStepTitle = steps[i].getElementsByTagName("prl:StepTitle")[0];
        const strStepLabel = 'STEP '
            .concat(nodeStepTitle.getElementsByTagName("prl:StepNumber")[0].textContent);
            // .concat(': ')
            // .concat(nodeStepTitle.getElementsByTagName("prl:Text")[0].textContent)

        let arrUniquePathsForStep = [];

        if (arrDataReferences.length > 0) {
            arrStepsAndTelem.push(createTableObj('label', strStepLabel));

            for (let j = 0; j < arrDataReferences.length; j++) {
                const description = arrDataReferences[j].getElementsByTagName("prl:Description")[0].textContent;
                const identifier = arrDataReferences[j].getElementsByTagName("prl:Identifier")[0].textContent;
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

                if (!arrUniquePathsForStep.includes(path)) {
                    // Don't include the same telemetry more than once in a given step
                    arrUniquePathsForStep.push(path);
                    arrStepsAndTelem.push(createTableObj('path', path));
                }
            }
        }
    }

    // console.log('arrStepsAndTelem', arrStepsAndTelem);
    return arrStepsAndTelem;
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
    // places counts backwards from the end of the path
    const pathArr = str.split(delim);
    let name = '';

    for (let i = pathArr.length - places; i < pathArr.length; i++) {
        name = name.concat(pathArr[i] + ' ');
    }

    return name.trim();
}
