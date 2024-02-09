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
        seriesObj.series = {}; // Yes, this is right: there's a nested series node in series, for Stacked Plots only

        if (telemObj.InterpolateMethod.length > 0) {
            seriesObj.series.interpolate = telemObj.InterpolateMethod;
        }

        if (telemObj.ShowLimitLines.includes('TRUE')) {
            seriesObj.series.limitLines = true;
        }

        this.configuration.series.push(seriesObj);
    };
}

const OverlayPlot = function(name) {
    Obj.call(this, name, 'telemetry.plot.overlay', true);
    this.configuration = {};
    this.configuration.series = [];

    this.addToSeries = function(telemObj) {
        let seriesObj = {};
        seriesObj.identifier = createIdentifier(telemObj.DataSource, 'taxonomy');

        if (telemObj.InterpolateMethod.length > 0) {
            seriesObj.interpolate = telemObj.InterpolateMethod;
        }

        if (telemObj.ShowLimitLines.includes('TRUE')) {
            seriesObj.limitLines = true;
        }

        this.configuration.series.push(seriesObj);
    };
}
