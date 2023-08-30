const STEP_LABEL_STYLE = {
    bgColor: '#333',
    fgColor: '#999'
}


prlToDisplayMain = function (prlContents, prlFilename) {
    const prlObjects = extractFromPrl(prlContents);
    const procName = prlFilename.split('.')[0]; // remove .prl
    console.log(procName);
    config = getConfigFromForm();
    let root = objJson.openmct = new Container();

    // Create the root folder
    let folder = new Obj(config.rootName, 'folder', true);
    root.addJson(folder);
    objJson.rootId = folder.identifier.key;

    //Create a LAD Table
    let LadTable = new Obj(procName, 'LadTable', true);
    root.addJson(LadTable);
    folder.addToComposition(LadTable.identifier.key);
    LadTable.setLocation(folder);

    //Create a Display Layout for alphas and add it to the root folder
    let dlAlphas = new DisplayLayout({
        'name': procName,
        'layoutGrid': [parseInt(config.layoutGrid[0]), parseInt(config.layoutGrid[1])],
        'itemMargin': config.itemMargin
    });
    root.addJson(dlAlphas);
    folder.addToComposition(dlAlphas.identifier.key);
    dlAlphas.setLocation(folder);

    initAlphasItemPlacementTracker();

    for (const prlObject of prlObjects) {
        const curIndex = prlObjects.indexOf(prlObject);
        const isTelemetry = prlObject.dataSource.length > 0;
        let dlItem = {};
        // console.log(curIndex, config.dlAlphas);

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

        if (isTelemetry) {
            LadTable.addToComposition(prlObject.dataSource, getNamespace(prlObject.dataSource));
        }
    }

    // console.log('dlAlphas', dlAlphas);

    outputJSON(prlObjects);
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
                // console.log(curStep + ': cst: ' + curStepTelem);
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

    // console.log(output);
    return output;
}

createTableObj = function (type, str) {
    let o = {};
    o.alphaFormat = '';
    o.alphaShowsUnit = 'TRUE';
    o.alphaUsesCond = '';

    if (type.includes('label')) {
        o.name = str;
        o.type = 'label';
        o.dataSource = '';
    }

    if (type.includes('path')) {
        o.name = nameFromPath(str, '/', 2);
        o.dataSource = str.replaceAll('/', '~');
        o.type = 'telemetry';
    }

    return o;
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
