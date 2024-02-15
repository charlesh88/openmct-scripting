let telemetryObjects = [];
const ALPHA_BORDER = '1px solid #555555';
const LOCALSTORE_BASE_NAME = 'OPENMCT-SCRIPTING';
const APP_VERSION = '3.6';
const downloadFilenames = {
    'csv': 'from CSV',
    'prl': 'from Pride procedures'
}
const VALID_PATH = [
    'Viper',
    'yamcs'
];

let config = {};

function displayAppVersion() {
    document.getElementById('app-version').innerText = APP_VERSION;
}
function initApp() {
    addNav();
    displayAppVersion();
}

document.body.onload = initApp();

