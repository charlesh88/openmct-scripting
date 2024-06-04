let TELEMETRY_OBJECTS = [];
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
