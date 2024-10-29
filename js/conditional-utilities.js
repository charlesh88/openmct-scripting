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
function stylesFromObj(objIn, set = COND_STYLES_DEFAULTS) {1
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
            let condSummaryStr = criteriaObj.telemetry
                .concat(' ')
                .concat(criteriaObj.metadata)
                .concat(' ')
                .concat(criteriaObj.operation)

            if (criteriaObj.input) {
                condSummaryStr.concat(' ').concat(criteriaObj.input.toString());
            }

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
