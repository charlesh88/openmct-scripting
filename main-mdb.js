/* TODOs
- Add type per parameter if possible
*/

const OUTPUT_BASE_NAME_KEY = '_MDB_BASE_NAME';
const lineSepStr = '------------------------------------------------';
let globalArrUniquePaths = [];
let globalArrPathsAndRefs = [];
const MDB_CONFIG = {
    // Stands in for config found in yamcs.viper.yaml
    'ground_systems': '/ViperGround',
    'rover_systems': '/ViperRover'
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

    outputMsg('Valid files found to process:');
    // Trigger Promises
    Promise.all(readers).then((values) => {
        // values will be an array that contains an item
        // with the text of every selected file
        // ["File1 Content", "File2 Content" ... "FileN Content"]
        processInputXMLs(filePaths, values);
    });
}

processInputXMLs = function (filePaths, fileContentArr) {
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
            outputMsg(filePath);
            globalArrUniquePaths = globalArrUniquePaths.concat(processInputXML(fileContent, pathRoot));
        }
    }

    globalArrUniquePaths.sort((a, b) => {
        return a[0].localeCompare(b[0]);
    });
    globalArrUniquePaths = ([['Path', 'Data Type']]).concat(globalArrUniquePaths);
    outputMsg(globalArrUniquePaths.length.toString()
        .concat(' paths found in ')
        .concat(xmlFileCntr)
        .concat(' files.')
    );
    console.log('globalArrUniquePaths', globalArrUniquePaths);
    config.outputBaseName = 'MDB Extract';
    if (!storeLocal(LOCALSTORE_MDB_EXTRACT, JSON.stringify(globalArrUniquePaths))) {
       alert('Not enough room in localstorage to store extracted mdb data.');
    }
    btnDownloadTelemList.removeAttribute('disabled');
    showMdbStatus(true);
}

/******************** CHATGPT START */
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
        /*        const unNamedNodes = [
                    'root',
                    'TelemetryMetaData',
                    'ParameterTypeSet',
                    'MemberList',
                    'ParameterSet'
                ];*/

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
            // Could optimize here by adding a check for childNode.name against names we want
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
