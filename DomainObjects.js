/********************************** DOMAIN OBJS */
const Container = function () {
    this.addJson = function (child) {
        this[child.identifier.key] = child;
    }
}

const Obj = function (name, type, hasComposition) {
    const id = createUUID();
    const datetime = getCurrentTimeEpoch();

    this.name = restoreEscChars(name);
    this.type = type;
    this.modified = datetime;
    this.location = null;
    this.persisted = datetime;
    this.identifier = createIdentifier(id);

    if (hasComposition) {
        this.composition = [];

        this.addToComposition = function (childIdentifierKey, namespace) {
            this.composition.push(createIdentifier(childIdentifierKey, namespace));
        }
    }

    this.setLocation = function (location) {
        this.location = location.identifier.key;
    }
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
                'telemetry': args.telemetry,
                'operation': args.operation,
                'input': args.input,
                'metadata': args.metadata
            }]
    };
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

function createOpenMCTStyleObj(args = undefined, condId = undefined) {
    // TODO: make sure all functions calling this now pass the right stuff
    const objStyleDefaults = {
        'backgroundColor': '',
        'border': '',
        'color': '',
        'isStyleInvisible': '',
        'output': '',
        'url': ''
    }

    let obj = {};
    if (condId) {
        obj.conditionId = condId;
    }
    obj.style = copyObj(objStyleDefaults);
    if (args) {
        for (const key in objStyleDefaults) {
            if (args[key]) {
                obj.style[key] = args[key];
            }
        }
    }

    return obj;
}

function getNamespace(source) {
    return (source.indexOf('~') != -1) ? 'taxonomy' : '';
}

const TabsView = function (name) {
    Obj.call(this, name, 'tabs', true);
    this.keep_alive = true;
}

const StackedPlot = function (name) {
    Obj.call(this, name, 'telemetry.plot.stacked', true);
    this.configuration = {};
    this.configuration.series = [];

    this.addToSeries = function (telemObj) {
        let seriesObj = {};
        seriesObj.identifier = createIdentifier(telemObj.DataSource, 'taxonomy');
        seriesObj.series = plotSeriesProps(telemObj); // Yes, this is right: there'obj a nested series node in series, for Stacked Plots only

        this.configuration.series.push(seriesObj);
    };
}

const OverlayPlot = function (name) {
    Obj.call(this, name, 'telemetry.plot.overlay', true);
    this.configuration = {};
    this.configuration.series = [];

    this.addToSeries = function (telemObj) {
        let seriesObj = plotSeriesProps(telemObj);
        seriesObj.identifier = createIdentifier(telemObj.DataSource, 'taxonomy');

        this.configuration.series.push(seriesObj);
    };
}

function plotSeriesProps(telemObj) {
    let sObj = {};

    if (telemObj.InterpolateMethod && telemObj.InterpolateMethod.length > 0) {
        sObj.interpolate = telemObj.InterpolateMethod;
    }

    if (telemObj.ShowLimitLines && telemObj.ShowLimitLines.includes('TRUE')) {
        sObj.limitLines = true;
    }

    if (telemObj.MarkerShape && telemObj.MarkerShape.length > 0) {
        sObj.markerShape = telemObj.MarkerShape;
    }

    if (telemObj.MarkerSize && telemObj.MarkerSize.length > 0) {
        sObj.markerSize = telemObj.MarkerSize;
    }

    return sObj;
}

const FlexibleLayout = function (name) {
    // Creates a columns layout with a single container
    Obj.call(this, name, 'flexible-layout', true);
    this.configuration = {};
    this.configuration.containers = [{
        id: createUUID(),
        size: 100
    }];
    this.configuration.containers[0].frames = [];
    this.configuration.rowsLayout = false;

    this.addFrame = function (key, namespace) {
        this.configuration.containers[0].frames.push({
            id: createUUID(),
            domainObjectIdentifier: createIdentifier(key, namespace),
            noFrame: false
        });
    }

    this.setFrameSizes = function () {
        // Call after loop that populates the flex layout
        // Get the number of frames and divide into 100
        const frameSize = Math.floor(100 / this.configuration.containers[0].frames.length);
        for (let i = 0; i < this.configuration.containers[0].frames.length; i++) {
            this.configuration.containers[0].frames[i].size = frameSize;
        }
    }
}

const HyperLink = function (name, argsObj) {
    Obj.call(this, name, 'hyperlink', false);
    this.displayFormat = argsObj.format;
    this.linkTarget = argsObj.target;
    this.url = argsObj.url;
    this.displayText = argsObj.label;
}

const SineWaveGenerator = function (name, argsObj) {
    Obj.call(this, name, 'generator', false);
    this.telemetry = {
        "period": argsObj.period ? argsObj.period : 10,
        "amplitude": argsObj.amplitude ? argsObj.amplitude : 1,
        "offset": argsObj.offset ? argsObj.offset : 0,
        "dataRateInHz": argsObj.dataRateInHz ? argsObj.dataRateInHz : 1,
        "phase": argsObj.phase ? argsObj.phase : 0,
        "randomness": argsObj.randomness ? argsObj.randomness : 0,
        "loadDelay": argsObj.loadDelay ? argsObj.loadDelay : 0,
        "infinityValues": argsObj.infinityValues ? argsObj.infinityValues : false,
        "exceedFloat32": argsObj.exceedFloat32 ? argsObj.exceedFloat32 : false,
        "staleness": argsObj.staleness ? argsObj.staleness : false
    }
}

let objJson, root, alphasItemPlacementTracker, widgetsItemPlacementTracker, folderRoot;

initDomainObjects = function () {
    objJson = {};
    root = objJson.openmct = new Container();
    alphasItemPlacementTracker = {};
    widgetsItemPlacementTracker = {};
    folderRoot = '';
}

function findInComposition(domainObjToSearch, objToFind) {
    // objToFind can be a string or a domain object
    haystackKeys = [];
    if (Array.isArray(domainObjToSearch.composition) && domainObjToSearch.composition.length > 0) {
        for (let i = 0; i < domainObjToSearch.composition.length; i++) {
            haystackKeys.push(domainObjToSearch.composition[0].key);
        }
    }

    try {
        const needleKey = Object.keys(objToFind).length > 0 ? Object.keys(objToFind)[0] : objToFind;
        return haystackKeys.includes(needleKey);
    } catch (er) {
        console.log('objectInComposition er', er);
        return null;
    }
}
