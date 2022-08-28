let objJson = {};

function doit() {
    const CHILDREN = [
        {
            name: 'Test 1',
            type: 'conditionSet',
        }
    ];

    objJson.openmct = {};

    // Create the root folder
    let folder = new Obj('Scripted Folder', 'folder', true);
    let rootFolder = objJson.openmct[folder.identifier.key] = folder;
    objJson.rootId = folder.identifier.key;

    // Create Condition Sets
    for (const child of CHILDREN) {
        let conditionSet = createConditionSet('CS ' + child.name, '~ViperRover~RadIo~enabledFlag', 'Enabled', 'greaterThan', 3);
        rootFolder.addObj(conditionSet);

        let conditionWidget = createConditionWidget('CW ' + child.name, conditionSet);
        rootFolder.addObj(conditionWidget);
    }

    // Ouput some JSON
    const outputDisplay = document.getElementById('output');
    outputDisplay.innerHTML = JSON.stringify(objJson, null, 4);
}

/********************************** DOMAIN OBJS */
// CONDITION WIDGETS
function createConditionWidget(name, conditionSet) {
    let o = new Obj(name, 'conditionWidget', true);
    o.configuration = {};
    o.configuration.objectStyles = {};
    o.configuration.objectStyles.styles = [];

    for (const cond of conditionSet.conditionCollection) {
        o.configuration.objectStyles.styles.push(createStyleObj(cond));
    }

    o.configuration.staticStyle = createStyleObj();

    return o;
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

// CONDITION SETS AND CONDITIONS
function createConditionSet(name, dataSource, output, operation, value) {
    let o = new Obj(name, 'conditionSet', true);
    o.configuration = {};
    o.conditionTestData = [];
    o.conditionCollection = [];
    o.conditionCollection.push(createCondition('C1', output, operation, value, false));
    o.conditionCollection.push(createCondition('Default', output, operation, null, true));
    o.composition.push(createIdentifier(dataSource, 'taxonomy'));

    return o;
}

function createCondition(name, output, operation, inputValue, isDefault) {
    let o = {};
    o.isDefault = isDefault;
    o.id = createUUID();
    let c = o.configuration = {};
    c.name = name;
    c.output = output;
    c.trigger = 'any';
    c.criteria = (inputValue !== null) ? [createCriteria(operation, inputValue)] : [];
    c.summary = "This condition was created by a script";

    return o;
}

function createCriteria(operation, inputValue) {
    let o = {};
    o.id = createUUID();
    o.telemetry = 'any';
    o.operation = operation;
    o.input = [inputValue];
    o.metadata = 'value';

    return o;
}

// GENERAL
const Obj = function (name, type, composable) {
    // let o = {};
    const datetime = 1661559456808;
    const id = createUUID();

    this.name = name;
    this.type = type;
    if (composable) {
        this.composition = [];
    }
    this.modified = datetime;
    this.location = null;
    this.persisted = datetime;
    this.identifier = createIdentifier(id);

    return true;
}

Obj.prototype.addObj = function (child) {
    objJson.openmct[child.identifier.key] = child;
    this.composition.push(createIdentifier(child.identifier.key));
}

// function addObj(container, child) {
//   objJson.openmct[child.identifier.key] = child;
//   console.log(container);
//   container.composition.push(createIdentifier(child.identifier.key));
// }

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

function createIdentifier(id, namespace) {
    let o = {};
    o.namespace = (namespace) ? namespace : '';
    o.key = id;

    return o;
}
