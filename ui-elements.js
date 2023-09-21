const outputStatsDisplay = document.getElementById('output-stats');
const myForm = document.getElementById("inputForm");
// const inputFile = document.getElementById("inputFile");
// const inputStatsDisplay = document.getElementById("input-stats");
const inputType = document.getElementById("inputType");
const inputPrl = document.getElementById("inputPrl");
const inputCsv = document.getElementById("inputCsv");
const formSectionWidgets = document.getElementById("configFormSectionWidgets");
const howCsv = document.getElementById("howCsv");
const howPrl = document.getElementById("howPrl");
const btnDownloadJson = document.getElementById("btnDownloadJson");
const btnDownloadTelemList = document.getElementById("btnDownloadTelemList");
const outputMsgText = document.getElementById("outputMsg");

inputType.addEventListener("change", function(ev){
    toggleHiddenClass([howCsv, howPrl, inputCsv, inputPrl, btnDownloadTelemList, formSectionWidgets])
}, false);
