const INPUT_TYPE = "prl";
const OUTPUT_BASE_NAME_KEY = '_PRL_YS_GCS_VALIDATE';
const STEP_LABEL_STYLE = {
    backgroundColor: '#555555',
    color: '#cccccc'
}

document.getElementById('inputPrl').addEventListener("change", function (ev) {
    uploadFiles(ev.currentTarget.files, 'prl');
}, false);

document.getElementById('inputGCSFileList').addEventListener("change", function (ev) {
    uploadFiles(ev.currentTarget.files, 'gcsfilelist');
}, false);

document.getElementById('inputOpi').addEventListener("change", function (ev) {
    uploadFiles(ev.currentTarget.files, 'opi');
}, false);

function getConfigFromForm() {
    // Get form values
    const config = {};

    config.outputBaseName = document.getElementById('output-base-name').value;
    config.layoutGrid = document.getElementById('layoutGrid').value.split(',');
    config.itemMargin = getFormNumericVal('itemMargin');

    config.dlAlphas = {};
    config.dlAlphas.itemW = getFormNumericVal('alphaLayoutItemWidth');
    config.dlAlphas.itemH = getFormNumericVal('alphaLayoutItemHeight');

    return config;
}

/**************************************************************** CONSTANTS */
const GCS_SIGNATURES = [
    '.py'
];

/**************************************************************** FUNCTIONS */
function testStrForGCSRef(str) {
    return str.includes('.py');
}

function extractFileNameFromStr(str, sig = '.py') {
    /*
    Execute ROVER > COMM > CONFIGURE DOWNLINK RATE (RoverCommConfigureDownlinkRate.py)
    Execute RoverCommConfigureDownlinkRate.py to change the downlink rate
     */
    str = str.trim();
    const endOffset = sig.length;

    const endIndex = str.indexOf(sig) + sig.length;
    let done = false;
    let startIndex = endIndex - endOffset;
    while (startIndex-- > 0 && !done) {
        const curChar = str.charAt(startIndex);
        if (
            curChar === ' ' ||
            curChar === '(' ||
            curChar === '/' ||
            curChar === ';'
        ) {
            done = true;
        }
        // startIndex--;
    }
    return str.substring(startIndex + endOffset - 1, endIndex);
}

function extractGCSFromPrl(fileName, fileContent) {
    /* LIKE THIS:
    <prl:ManualInstruction executionMode="human" instructionIdentifier="0f54fecc-9b29-4696-baf5-36fe1b17c09a">
      <prl:Description>
        <prl:Text>Execute ROVER > COMM > CONFIGURE DOWNLINK RATE (RoverCommConfigureDownlinkRate.py)</prl:Text>
      </prl:Description>
      <prl:Number>4.1</prl:Number>
    </prl:ManualInstruction>
*/

    function traverseXML(node, arrgcsNames = []) {
        const nodeName = node.nodeName; // prl:Step, etc.
        let gcsManIns = [];

        if (nodeName === 'prl:ManualInstruction') {
            curNumber = node.getElementsByTagName("prl:Number")[0].textContent;

            const manInsText = getNodePrlText(node);
            if (manInsText) {
                // Not all ManualInstructions have description content
                if (testStrForGCSRef(manInsText)) {
                    // Execute ROVER > COMM > CONFIGURE DOWNLINK RATE (RoverCommConfigureDownlinkRate.py)
                    const gcsName = extractFileNameFromStr(manInsText);
                    // console.log('.py found in ', manInsText, gcsName);
                    arrgcsNames.push({
                        name: gcsName,
                        step: curNumber,
                        manIns: manInsText
                    });
                }
            }
        }

        // Recursively traverse child nodes
        for (let i = 0; i < node.childNodes.length; i++) {
            const childNode = node.childNodes[i];
            // Only traverse element nodes
            if (childNode.nodeType === 1) {
                traverseXML(childNode, arrgcsNames);
            }
        }

        return arrgcsNames;
    }

    const xmlDoc = new DOMParser().parseFromString(fileContent, 'text/xml');
    const arrGCSRefs = traverseXML(xmlDoc.documentElement, []);

    return arrGCSRefs;
}

function extractButtonsAndGCSFromOpi(filename, fileContent) {
    /* LIKE THIS:
    <widget typeId="org.csstudio.opibuilder.widgets.ActionButton" version="2.0.0">
            <actions hook="false" hook_all="false">
              <action type="EXECUTE_CMD">
                <command>konsole -e "python3 viper_gcs/GCS/RoverNavCaptureHazCams.py"</command>
                <command_directory>$(user.home)</command_directory>
                <wait_time>10</wait_time>
                <description />
              </action>
            </actions>
          ....
            <text>HAZCAMS CAPTURE</text>
          ....
          </widget>
     */
    const arrButtons = [];
    const arrGCS = [];

    function traverseXML(node) {
        const nodeName = node.nodeName; // prl:Step, etc.

        if (nodeName === 'widget') {
            const nodeType = node.getAttribute('typeId');
            if (nodeType && nodeType.includes('ActionButton')) {
                if (node.getElementsByTagName('action')[0]) {
                    const nodeAction = node
                        .getElementsByTagName('actions')[0]
                        .getElementsByTagName('action')[0];
                    if (nodeAction && nodeAction.getAttribute('type')) {
                        if (nodeAction.getAttribute('type').includes('EXECUTE_CMD')) {
                            const nodeCommand = nodeAction.getElementsByTagName('command')[0];
                            const gcsName = extractFileNameFromStr(nodeCommand.textContent);
                            const nodeText = node.getElementsByTagName('text')[0];

                            arrButtons.push({
                                gcs: gcsName,
                                buttonlabel: nodeText.textContent
                            });

                            if (!arrGCS.includes(gcsName)) {
                                arrGCS.push(gcsName);
                            }
                        }
                    }
                }
            }
        }

        // Recursively traverse child nodes
        for (let i = 0; i < node.childNodes.length; i++) {
            const childNode = node.childNodes[i];
            // Only traverse element nodes
            if (childNode.nodeType === 1) {
                traverseXML(childNode);
            }
        }

        return {
            buttons: arrButtons,
            gcs: arrGCS
        };
    }

    const xmlDoc = new DOMParser().parseFromString(fileContent, 'text/xml');
    return traverseXML(xmlDoc.documentElement, []);
}

function comparePrlToOpi() {
    // Iterate through GCS refs in procedures and find them or note in a YS .opi file
    /*    function lookForPropValInObjArray(array, prop, val) {
            array.forEach(item => {
                if (item[prop].includes(val)) {
                    console.log('lookForPropValInObjArray', item, prop, val);
                    return true;
                }
            });

            return false;
        }*/


    arrPrlVsOpi = [[
        'Proc',
        'Step',
        'GCS',
        'YS Button'
    ]];
    if (ARR_YS_BUTTONS.length > 0) {
        console.log('ARR_YS_BUTTONS', ARR_YS_BUTTONS);
        const arrOpiGCS = ARR_YS_BUTTONS[0].gcs; // Assume there's 1 .opi file being processed eval'd for now

        if (ARR_PRL_GCS_REFS.length > 0) {
            ARR_PRL_GCS_REFS.forEach(prlFile => {
                prlFile.refs.forEach(ref => {
                    const gcsName = ref.name;
                    if (arrOpiGCS.includes(gcsName)) {
                        // console.log('YS button found for ', gcsName);
                    } else {
                        arrPrlVsOpi.push([
                            prlFile.file,
                            ref.step,
                            gcsName,
                            'BUTTON NOT FOUND'
                        ])
                        // console.log('## YS missing button for ', gcsName,ref);
                    }
                });
            });
        }
        outputMsg(htmlGridFromArray(arrPrlVsOpi));
        console.log('arrPrlVsOpi', arrPrlVsOpi);
    }
}

nameFromPath = function (str, delim, places) {
    // 'places' counts backwards from the end of the path
    const pathArr = str.split(delim);
    let name = '';

    for (let i = pathArr.length - places; i < pathArr.length; i++) {
        name = name.concat(pathArr[i] + ' ');
    }

    return name.trim();
}

/**************************************************************** FILE PROCESSING */
const ARR_YS_BUTTONS = [];
const ARR_PRL_GCS_REFS = [];
let ARR_GCS_FILELIST = [];

processPrlFiles = function (filenames, values) {
    outputMsg([
        filenames.length,
        'procedure files loaded.'
    ].join(' '));

    for (let i = 0; i < filenames.length; i++) {
        const fileName = filenames[i];
        const fileContent = values[i];
        if (testStrForGCSRef(fileContent)) {
            const gcsRefs = extractGCSFromPrl(fileName, fileContent);
            if (gcsRefs && gcsRefs.length > 0) {
                ARR_PRL_GCS_REFS.push({
                    file: fileName,
                    refcnt: gcsRefs.length,
                    refs: gcsRefs
                });
            }
        }
    }
    outputMsg(lineSepStr);
}

processOpiFiles = function (filenames, values) {
    for (let i = 0; i < filenames.length; i++) {
        const fileName = filenames[i];
        const fileContent = values[i];
        const arrYSButtonsInFile = extractButtonsAndGCSFromOpi(fileName, fileContent);
        if (arrYSButtonsInFile) {
            ARR_YS_BUTTONS.push({
                file: fileName,
                buttonCnt: arrYSButtonsInFile.buttons.length,
                buttons: arrYSButtonsInFile.buttons,
                gcsCount: arrYSButtonsInFile.gcs.length,
                gcs: arrYSButtonsInFile.gcs
            });
        }
        outputMsg([
            'Yamcs Studio file loaded.',
            ARR_YS_BUTTONS[0].buttons.length,
            'buttons found.',
            ARR_YS_BUTTONS[0].gcs.length,
            'GCS refs found.'

        ].join(' '));
        outputMsg(lineSepStr);
    }
}

processGCSFileList = function (filename, value) {
    ARR_GCS_FILELIST = listToArray(value);
    // console.log('ARR_GCS_FILELIST', ARR_GCS_FILELIST);
    outputMsg([
        ARR_GCS_FILELIST.length,
        'GCS filenames loaded.'
    ].join(' '));
    outputMsg(lineSepStr);
}
