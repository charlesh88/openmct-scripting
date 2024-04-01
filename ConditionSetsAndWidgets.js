// CONDITION SETS AND CONDITIONS
const ConditionSet = function (telemetryObject) {
    Obj.call(this, telemetryObject.name, 'conditionSet', true);
    this.configuration = {};
    this.configuration.conditionTestData = [];
    this.configuration.conditionCollection = [];

    this.composition.push(createIdentifier(telemetryObject.dataSource, telemetryObject.dataSource.includes('~') ? 'taxonomy' : ''));

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
    /* arr:
    0: desc
    1: bgColor
    2: fgColor
    3: trigger [any | all]
    4: operation (between, greaterThan, etc.)
    5: input (value | ###,###)
    6: metadata ('' | 'sin')
    */
    let o = {};
    o.isDefault = isDefault;
    o.id = createUUID();
    o.bgColor = arr[1];
    o.fgColor = arr[2];

    let c = o.configuration = {};
    c.name = name;
    c.output = arr[0];
    c.trigger = (!isDefault) ? arr[3] : 'all';
    c.criteria = (!isDefault) ? [createConditionCriteria(arr[4], arr[5], arr[6])] : [];
    c.summary = c.name + ' was scripted';

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

function createConditionCriteria(operation, input, metadata) {
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
