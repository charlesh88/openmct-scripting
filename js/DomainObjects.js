/******************************************************* DOMAIN OBJS */
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
    this.identifier = createOpenMCTIdentifier(id);
    this.configuration = {
        objectStyles: {
            styles: [],
            staticStyle: {}
        },
        fontStyle: {
            fontSize: 'default',
            font: 'default'
        }
    };

    if (hasComposition) {
        this.composition = [];

        this.addToComposition = function (childIdentifierKey, namespace) {
            this.composition.push(createOpenMCTIdentifier(childIdentifierKey, namespace));
        }
    }

    this.setLocation = function (location) {
        this.location = location.identifier.key;
    }

    this.addStaticStyleForObj = function(argsObj) {
        this.configuration.objectStyles.staticStyle = createOpenMCTStyleObj(argsObj.style);
    }

    this.addCondStylesForObj = function (argsObj) {
        const condSetAndStyles = getCondSetAndStyles(argsObj);
        if (condSetAndStyles) {
            this.configuration.objectStyles = {
                styles: condSetAndStyles.styles,
                conditionSetIdentifier: {
                    namespace: "",
                    key: condSetAndStyles.conditionSetIdentifier
                }
            }
        }

    }
}

/***************************************** CONDITION SETS AND WIDGETS */
const ConditionSet = function (condSetArgsObj) {
    Obj.call(this, condSetArgsObj.setName, 'conditionSet', true);
    this.configuration = {
        conditionTestData: [],
        conditionCollection: []
    };

    this.addCondition = function (condObj) {
        this.configuration.conditionCollection.push(
            createOpenMCTCondObj(condObj)
        );
    }
}

const ConditionWidget = function (argsObj) {
    /* argsObj like:
    {
        name: str,
        style: {},
        styleCondSet: str,
        styleConds: [],
        url: str
    } */

    // console.log('argsObj',argsObj);

    Obj.call(this, argsObj.name, 'conditionWidget', false);

    this.label = argsObj.name;
    this.conditionalLabel = '';
    this.url = argsObj.url? argsObj.url.replace(ESC_CHARS.colon,':') : undefined;x
    this.configuration.useConditionSetOutputAsLabel = argsObj.useConditionSetOutputAsLabel;
    this.addStaticStyleForObj(argsObj);
    this.addCondStylesForObj(argsObj);
}

const TabsView = function (name, keepAlive = true) {
    // keep_alive is the "eager load" setting.
    Obj.call(this, name, 'tabs', true);
    this.keep_alive = keepAlive;
}

const StackedPlot = function (name) {
    Obj.call(this, name, 'telemetry.plot.stacked', true);
    this.configuration = {};
    this.configuration.series = [];

    this.addToSeries = function (telemObj) {
        let seriesObj = {};
        seriesObj.identifier = createOpenMCTIdentifier(telemObj.DataSource, 'taxonomy');
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
        seriesObj.identifier = createOpenMCTIdentifier(telemObj.DataSource, 'taxonomy');

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
            domainObjectIdentifier: createOpenMCTIdentifier(key, namespace),
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

const LADTable = function (name) {
    Obj.call(this, name, 'LadTable', true);
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

initDomainObjects = function () {
    OBJ_JSON = {};
    ROOT = OBJ_JSON.openmct = new Container();
    FOLDER_ROOT = '';
}

/******************************************************* DOMAIN OBJECT HELPER FUNCTIONS */
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
        // console.log('createOpenMCTStyleObj args',args);
        for (const key in objStyleDefaults) {
            if (args[key]) {
                obj.style[key] = args[key];
            }
        }
    }

    return obj;
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
        console.error('objectInComposition er', er);
        return null;
    }
}

function addDomainObject(domainObject, container) {
    // console.log('addDomainObject', domainObject, container);
    ROOT.addJson(domainObject);
    container.addToComposition(domainObject.identifier.key);
    domainObject.setLocation(container);
}
