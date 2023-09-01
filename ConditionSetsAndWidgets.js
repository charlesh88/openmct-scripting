// CONDITION SETS AND CONDITIONS
const ConditionSet = function (telemetryObject) {
    Obj.call(this, 'CS ' + telemetryObject.name, 'conditionSet', true);
    this.configuration = {};
    this.configuration.conditionTestData = [];
    this.configuration.conditionCollection = [];

    this.composition.push(createIdentifier(telemetryObject.dataSource, 'taxonomy'));

    this.addConditions = function (telemetryObject, conditionsArr) {
        for (let i = 1; i < conditionsArr.length; i++) {
            this.configuration.conditionCollection.push(createConditionFromArr(
                'Condition ' + i.toString(),
                false,
                conditionsArr[i]
            ));
        }

        // Default condition
        this.configuration.conditionCollection.push(createConditionFromArr(
            'Default',
            true,
            conditionsArr[0]
        ));
    }

    this.conditionsToArr = function (telemetryObject) {
        let cArr = [];
        // Unpack default condition
        // Output string, bg, fg
        cArr.push(telemetryObject.condDefault.split(","));

        // Unpack conditions 1 - 4
        // Output string, bg, fg, criteria, value
        for (let i = 4; i > 0; i--) {
            const cCond = telemetryObject['cond' + i.toString()];
            if (cCond.length > 0) {
                cArr.push(cCond.split(","));
            }
        }

        return cArr;
    }
}

function createConditionFromArr(name, isDefault, arr) {
    let o = {};
    o.isDefault = isDefault;
    o.id = createUUID();
    o.bgColor = arr[1];
    o.fgColor = arr[2];

    let c = o.configuration = {};
    c.name = name;
    c.output = arr[0];
    c.trigger = (!isDefault) ? arr[3] : 'all';
    c.criteria = (!isDefault) ? [createConditionCriteria(arr[4], arr[5])] : [];
    c.summary = c.name + ' was scripted';

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
    this.label = telemetryObject.name;
    this.conditionalLabel = '';
    this.configuration.useConditionSetOutputAsLabel = (telemetryObject.condWidgetUsesOutputAsLabel === 'TRUE');

    for (const cond of conditionSet.configuration.conditionCollection) {
        if (cond.isDefault) {
            os.selectedConditionId = cond.id;
            os.defaultConditionId = cond.id;
        }
        os.styles.push(createStyleObj(cond));
    }
}
