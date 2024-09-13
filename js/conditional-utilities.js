const STYLES_DEFAULTS = {
    'backgroundColor': '',
    'border': '',
    'color': ''
};

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

/***************************************** UNPACKING CSV CONDITION DEFINITIONS */
function stylesFromObj(objIn, set = COND_STYLES_DEFAULTS) {
    const keys = Object.keys(set);
    const objOut = copyObj(set);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (objIn[key]) {
            objOut[key] = objIn[key];
        }
    }

    return objOut;
}

function condObjStylesFromArr(arrIn) {
    /*
    THIS IS DEPRECATED!!
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

function createOpenMCTCondObj(args) {
    /*
    "id": "3fbee1a9-496d-45ed-865e-60f9632a11ec",
    "configuration": {
      "name": "Disabled",
      "output": "Disabled",
      "trigger": "any",
      "criteria": [
        {
          "id": "3f8b53a4-8dc0-4c59-a722-3687dacc70e2",
          "telemetry": "any",
          "operation": "lessThan",
          "input": [
            1
          ],
          "metadata": "value"
        }
      ]
    },
    "summary": "Match if any criteria are met:  any telemetry Value  < 1 "
     */
    const summaryTriggerStrings = {
        'all': 'and',
        'any': 'or'
    }
    const condObj = {};
    condObj.isDefault = args.isDefault;
    condObj.id = createUUID();
    let condSummaryArr = [];


    condObj.configuration = {
        'name': args.name,
        'output': args.output,
        'trigger': args.isDefault ? 'all' : args.trigger,
        'criteria': []
    };

    if (condObj.isDefault) {
        condSummaryArr.push('Scripted default');
    } else {
        for (let i = 0; i < args.criteriaArr.length; i++) {
            const criteriaObj = args.criteriaArr[i];
            const condSummaryStr = criteriaObj.telemetry
                .concat(' ')
                .concat(criteriaObj.metadata)
                .concat(' ')
                .concat(criteriaObj.operation)
                .concat(' ')
                .concat(criteriaObj.input.toString());

            condSummaryArr.push(condSummaryStr);

            let telemetry = convertToOpenMCTTelemPath(criteriaObj.telemetry);
            telemetry = telemetry.includes('~')? createOpenMCTIdentifier(telemetry) : telemetry;

            condObj.configuration.criteria.push(
                {
                    'id': createUUID(),
                    'telemetry': telemetry,
                    'operation': criteriaObj.operation,
                    'input': criteriaObj.input,
                    'metadata': criteriaObj.metadata
                }
            )
        }
    }
    condObj.summary = condSummaryArr.join(' ' + summaryTriggerStrings[condObj.configuration.trigger] + ' ');

    return condObj;
}
function unpackTelemetryObjectCondStyles(telemObj) {
    /*
    THIS IS DEPRECATED!!
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
                objCondPropsOut = stylesFromObj(convertStringToJSON(condStr), COND_STYLES_DEFAULTS);
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
        objCondPropsOut = stylesFromObj(convertStringToJSON(condStr), COND_STYLES_DEFAULTS);
    } else {
        objCondPropsOut = condObjStylesFromArr(condStr.split(','));
    }
    objCondPropsOut.isDefault = true;
    objCondPropsOut.name = 'Default Condition';
    arrTelemObjCondsAndStyles[condKeyName] = objCondPropsOut;

    return arrTelemObjCondsAndStyles;
}
function createOpenMCTCondObjDeprecated(args) {
    /*
    THIS IS DEPRECATED!!!
    "id": "3fbee1a9-496d-45ed-865e-60f9632a11ec",
    "configuration": {
      "name": "Disabled",
      "output": "Disabled",
      "trigger": "any",
      "criteria": [
        {
          "id": "3f8b53a4-8dc0-4c59-a722-3687dacc70e2",
          "telemetry": "any",
          "operation": "lessThan",
          "input": [
            1
          ],
          "metadata": "value"
        }
      ]
    },
    "summary": "Match if any criteria are met:  any telemetry Value  < 1 "
     */

    const condObj = {};
    condObj.isDefault = args.isDefault;
    condObj.id = createUUID();
    condObj.configuration = {
        'name': args.name,
        'output': args.output,
        'trigger': args.isDefault ? 'all' : args.trigger,
        'criteria': args.isDefault ? [] :
            [{
                'id': createUUID(),
                'telemetry': convertToOpenMCTTelemPath(args.telemetry).concat('FOOBAR'),
                'operation': args.operation,
                'input': args.input,
                'metadata': args.metadata
            }]
    };

    console.log('condObj',condObj.configuration);

    condObj.summary = args.isDefault ? 'Scripted: default' :
        'Scripted: match if any criteria are met: '
            .concat(args.telemetry)
            .concat(' telemetry ')
            .concat(args.metadata)
            .concat(' ')
            .concat(args.operation)
            .concat(' ')
            .concat(args.input.toString())

    return condObj;
}
