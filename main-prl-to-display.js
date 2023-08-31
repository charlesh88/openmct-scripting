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

    // Create a Tabs view
    let procTabs = new TabsView('Procedure Displays');
    root.addJson(procTabs);
    folderRoot.addToComposition(procTabs.identifier.key);
    procTabs.setLocation(folderRoot);

    for (let i = 0; i < prlFilenames.length; i++) {
        const procDL = prlToDisplay(prlFilenames[i], prlContentArr[i]);
        root.addJson(procDL);
        procTabs.addToComposition(procDL.identifier.key);
        folderDL.addToComposition(procDL.identifier.key);
        procDL.setLocation(folderDL);
    }

    outputJSON();
}

prlToDisplay = function(prlFilename, prlContents) {
    const prlObjects = extractFromPrl(prlContents);
    const procName = prlFilename.split('.')[0]; // remove .prl

    //Create a Display Layout for alphas and add it to the root folder
    let dlAlphas = new DisplayLayout({
        'name': procName,
        'layoutGrid': [parseInt(config.layoutGrid[0]), parseInt(config.layoutGrid[1])],
        'itemMargin': config.itemMargin
    });

    initAlphasItemPlacementTracker();

    for (const prlObject of prlObjects) {
        const curIndex = prlObjects.indexOf(prlObject);
        const isTelemetry = prlObject.dataSource.length > 0;
        let dlItem = {};

        if (isTelemetry) {
            // If there's a datasource, add a label + alpha pair
            dlItem = dlAlphas.addTextAndAlphaViewPair({
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

            dlAlphas.addToComposition(prlObject.dataSource, getNamespace(prlObject.dataSource));

        } else {
            dlItem = dlAlphas.addLabel(
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

    return dlAlphas;
}

extractFromPrl = function (str) {
    const regexTelemStr = '(?<=<prl:Identifier>)(.*)(?=<\/prl:Identifier>)';
    const regexStepStr = '(?<=<prl:StepNumber>)(.*)(?=<\/prl:StepNumber>)';

    // Split inputFileText by line return
    // let str = inputFileText;
    let curStep = '';
    let curStepTelem = [];
    let stepMatch = [];
    let telemMatch = [];
    let output = [];
    str = str.replaceAll('\r', '');
    const rows = str.split("\n");

    for (let i = 0; i < rows.length; i++) {
        stepMatch = rows[i].match(regexStepStr);
        if (stepMatch) {
            curStep = stepMatch[0];
            if (curStepTelem.length > 0) {
                output.push(createTableObj('label', 'Step ' + curStep));
                output = output.concat(curStepTelem);
                curStepTelem = [];
            }
        }

        telemMatch = rows[i].match(regexTelemStr);
        if (telemMatch) {
            curStepTelem.push(createTableObj('path', telemMatch[0]));
        }
    }

    return output;
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
