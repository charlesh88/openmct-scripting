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
        const so = this.createBaseItem(args);
        so.type = 'subobject-view';
        so.identifier = createIdentifier(args.ident);
        so.hasFrame = args.hasFrame;

        const itemPos = this.calcItemPosition(args.itemW, args.itemH, args.layoutStrategy, args.layoutStrategyNum);
        so.x = itemPos.x;
        so.y = itemPos.y;
        this.configuration.items.push(so);
    }

    this.addTextAndAlphaViewPair = function (args) {
        let combinedW = args.labelW + config.itemMargin + args.itemW;

        const itemPos = this.calcItemPosition(combinedW, args.itemH, args.layoutStrategy, args.layoutStrategyNum);

        let textArgs = copyObj(args);
        textArgs.x = itemPos.x;
        textArgs.y = itemPos.y;
        textArgs.itemW = args.labelW;
        this.addTextView(textArgs);

        let telemArgs = copyObj(args);
        telemArgs.x = itemPos.x + args.labelW + config.itemMargin;
        telemArgs.y = itemPos.y;
        this.addTelemetryView(telemArgs);
    }

    this.addTextView = function (args) {
        const so = this.createBaseItem(args);
        so.x = args.x;
        so.y = args.y;
        so.type = 'text-view';
        so.text = args.text;
        this.configuration.items.push(so);
    }

    this.addTelemetryView = function (args) {
        const so = this.createBaseItem(args);
        so.x = args.x;
        so.y = args.y;
        so.type = 'telemetry-view';
        so.identifier = createIdentifier(args.ident, 'taxonomy');
        so.displayMode = 'value';
        so.value = 'value';
        so.format = '%9.4f'; // This may not be right

        let styleObj = createStyleObj();
        styleObj.style.border = '1px solid #666666';
        this.configuration.objectStyles[so.id] = {
            staticStyle: styleObj
        };
        this.configuration.items.push(so);
    }

    this.calcItemPosition = function (itemW, itemH, layoutStrategy, layoutStrategyNum) {
        let itemPos = {};
        const itemPlaceMargin = itemPlaceIndex * config.itemMargin;
        const itemShiftMargin = itemShiftIndex * config.itemMargin;

        if (layoutStrategy === 'columns') {
            // Build down first until itemPlaceMargin is reached, then go across
            itemPos.x = (itemPlaceIndex * itemW) + itemPlaceMargin;
            itemPos.y = (itemShiftIndex * itemH) + itemShiftMargin;
        } else {
            // Build across first until itemPlaceMargin is reached, then go down
            itemPos.x = (itemShiftIndex * itemW) + itemShiftMargin;
            itemPos.y = (itemPlaceIndex * itemH) + itemPlaceMargin;
        }

        if ((itemPlaceIndex + 1) % layoutStrategyNum === 0) {
            itemPlaceIndex = 0;
            itemShiftIndex += 1;
        } else {
            itemPlaceIndex += 1;
        }

        return itemPos;
    }
}
