// CONDITION SETS AND CONDITIONS
const ConditionSet = function (telemetryObject) {
    Obj.call(this, 'CS ' + telemetryObject.name, 'conditionSet', true);
    this.configuration = {};
    this.configuration.conditionTestData = [];
    this.configuration.conditionCollection = [];

    this.composition.push(createIdentifier(telemetryObject.dataSource, 'taxonomy'));

    this.addConditions = function (telemetryObject, conditionsArr) {
        for (let i = 0; i < conditionsArr.length - 1; i++) {
            this.configuration.conditionCollection.push(createConditionFromArr(
                'Condition ' + i.toString(),
                false,
                conditionsArr[i]
            ));
        }

        // Default condition, will be last
        this.configuration.conditionCollection.push(createConditionFromArr(
            'Default',
            true,
            conditionsArr[conditionsArr.length - 1]
        ));
    }

    this.conditionsToArr = function (telemetryObject) {
        const totalConditions = 10;
        // console.log('telemetryObject',telemetryObject);
        let cArr = [];

        // Unpack conditions 1 - 10
        // Output string, bg, fg, criteria, value
        for (let i = 1; i < totalConditions; i++) {
            const cCond = telemetryObject['cond' + i.toString()];
            if (cCond && cCond.length > 0) {
                console.log('cCond', cCond);
                cArr.push(cCond.split(","));
            }
        }

        // Unpack default condition
        cArr.push(telemetryObject.condDefault.split(","));

        console.log('cArr', cArr);
        return cArr;
    }
}

function createConditionFromArr(name, isDefault, arr) {
    const numericOps = [
        'equalTo',
        'greaterThan',
        'lessThan',
        'greaterThanOrEq',
        'lessThanOrEq',
        'between',
        'notBetween',
        'enumValueIs',
        'enumValueIsNot'
    ]
    const operation = arr[4];
    let arrInput = [];

    if (numericOps.includes(operation)) {
        arrInput = arr.length > 6 ? [
            parseFloat(arr[5]),
            parseFloat(arr[6])
        ] : [parseFloat(arr[5])];

        console.log('Its a numeric op: ', arrInput);
    } else {
        arrInput = [operation];
    }

    let o = {};
    o.isDefault = isDefault;
    o.id = createUUID();
    o.bgColor = arr[1];
    o.fgColor = arr[2];

    let c = o.configuration = {};
    c.name = name;
    c.output = arr[0];
    c.trigger = (!isDefault) ? arr[3] : 'all';
    c.criteria = (!isDefault) ? [createConditionCriteria(operation, arrInput)] : [];
    c.summary = c.name + ' was scripted';

    console.log('createConditionFromArr', o);

    return o;
}

function createConditionCriteria(operation, arrInput) {
    let o = {};
    o.id = createUUID();
    o.telemetry = 'any';
    o.operation = operation;
    o.input = arrInput;
    o.metadata = 'value';

    return o;
}

// CONDITION WIDGETS
const ConditionWidget = function (conditionSet, telemetryObject, argsObj) {
    // TODO: add argsObj.link to the widgets url property
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
