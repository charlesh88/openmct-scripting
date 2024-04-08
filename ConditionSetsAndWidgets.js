// CONDITION SETS AND CONDITIONS
const ConditionSet = function (telemetryObject) {
    Obj.call(this, telemetryObject.name, 'conditionSet', true);
    this.configuration = {};
    this.configuration.conditionTestData = [];
    this.configuration.conditionCollection = [];

    this.composition.push(createIdentifier(
        telemetryObject.dataSource,
        telemetryObject.dataSource.includes('~')? 'taxonomy' : ''
    ));

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

        return cArr;
    }
}

function createConditionFromArr(name, isDefault, arr) {
    /*
    arr indexes:
    0: output string
    1: bgColor
    2: fgColor
    3: trigger
    4: operation
    5: input value 1 (OPTIONAL)
    6: input value 2 (OPTIONAL)
     */


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

    } else if (arr.length > 5) {
        arrInput = [arr[5]];
    } else {
        arrInput = [];
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

    // console.log('createConditionFromArr', o);

    return o;
}

function createConditionFromObj(argsObj) {
    let o = {};
    o.isDefault = argsObj.isDefault ? argsObj.isDefault : false;
    o.id = argsObj.id ? argsObj.id : createUUID();
    o.bgColor = argsObj.bgColor ? argsObj.bgColor : '';
    o.fgColor = argsObj.fgColor ? argsObj.fgColor : '';

    let c = o.configuration = {};
    c.name = argsObj.name ? argsObj.name : 'Unnamed Condition';
    c.output = argsObj.output ? argsObj.output : '';
    c.trigger = argsObj.outptriggerut ? argsObj.trigger : 'all';
    c.criteria = (!argsObj.isDefault) ? [createConditionCriteriaFromObj(argsObj)] : [];
    c.summary = c.name + ' was scripted';

    return o;
}

function createConditionCriteria(operation, input) {
    let o = {};
    isNumericOp = function(operation) {
        const arrNumericOperations = [
                'than',
                'equal',
                'between',
                'enumvalue'
            ];
        return arrNumericOperations.includes(operation.toLowerCase());
    }

    let arrInput = [];

    if (input.includes(',')) {
        arrInput = input.split(',').map(num => parseFloat(num));
    } else if (isNumericOp(operation)) {
        arrInput.push(parseFloat(input));
    } else {
        arrInput.push(input);
    }

    o.id = createUUID();
    o.telemetry = 'any';
    o.operation = operation;
    o.input = arrInput;
    o.metadata = metadata ? metadata : 'value';

    return o;
}

function createConditionCriteriaFromObj(argsObj, operation, input, metadata) {
    let o = {};
    isNumericOp = function(op) {
        const arrNumericOperations = [
            'than',
            'equal',
            'between',
            'enumvalue'
        ];
        return arrNumericOperations.includes(op.toLowerCase());
    }

    let arrInput = [];

    if (argsObj.input.includes(',')) {
        arrInput = argsObj.input.split(',').map(num => parseFloat(num));
    } else if (isNumericOp(argsObj.operation)) {
        arrInput.push(parseFloat(argsObj.input));
    } else {
        arrInput.push(argsObj.input);
    }

    o.id = createUUID();
    o.telemetry = 'any';
    o.operation = argsObj.operation;
    o.input = arrInput;
    o.metadata = argsObj.metadata ? argsObj.metadata : 'value';

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
