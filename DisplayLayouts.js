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
            "stroke": '',
            "fill": '',
            "color": '',
            'fontSize': 'default',
            'font': 'default'
        };
    }

    this.addSubObjectView = function (args) {
        const response = {};
        const subObj = this.createBaseItem(args);
        subObj.type = 'subobject-view';
        subObj.identifier = createIdentifier(args.ident);
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

    this.addTextAndAlphaViewPair = function (args) {
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
        response.id = this.addTelemetryView(telemArgs).id;

        return response;
    }

    this.addLabel = function (args) {
        // console.log('addLabel',args);
        const response = {};
        const combinedArgs = copyObj(args);
        combinedArgs.itemW = args.itemW;
        const posObj = this.calcItemPosition(combinedArgs);

        // console.log(posObj);

        const itemPos = posObj.itemPos;
        response.placeIndex = posObj.args.placeIndex;
        response.shiftIndex = posObj.args.shiftIndex;

        let textArgs = copyObj(args);
        textArgs.x = itemPos.x;
        textArgs.y = itemPos.y;
        textArgs.itemW = combinedArgs.itemW;
        textArgs.bgColor = STEP_LABEL_STYLE.bgColor;
        textArgs.fgColor = STEP_LABEL_STYLE.fgColor;
        this.addTextView(textArgs);

        return response;
    }

    this.addTextView = function (args) {
        const subObj = this.createBaseItem(args);
        subObj.x = args.x;
        subObj.y = args.y;
        subObj.type = 'text-view';
        subObj.text = args.text;
        if (args.bgColor || args.fgColor) {
            this.configuration.objectStyles[subObj.id] = {};
            this.configuration.objectStyles[subObj.id].staticStyle = createStyleObj({
                bgColor: args.bgColor? args.bgColor : '',
                fgColor: args.fgColor? args.fgColor : ''
            });
            this.configuration.objectStyles[subObj.id].styles = [];
        }
        this.configuration.items.push(subObj);
    }

    this.addTelemetryView = function (args) {
        const subObj = this.createBaseItem(args);
        subObj.x = args.x;
        subObj.y = args.y;
        subObj.type = 'telemetry-view';
        subObj.identifier = createIdentifier(args.ident, 'taxonomy');
        subObj.displayMode = 'value';
        subObj.value = 'value';
        subObj.format = args.alphaFormat;
        subObj.showUnits = (args.alphaShowsUnit === 'TRUE');

        this.configuration.objectStyles[subObj.id] = {};
        this.configuration.objectStyles[subObj.id].staticStyle = createStyleObj({border: ALPHA_BORDER});
        this.configuration.objectStyles[subObj.id].styles = [];
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

        return { itemPos, args };
    }
}
