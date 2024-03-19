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

function displayAppVersion() {
    document.getElementById('app-version').innerText = APP_VERSION;
}

function initApp() {
    addNav();
    displayAppVersion();
}

function resetApp() {

}

document.body.onload = initApp();
