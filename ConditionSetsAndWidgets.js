/***************************************** UNPACKING CSV CONDITION DEFINITIONS */
function condStylesFromObj(objIn) {
    // Newer {property:value} style
    const csdKeys = Object.keys(COND_STYLES_DEFAULTS);
    // Copy the default object so we don't make changes to the defaults!
    const objOut = copyObj(COND_STYLES_DEFAULTS);

    for (let i = 0; i < csdKeys.length; i++) {
        // Iterate through each key and set the value of the current props object
        const key = csdKeys[i];
        if (objIn[key]) {
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
    let condKeyName;
    let condStr;

    // Unpack conditions 1 - 10
    for (let i = 1; i < maxConditions; i++) {
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

    // Unpack default condition last
    condKeyName = 'condDefault';
    condStr = telemObj[condKeyName];
    if (condStr.includes('{')) {
        objCondPropsOut = condStylesFromObj(convertStringToJSON(condStr));
    } else {
        objCondPropsOut = condObjStylesFromArr(condStr.split(','));
    }
    objCondPropsOut.isDefault = true;
    objCondPropsOut.name = 'Default Condition';
    arrTelemObjCondsAndStyles[condKeyName] = objCondPropsOut;

    console.log('unpackTelemetryObjectCondStyles', arrTelemObjCondsAndStyles);
    return arrTelemObjCondsAndStyles;
}

/***************************************** CONDITION SETS AND CONDITIONS */
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
}

/***************************************** CONDITION WIDGETS */
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
    this.label = telemetryObject.name;
    this.conditionalLabel = '';

    if (telemetryObject.cs) {
        os.conditionSetIdentifier = createIdentifier(telemetryObject.cs.identifier.key);
        this.configuration.useConditionSetOutputAsLabel = (telemetryObject.condWidgetUsesOutputAsLabel === 'TRUE');

        for (const cond of telemetryObject.cs.configuration.conditionCollection) {
            if (cond.isDefault) {
                os.selectedConditionId = cond.id;
                os.defaultConditionId = cond.id;
            }
        }
        os.styles = telemetryObject.objStyles; // TODO: may need copyObj here
    }
}
