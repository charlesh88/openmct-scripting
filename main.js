const objJson = {};
let config = {};
let telemetryObjects = [];

function createOpenMCTJSON() {
    telemetryObjects = [
        {
            name: 'RadIo enabledFlag',
            datasource: '~ViperRover~RadIo~enabledFlag',
            watchValue: 1
        },{
            name: 'RadIo commandCount 0',
            datasource: '~ViperRover~RadIo~commandCount',
            watchValue: 0
        },{
            name: 'RadIo commandCount 1',
            datasource: '~ViperRover~RadIo~commandCount',
            watchValue: 1
        },{
            name: 'RadIo commandCount 2',
            datasource: '~ViperRover~RadIo~commandCount',
            watchValue: 2
        }
    ];

    config = getConfigFromForm();
    let root = objJson.openmct = new Container();

    // Create the root folder
    let folder = new Obj(config.rootName, 'folder', true);
    root.addJson(folder);
    objJson.rootId = folder.identifier.key;

    // Create a Display Layout for widgets
    let dlWidgets = new DisplayLayout({
        'name': 'DL Widgets',
        'layoutGrid': [parseInt(config.layoutGrid[0]), parseInt(config.layoutGrid[1])],
        'itemMargin': config.itemMargin
    });
    root.addJson(dlWidgets);
    folder.addToComposition(dlWidgets.identifier.key);
    dlWidgets.setLocation(folder);

    //Create a Display Layout for alphas
    let dlAlphas = new DisplayLayout({
        'name': 'DL Alphas',
        'layoutGrid': [parseInt(config.layoutGrid[0]), parseInt(config.layoutGrid[1])],
        'itemMargin': config.itemMargin });
    root.addJson(dlAlphas);
    folder.addToComposition(dlAlphas.identifier.key);
    dlAlphas.setLocation(folder);

    let index = 0;
    for (const telemetryObject of telemetryObjects) {
        const curIndex = telemetryObjects.indexOf(telemetryObject);

        // Create Condition Set
        let cs = new ConditionSet('CS ' + telemetryObject.name, telemetryObject.datasource);
        cs.addConditions('Enabled', 'greaterThan', telemetryObject.watchValue);
        root.addJson(cs);
        folder.addToComposition(cs.identifier.key);
        cs.setLocation(folder);

        // Create Condition Widget
        let cw = new ConditionWidget('CW ' + telemetryObject.name, cs);
        root.addJson(cw);
        folder.addToComposition(cw.identifier.key);
        cw.setLocation(folder);

        // Add Widget to Widgets Display Layout
        dlWidgets.addToComposition(cw.identifier.key);
        let itemProps = {
            index: curIndex,
            ident: cw.identifier.key,
            itemW: config.dlWidgets.itemW,
            itemH: config.dlWidgets.itemH,
            hasFrame: false,
            layoutStrategy: config.dlWidgets.layoutStrategy,
            layoutStrategyNum: config.dlWidgets.layoutStrategyNum,
        };

        dlWidgets.addSubObjectView(itemProps);

        // Add text to Alphas Display Layout TODO: fix width/height properties
        dlAlphas.addTextView({
            index: curIndex,
            itemX: 0,
            itemY: 0,
            itemW: config.dlAlphas.labelW,
            itemH: config.dlAlphas.itemH,
            text: telemetryObject.name
        });

        // Add alpha to Alphas Display Layout TODO: fix width/height properties
        dlAlphas.addToComposition(telemetryObject.datasource, 'taxonomy');
        dlAlphas.addTelemetryView({
            index: telemetryObjects.indexOf(telemetryObject),
            ident: telemetryObject.datasource,
            itemX: config.dlAlphas.labelW,
            itemY: 0,
            itemW: config.dlAlphas.itemW,
            itemH: config.dlAlphas.itemH
        });
    }

    // Output JSON
    const outputDisplay = document.getElementById('output');
    const outputStats = document.getElementById('output-stats');
    let outputJSON = JSON.stringify(objJson, null, 4);
    outputStats.innerHTML = telemetryObjects.length + ' objects; ' + outputJSON.length + ' chars';
    outputDisplay.innerHTML = outputJSON;
}

function getFormNumericVal (id) {
    const v = document.getElementById(id).value;
    return (v) ? parseInt(v) : null;
}

function getConfigFromForm () {
    // Get form values
    const config = {};

    config.rootName = document.getElementById('rootName').value;
    config.layoutGrid = document.getElementById('layoutGrid').value.split(',');
    config.itemMargin = getFormNumericVal('itemMargin');

    config.dlWidgets = {};
    config.dlWidgets.layoutStrategy = document.getElementById('widgetLayoutStrategy').value
    config.dlWidgets.layoutStrategyNum = getFormNumericVal('widgetLayoutStrategyNum');
    config.dlWidgets.itemW = getFormNumericVal('widgetLayoutItemWidth');
    config.dlWidgets.itemH = getFormNumericVal('widgetLayoutItemHeight');

    config.dlAlphas = {};
    config.dlAlphas.layoutStrategy = document.getElementById('alphaLayoutStrategy').value
    config.dlAlphas.layoutStrategyNum = getFormNumericVal('alphaLayoutStrategyNum');
    config.dlAlphas.labelW = getFormNumericVal('alphaLayoutLabelWidth');
    config.dlAlphas.itemW = getFormNumericVal('alphaLayoutItemWidth');
    config.dlAlphas.itemH = getFormNumericVal('alphaLayoutItemHeight');

    console.log(config);

    return config;
}

/********************************** DOMAIN OBJS */
const Container = function () {
    this.addJson = function (child) {
        this[child.identifier.key] = child;
    }
}

const Obj = function (name, type, hasComposition) {
    const id = createUUID();
    const datetime = 1661559456808;

    this.name = name;
    this.type = type;
    this.modified = datetime;
    this.location = null;
    this.persisted = datetime;
    this.identifier = createIdentifier(id);

    if (hasComposition) {
        this.composition = [];

        this.addToComposition = function (childIdentifierKey, namespace) {
            this.composition.push(createIdentifier(childIdentifierKey, namespace));
            // this.composition.push(createIdentifier(child.identifier.key));
        }
    }

    this.setLocation = function (location) {
        this.location = location.identifier.key;
    }
}

function createIdentifier(id, namespace) {
    let o = {};
    o.namespace = (namespace) ? namespace : '';
    o.key = id;

    return o;
}

// CONDITION SETS AND CONDITIONS
const ConditionSet = function (name, dataSource) {
    Obj.call(this, name, 'conditionSet', true);
    // this.prototype = Object.create(Obj.prototype);
    this.configuration = {};
    this.configuration.conditionTestData = [];
    this.configuration.conditionCollection = [];
    this.composition.push(createIdentifier(dataSource, 'taxonomy'));

    this.addConditions = function (output, operation, inputValue, isDefault) {
        this.configuration.conditionCollection.push(createCondition('Condition 1', output, operation, inputValue, false));
        this.configuration.conditionCollection.push(createCondition('Default', 'Default', operation, null, true));
    }
}

function createCondition(name, output, operation, inputValue, isDefault) {
    let o = {};
    o.isDefault = isDefault;
    o.id = createUUID();
    let c = o.configuration = {};
    c.name = name;
    c.output = output;
    c.trigger = 'any';
    c.criteria = (inputValue !== null) ? [createConditionCriteria(operation, inputValue)] : [];
    c.summary = "This condition was created by a script";

    return o;
}

function createConditionCriteria(operation, inputValue) {
    let o = {};
    o.id = createUUID();
    o.telemetry = 'any';
    o.operation = operation;
    o.input = [inputValue];
    o.metadata = 'value';

    return o;
}

// CONDITION WIDGETS
const ConditionWidget = function (name, conditionSet) {
    Obj.call(this, name, 'conditionWidget', false);
    // this.prototype = Object.create(Obj.prototype);

    this.configuration = {};
    let os = this.configuration.objectStyles = {};
    os.styles = [];
    os.staticStyle = createStyleObj();
    os.conditionSetIdentifier = createIdentifier(conditionSet.identifier.key);
    this.label = name;
    this.conditionalLabel = '';

    for (const cond of conditionSet.configuration.conditionCollection) {
        if (cond.isDefault) {
            os.selectedConditionId = cond.id;
            os.defaultConditionId = cond.id;
        }
        os.styles.push(createStyleObj(cond));
    }
}

function createStyleObj(cond) {
    let s = {};
    s.style = {};
    s.style.border = '';
    s.style.isStyleInvisible = '';
    s.style.backgroundColor = (cond && !cond.isDefault) ? '#38761d' : '';
    s.style.color = (cond && !cond.isDefault) ? '#00ff00' : '';

    if (cond) {
        s.conditionId = cond.id;
        s.style.output = '* ' + cond.id.substr(0, 4) + ' style output *';
    }

    return s;
}

// DISPLAY LAYOUT
const DisplayLayout = function (args) {
    Obj.call(this, args.name, 'layout', true);

    this.configuration = {};
    this.configuration.layoutGrid = args.layoutGrid;
    this.configuration.objectStyles = {};
    this.configuration.items = [];

    this.itemPlaceIndex = 0; // Tracks where an item is within a row or column
    this.itemShiftIndex = 0; // Tracks the row or column that an item is in

    this.createBaseItem = function (args) {
        // console.log(args);
        return {
            'id': createUUID(),
            'x': 0,
            'y': 0,
            'width': parseInt(args.itemW),
            'height': parseInt(args.itemH),
            "stroke": '',
            "fill": '',
            "color": '',
            'fontSize': 'default',
            'font': 'default'
        };
    }

    this.addSubObjectView = function (args) {
        const so = this.createBaseItem(args);
        so.type = 'subobject-view';
        so.identifier = createIdentifier(args.ident);
        so.hasFrame = args.hasFrame;

        // Calc position. This is a widget, so X or Y is purely based on a mod against the layout strategy
        // itemPos should be [x, y]
        const itemPos = this.calcItemPosition(args);
        so.x = itemPos.x;
        so.y = itemPos.y;

        console.log('addSubObjectView', so);

        this.configuration.items.push(so);
    }

    this.addTextAndAlphaPair = function (args) {
        // TODO: make this calc the position for a pair of text and alpha elements
    }

    this.addTextView = function (args) {
        const so = this.createBaseItem(args);
        so.type = 'text-view';
        so.text = args.text;

        this.configuration.items.push(so);
    }

    this.addTelemetryView = function (args) {
        const so = this.createBaseItem(args);
        so.type = 'telemetry-view';
        so.identifier = createIdentifier(args.ident, 'taxonomy');
        so.displayMode = 'value';
        so.value = 'value';
        so.format = '%9.4f';

        this.configuration.items.push(so);
    }

    this.calcItemPosition = function (args) {
        let itemPos = {};
        const itemPlaceMargin = this.itemPlaceIndex * config.itemMargin;
        const itemShiftMargin = this.itemShiftIndex * config.itemMargin;

        if (args.layoutStrategy === 'columns') {
            // Build down first until itemPlaceMargin is reached, then go across
            itemPos.x = (this.itemPlaceIndex * args.itemW) + itemPlaceMargin;
            itemPos.y = (this.itemShiftIndex * args.itemH) + itemShiftMargin;
         } else {
            // Build across first until itemPlaceMargin is reached, then go down
            itemPos.x = (this.itemShiftIndex * args.itemW) + itemShiftMargin;
            itemPos.y = (this.itemPlaceIndex * args.itemH) + itemPlaceMargin;
        }

        // console.log('calcd pos:', this.itemPlaceIndex, this.itemShiftIndex);

        if ((this.itemPlaceIndex + 1) % args.layoutStrategyNum === 0) {
            this.itemPlaceIndex = 0;
            this.itemShiftIndex += 1;
        } else {
            this.itemPlaceIndex += 1;
        }

        return itemPos;
    }
}

/********************************** UTILITIES */
function createUUID() {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}
