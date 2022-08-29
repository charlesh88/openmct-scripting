let objJson = {};
const config = {};

function createOpenMCTJSON() {
    const CHILDREN = [
        {
            name: 'Test 1',
            datasource: '~ViperRover~RadIo~enabledFlag',
            watchValue: 3
        }
    ];

    objJson.openmct = {};

    // Get form values
    config.rootName = document.getElementById('rootName').value;
    config.dlWidgets = {};
    config.dlWidgets.columns = document.getElementById('widgetLayoutItemColumns').value;
    config.dlWidgets.rows = document.getElementById('widgetLayoutItemRows').value;
    config.dlWidgets.itemW = document.getElementById('widgetLayoutItemWidth').value;
    config.dlWidgets.itemH = document.getElementById('widgetLayoutItemHeight').value;

    config.dlAlphas = {};

    // Create the root folder
    let folder = new Obj(config.rootName, 'folder', true);
    let rootFolder = objJson.openmct[folder.identifier.key] = folder;
    objJson.rootId = folder.identifier.key;

    // Create a Display Layout for widgets
    let dlWidgets = new DisplayLayout('DL Widgets');
    rootFolder.addObj(objJson.openmct, dlWidgets);

    let index = 0;

    for (const child of CHILDREN) {
        // Create Condition Set
        let cs = new ConditionSet('CS ' + child.name, child.datasource);
        cs.addConditions('Enabled', 'greaterThan', child.watchValue);
        rootFolder.addObj(objJson.openmct, cs);

        // Create Condition Widget
        let cw = new ConditionWidget('CW ' + child.name, cs);
        rootFolder.addObj(objJson.openmct, cw);

        // Add Widget to Display Layout
        dlWidgets.addObj(objJson.openmct, cw);
        // console.log(cw);
        dlWidgets.addItem(
            CHILDREN.indexOf(child),
            cw.identifier.key,
            config.dlWidgets.itemW,
            config.dlWidgets.itemH
        );

    }

    // Output JSON
    const outputDisplay = document.getElementById('output');
    const outputStats = document.getElementById('output-stats');
    let outputJSON = JSON.stringify(objJson, null, 4);
    outputStats.innerHTML = outputJSON.length + ' chars';
    outputDisplay.innerHTML = outputJSON;
}

/********************************** DOMAIN OBJS */
const Obj = function (name, type, composable) {
    const datetime = 1661559456808;
    const id = createUUID();

    this.name = name;
    this.type = type;
    if (composable) {
        this.composition = [];

        this.addToComposition = function (child) {
            this.composition.push(createIdentifier(child.identifier.key));
        }

        this.addObj = function (parent, child) {
            parent[child.identifier.key] = child;
            this.addToComposition(child);
            child.location = this.identifier.key;
        }
    }
    this.modified = datetime;
    this.location = null;
    this.persisted = datetime;
    this.identifier = createIdentifier(id);
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
    this.prototype = Object.create(Obj.prototype);
    this.configuration = {};
    this.configuration.conditionTestData = [];
    this.configuration.conditionCollection = [];
    this.composition.push(createIdentifier(dataSource, 'taxonomy'));

    this.addConditions = function (output, operation, inputValue, isDefault) {
        this.configuration.conditionCollection.push(createCondition('C1', output, operation, inputValue, false));
        this.configuration.conditionCollection.push(createCondition('Default', output, operation, null, true));
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
    this.prototype = Object.create(Obj.prototype);

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
const DisplayLayout = function (name) {
    Obj.call(this, name, 'layout', true);
    this.prototype = Object.create(Obj.prototype);

    this.configuration = {};
    this.configuration.layoutGrid = [10, 10];
    this.configuration.objectStyles = {};
    this.items = [];

    this.addItem = function (
        index,
        id,
        itemW = config.dlWidgets.itemW,
        itemH = config.dlWidgets.itemH,
        hasFrame = false
    )
    {
        let i = {
            'width': itemW,
            'height': itemH,
            'hasFrame': hasFrame,
            'fontSize': 'default',
            'font': 'default'
        };
        i.x = 0; // TEMP, replace with function
        i.y = 0; // TEMP, replace with function
        i.identifier = createIdentifier(id);

        this.items.push(i);
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
