/*
Code and front-end for an MDB comparison component
Looks for the MDB_EXTRACT local storage key,
If found, loads it.
If not found, provides a link to the ingest page.
 */

let mdbExtractPaths = [];

showMdbStatus = function (haveMdb) {
    const mdbStatus = document.getElementById('mdb-status');
    if (haveMdb) {
        mdbStatus.innerText = 'MDB loaded from local storage';
        mdbStatus.classList.add('--loaded');
    }
}

loadLocalStorageMDB = function () {
    const mdbExtract = JSON.parse(loadLocal('MDB_EXTRACT'));
    for (let i = 0; i < mdbExtract.length; i++) {
        mdbExtractPaths.push(mdbExtract[i][0]);
    }
    // console.log('mdbExtractPaths', mdbExtractPaths);
    showMdbStatus(mdbExtractPaths);
}

document.body.onload = loadLocalStorageMDB();
