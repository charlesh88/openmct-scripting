/********************************** DOMAIN OBJS */
const Container = function () {
    this.addJson = function (child) {
        this[child.identifier.key] = child;
    }
}

const Obj = function (name, type, hasComposition) {
    const id = createUUID();
    const datetime = 1661559456808;

    this.name = name;
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

const TabsView = function(name) {
    Obj.call(this, name, 'tabs', true);
    this.keep_alive = true;
}

const StackedPlot = function(name) {
    Obj.call(this, name, 'telemetry.plot.stacked', true);
    this.configuration = {};
    this.configuration.series = [];

    this.addToSeries = function(telemObj) {
        let seriesObj = {};
        seriesObj.identifier = createIdentifier(telemObj.DataSource, 'taxonomy');
        seriesObj.series = plotSeriesProps(telemObj); // Yes, this is right: there's a nested series node in series, for Stacked Plots only

        this.configuration.series.push(seriesObj);
    };
}

const OverlayPlot = function(name) {
    Obj.call(this, name, 'telemetry.plot.overlay', true);
    this.configuration = {};
    this.configuration.series = [];

    this.addToSeries = function(telemObj) {
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

const FlexibleLayout = function(name) {
    // Creates a columns layout with a single container
    Obj.call(this, name, 'flexible-layout', true);
    this.configuration = {};
    this.configuration.containers = [{
        id: createUUID(),
        size: 100
    }];
    this.configuration.containers[0].frames = [];
    this.configuration.rowsLayout = false;

    this.addFrame = function(key, namespace) {
        this.configuration.containers[0].frames.push({
            id: createUUID(),
            domainObjectIdentifier: createIdentifier(key, namespace),
            noFrame: false
        });
    }

    this.setFrameSizes = function() {
        // Call after loop that populates the flex layout
        // Get the number of frames and divide into 100
        const frameSize = Math.floor(100 / this.configuration.containers[0].frames.length);
        for (let i = 0; i < this.configuration.containers[0].frames.length; i++) {
            this.configuration.containers[0].frames[i].size = frameSize;
        }
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
