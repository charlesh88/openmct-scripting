const OUTPUT_BASE_NAME_KEY = '_MDB_BASE_NAME';
// let arrPathsAndRefs = [];
let gArrStrPathsAndRefs = [];
const MDB_CONFIG = {
    // Stands in for config found in yamcs.viper.yaml
    'ground_systems': '/ViperGround',
    'rover_systems': '/ViperRover'
}

downLoadMDB = function () {
    const filename = config.outputBaseName.concat(' - MDB.csv');
    const list = gArrStrPathsAndRefs.join('\n');
    const file = new File([list], filename, {type: 'text/csv'});
    downloadFile(file);
    return false;
}

document.getElementById("inputXML").addEventListener("change", function (ev) {
    ingestXMLFiles(ev);
}, false);

function ingestXMLFiles(event) {
    let readers = [];
    let filePaths = [];
    for (const file of event.target.files) {
        filePaths.push(file.webkitRelativePath);
        readers.push(readFileAsText(file));
    }

    outputMsg('MDB file ingestion started started...');
    Promise.all(readers).then((values) => {
        processInputXMLs(filePaths, values);
    });
}

processInputXMLs = function (filePaths, fileContentArr) {
    let arrPathsAndRefs = [];
    let xmlFileCntr = 0;

    for (let i = 0; i < fileContentArr.length; i++) {
        const filePath = filePaths[i];
        const fileContent = fileContentArr[i];
        const pathKeys = Object.keys(MDB_CONFIG);
        let pathRoot;


        for (key in pathKeys) {
            const curKey = pathKeys[key];

            if (filePath.includes(curKey.toString())) {
                pathRoot = MDB_CONFIG[curKey];
            }
        }

        if (filePath.includes('.xml')) {
            xmlFileCntr++;
            outputMsg(filePath + ' ingested.');
            arrPathsAndRefs.push(...processInputXML(fileContent, pathRoot));
        }
    }

    arrPathsAndRefs.sort((a, b) => {
        return a[0].localeCompare(b[0]);
    });

    outputMsg(lineSepStr);
    outputMsg('MDB file ingestion complete. '
        .concat(arrPathsAndRefs.length.toString())
        .concat(' paths found in ')
        .concat(xmlFileCntr)
        .concat(' files.')
    );

    console.log('arrPathsAndRefs', arrPathsAndRefs);
    config.outputBaseName = 'MDB Extract';
    if (!storeLocal(LOCALSTORE_MDB_EXTRACT, JSON.stringify(arrPathsAndRefs))) {
       alert('Not enough room in localstorage to store extracted mdb data.');
    }

    gArrStrPathsAndRefs = arrPathsAndRefs;
    btnDownloadTelem.removeAttribute('disabled');
    showMdbStatus(true);
}

function processInputXML(xmlString, pathRoot) {
    function traverseXML(node, path = '', paths = []) {
        const nodeName = node.nodeName;
        const nodeAttrName = node.getAttribute('name');

        const namedNodes = [
            'SpaceSystem',
            'AggregateParameterType',
            'EnumeratedParameterType',
            'Member',
            'Parameter'
        ];

        const endNodes = [
            'EnumeratedParameterType',
            'Member',
            'Parameter'
        ];

        const addToPath = (namedNodes.includes(nodeName));
        const separator = nodeName === 'Member' ? '.' : '/';

        let currentPath = addToPath ? separator.concat(nodeAttrName) : '';

        if (path) {
            currentPath = path + currentPath;
        }

        if (addToPath && endNodes.includes(nodeName)) {
            const nodeAttrType = node.getAttribute('typeRef');
            paths.push([currentPath, nodeAttrType]);
        }

        // Recursively traverse child nodes
        for (let i = 0; i < node.childNodes.length; i++) {
            const childNode = node.childNodes[i];
            // Only traverse element nodes
            if (childNode.nodeType === 1) {
                traverseXML(childNode, currentPath, paths);
            }
        }

        return paths;
    }

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    const nodePaths = traverseXML(xmlDoc.documentElement, pathRoot);
    return nodePaths;
}
