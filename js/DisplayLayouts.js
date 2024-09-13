function initAlphasItemPlacementTracker() {
    alphasItemPlacementTracker.placeIndex = 0;
    alphasItemPlacementTracker.shiftIndex = 0;
}

function initWidgetsItemPlacementTracker() {
    widgetsItemPlacementTracker.placeIndex = 0;
    widgetsItemPlacementTracker.shiftIndex = 0;
}

function displayLayoutConvertPxToGridUnits(gridUnit, px) {
    // Expects all args to be numbers
    return Math.round(px / gridUnit);
}

// DISPLAY LAYOUT
const DisplayLayout = function (args) {
    Obj.call(this, args.name, 'layout', true);

    this.configuration = {};
    this.configuration.layoutGrid = args.layoutGrid;
    this.configuration.objectStyles = {};
    this.configuration.items = [];

    this.createBaseItem = function (args) {
        return {
            'id': createUUID(),
            'x': 0,
            'y': 0,
            'width': parseInt(args.itemW),
            'height': parseInt(args.itemH),
            "stroke": 'transparent',
            'fontSize': 'default',
            'font': 'default'
        };
    }

    this.addSubObjectView = function (args) {
        const response = {};
        const subObj = this.createBaseItem(args);
        subObj.type = 'subobject-view';
        subObj.identifier = createOpenMCTIdentifier(args.ident);
        subObj.hasFrame = args.hasFrame;

        const posObj = this.calcItemPosition(args);
        const itemPos = posObj.itemPos;
        response.placeIndex = posObj.args.placeIndex;
        response.shiftIndex = posObj.args.shiftIndex;

        subObj.x = itemPos.x;
        subObj.y = itemPos.y;
        this.configuration.items.push(subObj);

        return response;
    }

    this.addSubObjectViewInPlace = function (args) {
        const response = {};
        const subObj = this.createBaseItem(args);
        subObj.type = 'subobject-view';
        subObj.identifier = createOpenMCTIdentifier(args.ident);
        subObj.hasFrame = args.hasFrame;
        subObj.x = args.x;
        subObj.y = args.y;
        this.configuration.items.push(subObj);

        return response;
    }

    this.addTextAndAlphaViewPair = function (args) {
        // Opinionated. Wants to create a text label to the left of an input. Inputs get styled with a border.
        const ALPHA_STYLE = {border: '1px solid #555555'};
        const response = {};
        const combinedArgs = copyObj(args);
        combinedArgs.itemW = args.labelW + config.itemMargin + args.itemW;
        const posObj = this.calcItemPosition(combinedArgs);
        const itemPos = posObj.itemPos;
        response.placeIndex = posObj.args.placeIndex;
        response.shiftIndex = posObj.args.shiftIndex;

        let textArgs = copyObj(args);
        textArgs.x = itemPos.x;
        textArgs.y = itemPos.y;
        textArgs.itemW = args.labelW;
        this.addTextView(textArgs);

        let telemArgs = copyObj(args);
        telemArgs.x = itemPos.x + args.labelW + config.itemMargin;
        telemArgs.y = itemPos.y;
        telemArgs.alphaFormat = args.alphaFormat;
        telemArgs.alphaShowsUnit = args.alphaShowsUnit;
        telemArgs.style = {
            border: ALPHA_STYLE.border
        }
        response.id = this.addTelemetryView(telemArgs).id;

        return response;
    }

    this.addLabel = function (args) {
        const response = {};
        const combinedArgs = copyObj(args);
        combinedArgs.itemW = args.itemW;
        const posObj = this.calcItemPosition(combinedArgs);
        const itemPos = posObj.itemPos;
        response.placeIndex = posObj.args.placeIndex;
        response.shiftIndex = posObj.args.shiftIndex;

        let textArgs = copyObj(args);
        textArgs.x = itemPos.x;
        textArgs.y = itemPos.y;
        textArgs.itemW = combinedArgs.itemW;
        this.addTextView(textArgs);

        return response;
    }

    this.addTextView = function (args) {
        const subObj = this.createBaseItem(args);
        subObj.x = args.x;
        subObj.y = args.y;
        subObj.type = 'text-view';
        subObj.text = args.text;
        this.configuration.objectStyles[subObj.id] = {};
        this.configuration.objectStyles[subObj.id].staticStyle = createOpenMCTStyleObj(args.style);
        this.configuration.objectStyles[subObj.id].styles = [];
        this.configuration.items.push(subObj);

        return subObj;
    }

    this.addImageView = function (args) {
        const subObj = this.createBaseItem(args);
        subObj.x = args.x;
        subObj.y = args.y;
        subObj.width = args.width;
        subObj.height = args.height;
        subObj.url = args.url;
        subObj.type = 'image-view';
        this.configuration.objectStyles[subObj.id] = {};
        this.configuration.objectStyles[subObj.id].staticStyle = createOpenMCTStyleObj(args.style);
        this.configuration.objectStyles[subObj.id].styles = [];
        this.configuration.items.push(subObj);

        return subObj;
    }

    this.addTelemetryView = function (args) {
        const subObj = this.createBaseItem(args);
        subObj.x = args.x;
        subObj.y = args.y;
        subObj.type = 'telemetry-view';
        subObj.identifier = createOpenMCTIdentifier(args.ident, 'taxonomy');
        subObj.displayMode = 'value';
        subObj.value = 'value';
        subObj.format = args.alphaFormat;
        subObj.showUnits = (args.alphaShowsUnit === 'TRUE');
        this.configuration.objectStyles[subObj.id] = {
            'staticStyle': createOpenMCTStyleObj(args.style),
            'styles': []
        };
        this.configuration.items.push(subObj);

        return subObj;
    }

    this.calcItemPosition = function (args) {
        const itemPos = {};
        const itemPlaceMargin = args.placeIndex * config.itemMargin;
        const itemShiftMargin = args.shiftIndex * config.itemMargin;

        if (args.layoutStrategy === 'columns') {
            // Build down first until itemPlaceMargin is reached, then go across
            itemPos.x = (args.placeIndex * args.itemW) + itemPlaceMargin;
            itemPos.y = (args.shiftIndex * args.itemH) + itemShiftMargin;
        } else {
            // Build across first until itemPlaceMargin is reached, then go down
            itemPos.x = (args.shiftIndex * args.itemW) + itemShiftMargin;
            itemPos.y = (args.placeIndex * args.itemH) + itemPlaceMargin;
        }

        if ((args.placeIndex + 1) % args.layoutStrategyNum === 0) {
            args.placeIndex = 0;
            args.shiftIndex += 1;
        } else {
            args.placeIndex += 1;
        }

        return {itemPos, args};
    }

    this.addCondStylesForLayoutObj = function (layoutObjId, argsObj) {
        // Adds an entry into this layout's objectStyles {}
        // Entry is a keyed to the layoutObjId and includes a styles []

        // console.log('argsObj', argsObj);
        const condSetAndStyles = getCondSetAndStyles(argsObj);
        if (condSetAndStyles) {
            this.configuration.objectStyles[layoutObjId] = {
                styles: condSetAndStyles.styles,
                conditionSetIdentifier: {
                    namespace: "",
                    key: condSetAndStyles.conditionSetIdentifier
                }
            }
        }
    }
}
