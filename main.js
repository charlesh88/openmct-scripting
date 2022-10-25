const objJson = {};
const ALPHA_BORDER = '1px solid #555555';
let config = {};
let alphasItemPlacementTracker = {};
let widgetsItemPlacementTracker = {};
let telemFolder = undefined;

function createOpenMCTJSON(telemetryObjects) {
    /*
    telemetryObjects: array of objects like this:
    [{
        name, (Used for alpha labels and domain object naming)
        dataSource (Fully qualified path to telemetry data using ~ as separators, like ~Lorem~Ipsum~FooCount)
        alphaFormat (printf string, like %9.4f)
        alphaUsesCond (TRUE if an alpha should use defined conditions; requires condDef and cond1 at least)
        alphaShowsUnit (TRUE if an alpha should should display its units)
        condWidgetUsesOutputAsLabel (TRUE if Condition Widgets should use the output string from Condition Sets)
        condDefault (output string, bgColor, fgColor)
        cond1, cond2, etc. (output string, bgColor, fgColor, trigger, criteria, value)
    }]
     */

    config = getConfigFromForm();
    let root = objJson.openmct = new Container();

    // Create the root folder
    let folder = new Obj(config.rootName, 'folder', true);
    root.addJson(folder);
    objJson.rootId = folder.identifier.key;

    // Create a folder to hold Condition Sets and add it to the root folder
    let folderConditionSets = new Obj('Condition Sets', 'folder', true);
    root.addJson(folderConditionSets);
    folder.addToComposition(folderConditionSets.identifier.key);
    folderConditionSets.setLocation(folder);

    // Create a folder to hold Condition Widgets and add it to the root folder
    let folderConditionWidgets = new Obj('Condition Widgets', 'folder', true);
    root.addJson(folderConditionWidgets);
    folder.addToComposition(folderConditionWidgets.identifier.key);
    folderConditionWidgets.setLocation(folder);

    //Create a LAD Table
    let LadTable = new Obj('LAD Table', 'LadTable', true);
    root.addJson(LadTable);
    folder.addToComposition(LadTable.identifier.key);
    LadTable.setLocation(folder);

    // Create a Display Layout for widgets and add it to the root folder
    let dlWidgets = new DisplayLayout({
        'name': 'DL Widgets',
        'layoutGrid': [parseInt(config.layoutGrid[0]), parseInt(config.layoutGrid[1])],
        'itemMargin': config.itemMargin
    });
    root.addJson(dlWidgets);
    folder.addToComposition(dlWidgets.identifier.key);
    dlWidgets.setLocation(folder);

    //Create a Display Layout for alphas and add it to the root folder
    let dlAlphas = new DisplayLayout({
        'name': 'DL Alphas',
        'layoutGrid': [parseInt(config.layoutGrid[0]), parseInt(config.layoutGrid[1])],
        'itemMargin': config.itemMargin
    });
    root.addJson(dlAlphas);
    folder.addToComposition(dlAlphas.identifier.key);
    dlAlphas.setLocation(folder);

    initAlphasItemPlacementTracker();
    initWidgetsItemPlacementTracker();

    for (const telemetryObject of telemetryObjects) {
        const curIndex = telemetryObjects.indexOf(telemetryObject);

        // If telemObject dataSource includes "," then it's synthetic
        // Create the source, add it to the telemSource folder and to the composition
        // Update telemtryObject.dataSource to use the UUID of the created object

        LadTable.addToComposition(telemetryObject.dataSource, getNamespace(telemetryObject.dataSource));

        const alpha = dlAlphas.addTextAndAlphaViewPair({
            index: curIndex,
            labelW: config.dlAlphas.labelW,
            itemW: config.dlAlphas.itemW,
            itemH: config.dlAlphas.itemH,
            ident: telemetryObject.dataSource,
            text: telemetryObject.name,
            layoutStrategy: config.dlAlphas.layoutStrategy,
            layoutStrategyNum: config.dlAlphas.layoutStrategyNum,
            placeIndex: alphasItemPlacementTracker.placeIndex,
            shiftIndex: alphasItemPlacementTracker.shiftIndex,
            alphaFormat: telemetryObject.alphaFormat,
            alphaShowsUnit: telemetryObject.alphaShowsUnit
        });

        alphasItemPlacementTracker.placeIndex = alpha.placeIndex;
        alphasItemPlacementTracker.shiftIndex = alpha.shiftIndex;
        dlAlphas.addToComposition(telemetryObject.dataSource, getNamespace(telemetryObject.dataSource));

        // Add conditionals
        if (telemetryObject.cond1.length > 0) {
            let cs = new ConditionSet(telemetryObject);

            const conditionsArr = cs.conditionsToArr(telemetryObject);
            cs.addConditions(telemetryObject, conditionsArr);

            // Add a "styles" collection for Conditional styling in dlAlpha.objectStyles[alpha.id]
            if (telemetryObject.alphaUsesCond === 'TRUE') {
                for (const cond of cs.configuration.conditionCollection) {
                    const args = {
                        border: ALPHA_BORDER,
                        bgColor: cond.bgColor,
                        fgColor: cond.fgColor,
                        id: cond.id
                    }
                    dlAlphas.configuration.objectStyles[alpha.id].styles.push(createStyleObj(args));
                    dlAlphas.configuration.objectStyles[alpha.id].conditionSetIdentifier = createIdentifier(cs.identifier.key);
                }
            }

            root.addJson(cs);
            folderConditionSets.addToComposition(cs.identifier.key);
            cs.setLocation(folderConditionSets);

            // Create Condition Widget
            let cw = new ConditionWidget(cs, telemetryObject, conditionsArr);
            root.addJson(cw);
            folderConditionWidgets.addToComposition(cw.identifier.key);
            cw.setLocation(folderConditionWidgets);

            // Add Widget to Widgets Display Layout
            dlWidgets.addToComposition(cw.identifier.key);

            const widget = dlWidgets.addSubObjectView({
                index: curIndex,
                ident: cw.identifier.key,
                itemW: config.dlWidgets.itemW,
                itemH: config.dlWidgets.itemH,
                hasFrame: false,
                layoutStrategy: config.dlWidgets.layoutStrategy,
                layoutStrategyNum: config.dlWidgets.layoutStrategyNum,
                placeIndex: widgetsItemPlacementTracker.placeIndex,
                shiftIndex: widgetsItemPlacementTracker.shiftIndex
            });

            widgetsItemPlacementTracker.placeIndex = widget.placeIndex;
            widgetsItemPlacementTracker.shiftIndex = widget.shiftIndex;
        }
    }

    // Output JSON
    const outputDisplay = document.getElementById('outputGeneratedJson');
    let outputJSON = JSON.stringify(objJson, null, 4);
    const updateTime = new Date();
    outputStatsDisplay.innerHTML = 'Updated ' + updateTime.getHours() + ':' + updateTime.getMinutes() + '; ' + telemetryObjects.length + ' objects; ' + outputJSON.length + ' chars';
    outputDisplay.innerHTML = outputJSON;
}

function initAlphasItemPlacementTracker() {
    alphasItemPlacementTracker.placeIndex = 0;
    alphasItemPlacementTracker.shiftIndex = 0;
}

function initWidgetsItemPlacementTracker() {
    widgetsItemPlacementTracker.placeIndex = 0;
    widgetsItemPlacementTracker.shiftIndex = 0;
}
