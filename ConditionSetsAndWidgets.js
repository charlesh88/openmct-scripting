// CONDITION SETS AND CONDITIONS
const COND_STYLES_DEFAULTS = {
    'backgroundColor': '',
    'border': '',
    'color': '',
    'input': [],
    'isDefault': false,
    'metadata': 'value',
    'name': '',
    'operation': '',
    'output': '',
    'telemetry': 'any',
    'trigger': 'any',
    'url': ''
};
const ConditionSet = function (telemetryObject) {
    Obj.call(this, telemetryObject.name, 'conditionSet', true);
    this.configuration = {};
    this.configuration.conditionTestData = [];
    this.configuration.conditionCollection = [];

    this.composition.push(createIdentifier(telemetryObject.dataSource, telemetryObject.dataSource.includes('~') ? 'taxonomy' : ''));

    this.addCondition = function (condArgsObj) {
        const cond = createOpenMCTCondObj(condArgsObj);
        this.configuration.conditionCollection.push(cond);
        return cond.id;
    }
/*
    this.addConditionsFromObjArr = function (condObjArr) {
        // TODO: REFACTOR TO USE NEW OUTPUT STYLE FROM unpackTelemetryObjectCondStyles
        const condObjArrKeys = Object.keys(condObjArr);

        for (let i = 0; i < condObjArrKeys.length; i++) {
            const objCondArgs = condObjArr[condObjArrKeys[i]];
            // objCondArgs will be an object with .name, .output, etc.
            // The default condition should be first
            this.configuration.conditionCollection.push(createConditionFromObj(objCondArgs))
        }


        // Counts on the last condition in conditionsObjArr to be the default
        for (let i = 0; i < conditionsObjArr.length; i++) {
            conditionsObjArr.conditionName = 'Condition '.concat(i.toString());
            this.configuration.conditionCollection.push(createConditionFromObj(conditionsObjArr[i]));
        }
    }*/
    /*
        this.conditionsToObjArr = function (telemetryObject) {
            // TODO: DEPRECATE THIS, REPLACE WITH unpackTelemetryObjectCondStyles
            console.error("conditionsToObjArr: DON'T USE THIS!");
            return false;

            const maxConditions = 10;
            let condObjArr = [];

            // Unpack conditions 1 - 10
            // Output string, bg, fg, criteria, value
            for (let i = 1; i < maxConditions; i++) {
                const condStr = telemetryObject['cond' + i.toString()];

                if (condStr && condStr.length > 0) {
                    if (condStr.includes('{')) {
                        condObjArr.push(conditionObjStrToObj(condStr));
                    } else {
                        condObjArr.push(conditionStrToObj(condStr));
                    }
                }
            }

            // Unpack default condition
            condObjArr.push(conditionStrToObj(telemetryObject.condDefault));

            return condObjArr;
        }
        */
}

/***************************************** UNPACKING CSV CONDITION DEFINITIONS */
function condStylesFromObj(objIn) {
    // Newer {property:value} style
    const csdKeys = Object.keys(COND_STYLES_DEFAULTS);
    // Copy the default object so we don't make changes to the defaults!
    const objOut = copyObj(COND_STYLES_DEFAULTS);

    // console.log('condStylesFromObj objIn', objIn);

    for (let i = 0; i < csdKeys.length; i++) {
        // Iterate through each key and set the value of the current props object
        const key = csdKeys[i];
        if (objIn[key]) {
            // console.log('Found ', key, objIn[key]);
            objOut[key] = objIn[key];
        }
    }

    return objOut;
}

function condObjStylesFromArr(arrIn) {
    /*
    Legacy comma-sepped array string. Unpack and set props the old way.
    Arr indexes:
    0: output string
    1: bgColor
    2: fgColor
    3: trigger
    4: operation
    5: input value 1 (OPTIONAL)
    6: input value 2 (OPTIONAL)
    */

    // Copy the default object so we don't make changes to the defaults!
    const objOut = copyObj(COND_STYLES_DEFAULTS);

    objOut.output = arrIn[0];
    objOut.backgroundColor = arrIn[1];
    objOut.color = arrIn[2];

    if (arrIn.length > 3) {
        objOut.trigger = arrIn[3];
        objOut.operation = arrIn[4];
    }

    if (arrIn.length > 5) {
        const input1 = !isNaN(Number(arrIn[5])) ? Number(arrIn[5]) : arrIn[5];
        const input2 = !isNaN(Number(arrIn[6])) ? Number(arrIn[6]) : arrIn[6];
        const inputArr = [input1];
        if (input2) {
            inputArr.push(input2)
        }
        objOut.input = inputArr;
    }

    return objOut;
}
function unpackTelemetryObjectCondStyles(telemObj) {
    /*
    Expects condDefault, cond1 - cond10
    Support legacy approach like this: `Disab,#666666,#ffffff,any,enumValueIs,0`
    Also support new approach using object string, like:
        {output:Default,operation:between,input:[-1,1],metadata:value}
        {output:Default,backgroundColor:#666666,color:#ffffff,border:1px solid #555555,telemetry:any,operation:between,input:[-1,1],metadata:value}

   Return a keyed array of objects with condition and style properties and values that is used by
   both condition and style creation.
     */

    const arrTelemObjCondsAndStyles = [];

    const maxConditions = 10;
    let objCondPropsOut = {};

    // Unpack default condition
    let condKeyName = 'condDefault';
    let condStr = telemObj[condKeyName];
    if (condStr.includes('{')) {
        objCondPropsOut = condStylesFromObj(convertStringToJSON(condStr));
    } else {
        objCondPropsOut = condObjStylesFromArr(condStr.split(','));
    }
    objCondPropsOut.isDefault = true;
    objCondPropsOut.name = 'Default Condition';
    arrTelemObjCondsAndStyles[condKeyName] = objCondPropsOut;

    // Unpack conditions 1 - 10
    for (let i = 1; i < maxConditions; i++) {
        // const objCondPropsOut = {}; // Reset
        condKeyName = 'cond' + i.toString();
        condStr = telemObj[condKeyName];

        if (condStr && condStr.length > 0) {
            if (condStr.includes('{')) {
                objCondPropsOut = condStylesFromObj(convertStringToJSON(condStr));
            } else {
                objCondPropsOut = condObjStylesFromArr(condStr.split(','));
            }

            objCondPropsOut.name = 'Condition '.concat(i.toString());
            arrTelemObjCondsAndStyles[condKeyName] = objCondPropsOut;
        }
    }
    console.log('unpackTelemetryObjectCondStyles', arrTelemObjCondsAndStyles);
    return arrTelemObjCondsAndStyles;
}

/***************************************** CONDITION OBJECT CREATION AND STRUCTURE */
function createConditionFromObj(argsObj) {
    // TODO: FACTOR THIS OUT, REPLACE WITH
    /*
    Used by csv-conditional-graphics AND csv-to-matrix.
    */

    let o = {};
    o.isDefault = argsObj.isDefault ? argsObj.isDefault : false;
    o.id = argsObj.id ? argsObj.id : createUUID();
    // o.bgColor = argsObj.bgColor ? argsObj.bgColor : '';
    // o.fgColor = argsObj.fgColor ? argsObj.fgColor : '';

    /*

    o.id = createUUID();
    o.telemetry = 'any';
    o.operation = argsObj.operation;
    o.input = (Array.isArray(argsObj.input)) ? argsObj.input : argsObj.inputArr;
    o.metadata = argsObj.metadata ? argsObj.metadata : 'value';

     */


    o.configuration = {
        'name': argsObj.name, 'output': argsObj.output, 'trigger': argsObj.trigger, 'criteria': [{
            'id': createUUID(),
            'telemetry': argsObj.telemetry,
            'operation': argsObj.operation,
            'input': argsObj.input,
            'metadata': argsObj.metadata
        }]
    }


    let c = o.configuration = {};
    c.name = argsObj.name ? argsObj.name : 'Unnamed Condition';
    c.output = argsObj.output ? argsObj.output : '';
    c.trigger = argsObj.trigger ? argsObj.trigger : 'all';

    argsObj.inputArr = conditionInputStrToArr(argsObj.operation, argsObj.input);
    c.criteria = (!argsObj.isDefault) ? [createConditionCriteriaObj(argsObj)] : [];
    c.summary = c.name + ' was scripted';

    return o;
}

function conditionInputStrToArr(operation, inputStr) {
    // Expect .operation and .input, like "10" or "-10,10"
    let inputArr = [];
    if (!inputStr) {
        return inputArr;
    }
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

function createConditionCriteriaObj(argsObj) {
    // TODO; REFACTOR THIS OUT, REPLACED BY createConditionFromObj()
    let o = {};
    // console.log('createConditionCriteriaObj', argsObj);

    o.id = createUUID();
    o.telemetry = 'any';
    o.operation = argsObj.operation;
    o.input = (Array.isArray(argsObj.input)) ? argsObj.input : argsObj.inputArr;
    o.metadata = argsObj.metadata ? argsObj.metadata : 'value';

    return o;
}

/***************************************** UTILITY */
function isNumericConditionOperation(op) {
    const arrNumericOperations = ['equalTo', 'greaterThan', 'lessThan', 'greaterThanOrEq', 'lessThanOrEq', 'between', 'notBetween', 'enumValueIs', 'enumValueIsNot'];
    return arrNumericOperations.includes(op);
}

// CONDITION WIDGETS
/*const ConditionWidgetOld = function (conditionSet, telemetryObject, argsObj) {
    // TODO: add argsObj.link to the widgets url property
    Obj.call(this, 'CW ' + telemetryObject.name, 'conditionWidget', false);
    this.configuration = {};
    let os = this.configuration.objectStyles = {};
    os.styles = [];
    os.staticStyle = createOpenMCTStyleObj();
    os.conditionSetIdentifier = createIdentifier(conditionSet.identifier.key);
    this.label = telemetryObject.name;
    this.conditionalLabel = '';
    this.configuration.useConditionSetOutputAsLabel = (telemetryObject.condWidgetUsesOutputAsLabel === 'TRUE');

    for (const cond of conditionSet.configuration.conditionCollection) {
        if (cond.isDefault) {
            os.selectedConditionId = cond.id;
            os.defaultConditionId = cond.id;
        }
        os.styles.push(createOpenMCTStyleObj(cond));
    }
}*/

const ConditionWidget = function (telemetryObject) {
    /* TODO:
        - add argsObj.link to the widgets url property
        - make sure all functions calling this now pass the right stuff
    */
    Obj.call(this, 'CW ' + telemetryObject.name, 'conditionWidget', false);
    this.configuration = {};
    let os = this.configuration.objectStyles = {};
    os.styles = [];
    os.staticStyle = createOpenMCTStyleObj();
    os.conditionSetIdentifier = createIdentifier(telemetryObject.cs.identifier.key);
    this.label = telemetryObject.name;
    this.conditionalLabel = '';
    this.configuration.useConditionSetOutputAsLabel = (telemetryObject.condWidgetUsesOutputAsLabel === 'TRUE');

    for (const cond of telemetryObject.cs.configuration.conditionCollection) {
        if (cond.isDefault) {
            os.selectedConditionId = cond.id;
            os.defaultConditionId = cond.id;
        }
    }

    os.styles = telemetryObject.objStyles; // TODO: may need copyObj here
}
