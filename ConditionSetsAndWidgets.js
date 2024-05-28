// CONDITION SETS AND CONDITIONS
const ConditionSet = function (telemetryObject) {
    Obj.call(this, telemetryObject.name, 'conditionSet', true);
    this.configuration = {};
    this.configuration.conditionTestData = [];
    this.configuration.conditionCollection = [];

    this.composition.push(createIdentifier(
        telemetryObject.dataSource,
        telemetryObject.dataSource.includes('~') ? 'taxonomy' : ''
    ));

    this.addConditionsFromObjArr = function(conditionsObjArr) {
        // Counts on the last condition in conditionsObjArr to be the default
        for (let i = 0; i < conditionsObjArr.length; i++) {
            conditionsObjArr.conditionName = 'Condition '.concat(i.toString());
            this.configuration.conditionCollection.push(createConditionFromObj(
                conditionsObjArr[i]
            ));
        }
    }

    this.conditionsToObjArr = function(telemetryObject) {
        const totalConditions = 10;
        let condObjArr = [];

        // Unpack conditions 1 - 10
        // Output string, bg, fg, criteria, value
        for (let i = 1; i < totalConditions; i++) {
            const condStr = telemetryObject['cond' + i.toString()];

            if (condStr && condStr.length > 0) {
                condObjArr.push(conditionStrToObj(condStr));
            }
        }

        // Unpack default condition
        condObjArr.push(conditionStrToObj(telemetryObject.condDefault));

        return condObjArr;
    }
}

/***************************************** UNPACKING CSV CONDITION DEFINITIONS */
function conditionStrToObj(condStr) {
    /*
    Used by csv-to-matrix.

    condStr like:
    -,#444444,#ffffff
    NOM,#009900,#ffffff,any,isUndefined
    NOM,#009900,#ffffff,any,between,-10, 10

    arr indexes:
    0: output string
    1: bgColor
    2: fgColor
    3: border
    4: trigger
    5: operation
    6: input value 1 (OPTIONAL)
    7: input value 2 (OPTIONAL)
     */
    const condArr = condStr.split(',');
    let condObj = {
        'isDefault': true,
        'output': condArr[0],
        'bgColor': condArr[1],
        'fgColor': condArr[2],
        'border': condArr[3]
    }
    if (condArr.length > 4) {
        condObj.isDefault = false;
        condObj.trigger = condArr[4];
        condObj.operation = condArr[5];
        condObj.inputArr = [];
    }
    if (condArr.length > 6) {
        // There are input(s). Make into a string and add as a string
        condObj.input = condArr[6]
            .concat(condArr.length > 7? ','.concat(condArr[7]) : '');
    }

    return condObj;
}

/***************************************** CONDITION OBJECT CREATION AND STRUCTURE */
function createConditionFromObj(argsObj) {
    /*
    Used by csv-conditional-graphics AND csv-to-matrix.
    */

    let o = {};
    o.isDefault = argsObj.isDefault ? argsObj.isDefault : false;
    o.id = argsObj.id ? argsObj.id : createUUID();
    o.bgColor = argsObj.bgColor ? argsObj.bgColor : '';
    o.fgColor = argsObj.fgColor ? argsObj.fgColor : '';

    let c = o.configuration = {};
    c.name = argsObj.name ? argsObj.name : 'Unnamed Condition';
    c.output = argsObj.output ? argsObj.output : '';
    c.trigger = argsObj.trigger ? argsObj.trigger : 'all';

    argsObj.inputArr = conditionInputStrToArr(argsObj.operation, argsObj.input);
    c.criteria = (!argsObj.isDefault) ? [createConditionCriteriaFromObj(argsObj)] : [];
    c.summary = c.name + ' was scripted';

    return o;
}

function conditionInputStrToArr(operation, inputStr) {
    // Expect .operation and .input, like "10" or "-10,10"
    let inputArr = [];
    if (!inputStr) { return inputArr; }
    if (isNumericConditionOperation(operation)) {
        // Convert to numbers
        if (inputStr.includes(',')) {
            const strArr = inputStr.split(',');
            inputArr[0] = parseFloat(strArr[0]);
            inputArr[1] = parseFloat(strArr[1]);
        } else {
            inputArr[0] = parseFloat(inputStr);
        }
    } else {
        // Set as an array with a string
        inputArr = [inputStr];
    }
    return inputArr;
}

function createConditionCriteriaFromObj(argsObj) {
    let o = {};
    // console.log('createConditionCriteriaFromObj', argsObj);

    o.id = createUUID();
    o.telemetry = 'any';
    o.operation = argsObj.operation;
    o.input = argsObj.inputArr;
    o.metadata = argsObj.metadata ? argsObj.metadata : 'value';

    return o;
}

/***************************************** UTILITY */
function isNumericConditionOperation(op) {
    const arrNumericOperations = [
        'equalTo',
        'greaterThan',
        'lessThan',
        'greaterThanOrEq',
        'lessThanOrEq',
        'between',
        'notBetween',
        'enumValueIs',
        'enumValueIsNot'
    ];
    return arrNumericOperations.includes(op);
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
