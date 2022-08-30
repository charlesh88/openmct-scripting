// CONDITION SETS AND CONDITIONS
const ConditionSet = function (name, dataSource) {
    Obj.call(this, name, 'conditionSet', true);
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
