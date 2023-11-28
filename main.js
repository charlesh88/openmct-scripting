const objJson = {};
let telemetryObjects = [];
const ALPHA_BORDER = '1px solid #555555';
const downloadFilenames = {
    'csv': 'from CSV',
    'prl': 'from Pride procedures'
}
const VALID_PATH = [
    'Viper',
    'yamcs'
];

let config = {};
let alphasItemPlacementTracker = {};
let widgetsItemPlacementTracker = {};
let root = objJson.openmct = new Container();
let folderRoot;
