// CONDITION SETS AND CONDITIONS
const ConditionSet = function (telemetryObject) {
    Obj.call(this, 'CS ' + telemetryObject.name, 'conditionSet', true);
    this.configuration = {};
    this.configuration.conditionTestData = [];
    this.configuration.conditionCollection = [];
    this.composition.push(createIdentifier(telemetryObject.dataSource, 'taxonomy'));

/*    this.addConditions = function (output, operation, inputValue, isDefault, condMatchBgColor, condMatchFgColor) {
        this.configuration.conditionCollection.push(createCondition('Condition 1', output, operation, inputValue, false));
        this.configuration.conditionCollection.push(createCondition('Default', 'Default', operation, null, true));
    }*/
    this.addConditions = function (telemetryObject) {
        this.configuration.conditionCollection.push(createCondition(
            'Condition 1',
            telemetryObject.condMatchOutput,
            telemetryObject.condCriteria,
            telemetryObject.watchValue,
            false
        ));
        // Default condition
        this.configuration.conditionCollection.push(createCondition(
            'Default',
            telemetryObject.condDefOutput,
            null,
            null,
            true
        ));
    }
}

function createCondition(name, output, operation, input, isDefault) {
    let o = {};
    o.isDefault = isDefault;
    o.id = createUUID();
    let c = o.configuration = {};
    c.name = name;
    c.output = output;
    c.trigger = 'any';
    c.criteria = (input !== null) ? [createConditionCriteria(operation, input)] : [];
    c.summary = name + ': ' + operation + ' ' + input + '; output ' + output;

    return o;
}

function createConditionCriteria(operation, input) {
    let o = {};
    o.id = createUUID();
    o.telemetry = 'any';
    o.operation = operation;
    o.input = [input];
    o.metadata = 'value';

    return o;
}

// CONDITION WIDGETS
const ConditionWidget = function (conditionSet, telemetryObject) {
    Obj.call(this, 'CW ' + telemetryObject.name, 'conditionWidget', false);
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
        os.styles.push(createStyleObj(cond, telemetryObject));
    }
}
