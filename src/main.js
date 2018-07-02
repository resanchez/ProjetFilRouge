// ************************* WEBSOCKET *************************
import LineChartScatterPlot from "./modules/LineChartScatterPlot.js";
import ParallelCoords from "./modules/ParallelCoords.js";
import LineChartScatterPlotGeneralized from "./modules/LineChartScatterPlotGeneralized.js";
import ScatterPlotGeneralized from "./modules/ScatterPlotGeneralized.js";

let mySocket;

window.addEventListener("load", function () {
    // Crée l'instance WebSocket
    let addr = window.location.href.replace("http://", "").replace(":8080/", "");
    mySocket = new WebSocket("ws://" + addr + ":9000");
    // mySocket = new WebSocket("ws://localhost:9000");

    // Find existing selected files
    mySocket.onopen = () => {
        // sendRequest("addSelectedFiles", JSON.stringify([]), 0);
        // sendRequest("addSelectedFiles", JSON.stringify([]), 1);
    };
    // Ecoute pour les messages arrivant
    mySocket.onmessage = (event) => {
        hideLoading();
        console.log(event.data)
        let res = JSON.parse(event.data);
        // console.log(res);
        if (res.fct === "initInfos") {
            console.log(res.data);
            displayInitInfos(res.data)
        } else if (res.fct === "buildDF"){
            console.log(res.data);
            sendRequest("addSelectedFiles", JSON.stringify([]), 0);
            sendRequest("addSelectedFiles", JSON.stringify([]), 1);
        } else if (res.fct === "addSelectedFiles") {
            updateUI(res.data);
            updatePCUI(res.data);
            updateGeneralizedUI(res.data);
            updateSPGeneralizedUI(res.data);
        } else if (res.fct === "deleteFile") {
            updateUI(res.data);
            updatePCUI(res.data);
            updateGeneralizedUI(res.data);
            updateSPGeneralizedUI(res.data);
        } else if (res.fct === "getLCSPData") {
            fillLineChartScatterPlot(res.data.lcspData, res.data.group, res.data.lcspColumns);
        } else if (res.fct === "getColumnsLCSP") {
            createSelectAxis(res.data);
        } else if (res.fct === "getPCData") {
            fillParallelCoordinates(res.data.pcData, res.data.group, res.data.pcColumns);
        } else if (res.fct === "getLCSPGeneralizedData") {
            fillLineChartScatterPlotGeneralized(res.data.lcspGeneralizedData, res.data.group, res.data.lcspGeneralizedColumns);
        } else if (res.fct === "getSPGeneralizedData") {
            fillScatterPlotGeneralized(res.data.spGeneralizedData, res.data.spGeneralizedFiles, res.data.spGeneralizedColumns);
        }
    };
});

function displayInitInfos(data) {
    const files = d3.keys(data);
    const table = document.getElementById("fileList");
    const tbody = document.createElement("tbody");

    const tr = document.createElement("tr");
    const td = document.createElement("td");

    let selected = {group0 : [], group1 : []};

    const ul0 = document.getElementById("selected0");
    const ul1 = document.getElementById("selected1");

    const span0 = document.getElementById("nbLines0");
    const span1 = document.getElementById("nbLines1");

    let val0 = 0;
    let val1 = 0;

    let sel0 = 0;
    let sel1 = 0;

    const range0 = document.getElementById("range0");
    const range1 = document.getElementById("range1");

    const sampling0 = document.getElementById("sampling0");
    const sampling1 = document.getElementById("sampling1");

    const sampled0 = document.getElementById("sampled0");
    const sampled1 = document.getElementById("sampled1");

    const nbSelected0 = document.getElementById("nbSelected0");
    const nbSelected1 = document.getElementById("nbSelected1");

    const selectPhase0 = document.getElementById("selectPhase0");
    const selectPhase1 = document.getElementById("selectPhase1");

    const sendFiles = document.getElementById("sendFiles");

    span0.innerHTML = "" + val0;
    span1.innerHTML = "" + val1;

    sampling0.innerHTML = range0.value;
    sampling1.innerHTML = range1.value;

    sampled0.value = "" + Math.ceil(parseFloat(range0.value) * sel0 / 100);
    sampled1.value = "" + Math.ceil(parseFloat(range1.value) * sel1 / 100);

    nbSelected0.innerHTML = "" + sel0;
    nbSelected1.innerHTML = "" + sel1;

    let phases0 = [];
    let phases1 = [];

    for(let el of selectPhase0.selectedOptions) {
        phases0.push(el.value);
    }

    for(let el of selectPhase1.selectedOptions) {
        phases1.push(el.value);
    }

    for (let f of files) {
        let tri = tr.cloneNode(false);
        let tdName = td.cloneNode(false);
        let tdNbLines = td.cloneNode(false);
        tdName.className = "nameInfo";
        tdNbLines.className = "nbLinesInfo";
        tdName.innerHTML = f;
        tdNbLines.innerHTML = data[f].nbRows;
        tri.appendChild(tdName);
        tri.appendChild(tdNbLines);
        tri.addEventListener("click", e =>{
            tri.style.display = "none";
            let g0 = !e.altKey;
            let g1 = e.altKey;
            if (e.shiftKey) {
                g0 = true;
                g1 = true;
            }
            if (g0) {
                let li = document.createElement("li");
                li.innerHTML = f;
                val0 += data[f].nbRows;
                span0.innerHTML = "" + val0;
                selected.group0.push(f);
                ul0.appendChild(li);

                for(let p of phases0) {
                    if (data[f].phasesInfo[p]) {
                        sel0 += data[f].phasesInfo[p];
                    }
                }

                nbSelected0.innerHTML = "" + sel0;

                sampled0.value = "" + Math.ceil(parseFloat(range0.value) * sel0 / 100);

                li.addEventListener("click", e => {
                    ul0.removeChild(li);
                    selected.group0.splice(selected.group0.indexOf(f), 1);
                    tri.style.display = "table-row";
                    val0 -= data[f].nbRows;
                    span0.innerHTML = "" + val0;
                    sampled0.value = "" + Math.ceil(parseFloat(range0.value) * sel0 / 100);

                    for(let p of phases0) {
                        if (data[f].phasesInfo[p]) {
                            sel0 -= data[f].phasesInfo[p];
                        }
                    }

                    nbSelected0.innerHTML = "" + sel0;
                });
            }
            if (g1) {
                let li = document.createElement("li");
                li.innerHTML = f;
                val1 += data[f].nbRows;
                span1.innerHTML = "" + val1;
                selected.group1.push(f);
                ul1.appendChild(li);

                for(let p of phases1) {

                    if (data[f].phasesInfo[p]) {
                        sel1 += data[f].phasesInfo[p];
                    }
                }
                nbSelected1.innerHTML = "" + sel1;

                sampled1.value = "" + parseFloat(range1.value) * sel1 / 100;

                li.addEventListener("click", e => {
                    ul1.removeChild(li);
                    selected.group1.splice(selected.group1.indexOf(f), 1);
                    tri.style.display = "table-row";
                    val1 -= data[f].nbRows;
                    span1.innerHTML = "" + val1;
                    sampled1.value = "" + Math.ceil(parseFloat(range1.value) * sel1 / 100);

                    for(let p of phases1) {
                        if (data[f].phasesInfo[p]) {
                            sel1 -= data[f].phasesInfo[p];
                        }
                    }

                    nbSelected1.innerHTML = "" + sel1;
                })
            }
        });
        tbody.appendChild(tri);
    }

    range0.addEventListener("input", e => {
        sampling0.innerHTML = range0.value;
        sampled0.value = "" + Math.ceil(parseFloat(range0.value) * sel0 / 100);
    });

    range1.addEventListener("input", e => {
        sampling1.innerHTML = range1.value;
        sampled1.value = "" + Math.ceil(parseFloat(range1.value) * sel1 / 100);
    });

    sampled0.addEventListener("input", e => {
        range0.value = "" + (parseInt(sampled0.value) / sel0) * 100;
        sampling0.innerHTML = range0.value;
    });

    sampled1.addEventListener("input", e => {
        range1.value = "" + (parseInt(sampled1.value) / sel1) * 100;
        sampling1.innerHTML = range1.value;
    });

    selectPhase0.addEventListener("input", e => {
        phases0 = [];
        for(let el of selectPhase0.selectedOptions) {
            phases0.push(el.value);
        }
        sel0 = 0;
        for (let f of selected.group0) {
            for(let p of phases0) {
                if (data[f].phasesInfo[p]) {
                    sel0 += data[f].phasesInfo[p];
                }
            }
        }
        nbSelected0.innerHTML = "" + sel0;
        sampled0.value = "" + Math.ceil(parseFloat(range0.value) * sel0 / 100);

    });

    selectPhase1.addEventListener("input", e => {
        phases1 = [];
        for(let el of selectPhase1.selectedOptions) {
            phases1.push(el.value);
        }
        sel1 = 0;
        for (let f of selected.group1) {
            for(let p of phases1) {
                if (data[f].phasesInfo[p]) {
                    sel1 += data[f].phasesInfo[p];
                }
            }
        }
        nbSelected1.innerHTML = "" + sel1;
        sampled1.value = "" + Math.ceil(parseFloat(range1.value) * sel1 / 100);
    });

    table.appendChild(tbody);

    sendFiles.addEventListener("click", e => {
        console.log("send files");
        sendRequest("buildDF", {
            filesGroup0 : selected.group0,
            filesGroup1 : selected.group1,
            phaseGroup0 : phases0,
            phaseGroup1 : phases1,
            nbGroup0 : sampled0.value,
            nbGroup1 : sampled1.value
        })
    });
}

let loadingDiv = document.getElementById("loaderDiv");
let btnHideLoading = document.getElementById("hideLoading");
let loadingCount = 0;

function showLoading() {
    if (loadingCount === 0) {
        loadingDiv.style.display = "flex";
    }
    loadingCount++;
}

function hideLoading() {
    loadingCount--;
    if (loadingCount === 0) {
        loadingDiv.style.display = "none";
    }
}

btnHideLoading.addEventListener("click", hideLoading);

// let btnTabPC0 = document.getElementById("tablinks0");
// btnTabPC0.addEventListener("click", (ev) => tabsPC(ev, 0));
// let btnTabPC1 = document.getElementById("tablinks1");
// btnTabPC1.addEventListener("click", (ev) => tabsPC(ev, 1));
//
// function tabsPC(evt, group) {
//     // Declare all variables
//     let i, tabcontent, tablinks;
//
//     // Get all elements with class="tabcontent" and hide them
//     tabcontent = document.getElementsByClassName("tabcontentH");
//     for (i = 0; i < tabcontent.length; i++) {
//         tabcontent[i].style.display = "none";
//     }
//
//     // Get all elements with class="tablinks" and remove the class "active"
//     tablinks = document.getElementsByClassName("tablinks");
//     for (i = 0; i < tablinks.length; i++) {
//         tablinks[i].className = tablinks[i].className.replace(" active", "");
//     }
//
//     // Show the current tab, and add an "active" class to the button that opened the tab
//     document.getElementById("tab" + group).style.display = "block";
//     evt.currentTarget.className += " active";
// }

// function dragStarted (evt) {
// //start drag
//     source = evt.target;
// //set data
//     evt.dataTransfer.setData("text/plain", evt.target.innerHTML);
// //specify allowed transfer
//     evt.dataTransfer.effectAllowed = "move";
// }

let state = {
    0: {
        files: [],
        columns: []
    },
    1: {
        files: [],
        columns: []
    }
};

// ************************* VARIABLES SELECTION *************************

// let selectedFilesList = document.getElementById("selectedFiles");

// let btnDisplayPC0 = document.getElementById("displayPC0");
// let btnDisplayPC1 = document.getElementById("displayPC1");
let btnDisplayPCAll = document.getElementById("displayPCAll");

let selectFileLCSP0 = document.getElementById("selectFileLCSP0");
let selectFileLCSP1 = document.getElementById("selectFileLCSP1");
let selectXAxisLCSP0 = document.getElementById("xAxisLCSP0");
let selectYAxisLCSP0 = document.getElementById("yAxisLCSP0");
let selectXAxisLCSP1 = document.getElementById("xAxisLCSP1");
let selectYAxisLCSP1 = document.getElementById("yAxisLCSP1");

let selectXAxisLCSPGeneralized0 = document.getElementById("xAxisLCSPGeneralized0");
let selectYAxisLCSPGeneralized0 = document.getElementById("yAxisLCSPGeneralized0");

let selectXAxisSPGeneralized = document.getElementById("xAxisSPGeneralized");
let selectYAxisSPGeneralized = document.getElementById("yAxisSPGeneralized");
let selectCAxisSPGeneralized = document.getElementById("cAxisSPGeneralized");
let selectColorScaleSPGeneralized = document.getElementById("colorScaleSPGeneralized");
let sliderSPGeneralized = document.getElementById("sliderSPGeneralized");
let valueSPGeneralized = document.getElementById("valueSPGeneralized");

// PARALLEL COORD
function getSelectedValues(select) {
    return [...select.options].filter(option => option.selected).map(option => option.value);
}

btnDisplayPCAll.addEventListener("click", function (ev) {
    askPCDataAll();
});

// btnDisplayPC0.addEventListener("click", function (ev) {
//     askPCData(0);
// });
//
// btnDisplayPC1.addEventListener("click", function (ev) {
//     askPCData(1);
// });


// LCSP
selectFileLCSP0.addEventListener("change", function (ev) {
    sendRequest("getLCSPData", this.value, 0, selectXAxisLCSP0.value, selectYAxisLCSP0.value);
});

selectXAxisLCSP0.addEventListener("change", function (ev) {
    let featureX = selectXAxisLCSP0.value;
    let featureY = selectYAxisLCSP0.value;
    let currentFile = selectFileLCSP0.value;
    sendRequest("getLCSPData", currentFile, 0, featureX, featureY);
});

selectYAxisLCSP0.addEventListener("change", function (ev) {
    let featureX = selectXAxisLCSP0.value;
    let featureY = selectYAxisLCSP0.value;
    let currentFile = selectFileLCSP0.value;
    sendRequest("getLCSPData", currentFile, 0, featureX, featureY);
});

selectFileLCSP1.addEventListener("change", function (ev) {
    sendRequest("getLCSPData", this.value, 1, selectXAxisLCSP1.value, selectYAxisLCSP1.value);
});

selectXAxisLCSP1.addEventListener("change", function (ev) {
    let featureX = selectXAxisLCSP1.value;
    let featureY = selectYAxisLCSP1.value;
    let currentFile = selectFileLCSP1.value;
    sendRequest("getLCSPData", currentFile, 1, featureX, featureY);
});

selectYAxisLCSP1.addEventListener("change", function (ev) {
    let featureX = selectXAxisLCSP1.value;
    let featureY = selectYAxisLCSP1.value;
    let currentFile = selectFileLCSP1.value;
    sendRequest("getLCSPData", currentFile, 1, featureX, featureY);
});

// LCSP Generalized
selectXAxisLCSPGeneralized0.addEventListener("change", function (ev) {
    let featureX = selectXAxisLCSPGeneralized0.value;
    let featureY = selectYAxisLCSPGeneralized0.value;
    sendRequest("getLCSPGeneralizedData", {}, 0, featureX, featureY);
});

selectYAxisLCSPGeneralized0.addEventListener("change", function (ev) {
    let featureX = selectXAxisLCSPGeneralized0.value;
    let featureY = selectYAxisLCSPGeneralized0.value;
    sendRequest("getLCSPGeneralizedData", {}, 0, featureX, featureY);
});

console.log(selectXAxisSPGeneralized);
// SP Generalized
selectXAxisSPGeneralized.addEventListener("change", function (ev) {
    let featureX = selectXAxisSPGeneralized.value;
    if (spGeneralized) {
        spGeneralized.xAxis = featureX;
    }
});

selectYAxisSPGeneralized.addEventListener("change", function (ev) {
    let featureY = selectYAxisSPGeneralized.value;
    if (spGeneralized) {
        spGeneralized.yAxis = featureY;
    }
});

selectCAxisSPGeneralized.addEventListener("change", function (ev) {
    let featureC = selectCAxisSPGeneralized.value;
    if (spGeneralized) {
        spGeneralized.cAxis = featureC;
    }
});

selectColorScaleSPGeneralized.addEventListener("change", function (ev) {
    let featureC = selectColorScaleSPGeneralized.value;
    if (spGeneralized) {
        spGeneralized.colorScale = featureC;
    }
});

// ************************* UPDATE UI FUNCTIONS *************************
function updatePCUI(data) {
    console.log("PC UI");
    state[data.group].files = data.files;
    state[data.group].columns = data.columns;

    let selectFilePC = document.getElementById("selectFilePC" + data.group);
    let selectColumnsPC = document.getElementById("selectColumnsPC");
    console.log(selectFilePC);
    selectFilePC.innerHTML = "";
    selectColumnsPC.innerHTML = "";
    for (let f of state[data.group].files) {
        let option = document.createElement("option");
        option.innerHTML = f;
        option.value = f;
        option.selected = true;
        selectFilePC.appendChild(option);
    }

    for (let c of state[data.group].columns) {
        if (c !== "idxFile") {
            let option = document.createElement("option");
            option.innerHTML = c;
            option.value = c;
            option.selected = true;

            selectColumnsPC.appendChild(option);
        }
    }
}

function updateUI(data) {
    state[data.group].files = data.files;
    state[data.group].columns = data.columns;

    console.log(data.files);

    let selectFileLCSP = document.getElementById("selectFileLCSP" + data.group);
    let selectXAxisLCSP = document.getElementById("xAxisLCSP" + data.group);
    let selectYAxisLCSP = document.getElementById("yAxisLCSP" + data.group);
    let fileLCSPValue = selectFileLCSP.value;
    let xAxisLCSPValue = selectXAxisLCSP.value;
    let yAxisLCSPValue = selectYAxisLCSP.value;

    // let addedFilesList = document.getElementById("addedFiles" + data.group);
    // addedFilesList.innerHTML = "";
    // selectedFilesList.innerHTML = "";
    selectFileLCSP.innerHTML = "";
    selectXAxisLCSP.innerHTML = "";
    selectYAxisLCSP.innerHTML = "";
    for (let f of state[data.group].files) {
        let li = document.createElement("li");
        // li.className = "addedFile";
        // li.innerHTML = `<span>${f} </span>`;
        let del = document.createElement("div");
        del.className = "deleteFile";
        del.innerHTML = "X";
        li.appendChild(del);
        del.addEventListener("click", function () {
            sendRequest("deleteFile", f, data.group);
            console.log({listSelectedFiles1, listSelectedFiles2, f});
            let idx = -1;
            // TODO - trop sale
            for (let i = 0, len = listSelectedFiles1.length; i < len; i++) {
                if (listSelectedFiles1[i].name === f) {
                    idx = i;
                    break;
                }
            }
            // let idx = listSelectedFiles1.indexOf(f);
            if (idx !== -1) {
                listSelectedFiles1.splice(idx, 1);
            } else {
                // TODO - trop sale
                for (let i = 0, len = listSelectedFiles2.length; i < len; i++) {
                    if (listSelectedFiles2[i].name === f) {
                        idx = i;
                        break;
                    }
                }
                // let idx = listSelectedFiles2.indexOf(f);
                if (idx !== -1) {
                    listSelectedFiles2.splice(idx, 1);
                }
            }
            // let liToRM = filesToLi[f];
            // displaySelectedFiles.removeChild(liToRM);
        });
        // addedFilesList.appendChild(li);

        let option = document.createElement("option");
        option.innerHTML = f;
        option.value = f;
        selectFileLCSP.appendChild(option);
        if (f === fileLCSPValue && f) {
            selectFileLCSP.value = fileLCSPValue;
        }
    }
    let selectedTRs = document.querySelectorAll(".trActive");
    for (let tr of selectedTRs) {
        tr.classList.toggle("trActive");
        tr.classList.toggle("trDisabled");
    }

    for (let c of state[data.group].columns) {
        if (c !== "flight_time" && c !== "idxFile" && c !== "group") {
//        if (c !== "date_time" && c !== "idxFile" && c !== "group") {
            let optionX = document.createElement("option");
            optionX.innerHTML = c;
            optionX.value = c;

            let optionY = optionX.cloneNode(true);

            selectXAxisLCSP.appendChild(optionX);
            selectYAxisLCSP.appendChild(optionY);
            if (c === xAxisLCSPValue && c) {
                selectXAxisLCSP.value = xAxisLCSPValue;
            }
            if (c === yAxisLCSPValue && c) {
                selectYAxisLCSP.value = yAxisLCSPValue;
            }
        }
    }
}


function updateGeneralizedUI(data) {
    state[data.group].files = data.files;
    state[data.group].columns = data.columns;

    let selectXAxisLCSP = document.getElementById("xAxisLCSPGeneralized" + data.group);
    let selectYAxisLCSP = document.getElementById("yAxisLCSPGeneralized" + data.group);
    let xAxisLCSPValue = selectXAxisLCSP.value;
    let yAxisLCSPValue = selectYAxisLCSP.value;

    selectXAxisLCSP.innerHTML = "";
    selectYAxisLCSP.innerHTML = "";

    // for (let f of state[data.group].files) {
    //     let option = document.createElement("option");
    //     option.innerHTML = f;
    //     option.value = f;
    // }

    for (let c of state[data.group].columns) {
        if (c !== "date_time" && c !== "idxFile" && c !== "group") {
            let optionX = document.createElement("option");
            optionX.innerHTML = c;
            optionX.value = c;

            let optionY = optionX.cloneNode(true);

            selectXAxisLCSP.appendChild(optionX);
            selectYAxisLCSP.appendChild(optionY);
            if (c === xAxisLCSPValue && c) {
                selectXAxisLCSP.value = xAxisLCSPValue;
            }
            if (c === yAxisLCSPValue && c) {
                selectYAxisLCSP.value = yAxisLCSPValue;
            }
        }
    }
}

function updateSPGeneralizedUI(data) {
    state[data.group].files = data.files;
    state[data.group].columns = data.columns;

    let selectXAxisSP = document.getElementById("xAxisSPGeneralized");
    let selectYAxisSP = document.getElementById("yAxisSPGeneralized");
    let selectCAxisSP = document.getElementById("cAxisSPGeneralized");
    let xAxisSPValue = selectXAxisSP.value;
    let yAxisSPValue = selectYAxisSP.value;
    let cAxisSPValue = selectCAxisSP.value;

    selectXAxisSP.innerHTML = "";
    selectYAxisSP.innerHTML = "";
    selectCAxisSP.innerHTML = "";

    for (let c of state[data.group].columns) {
        if (c !== "date_time" && c !== "idxFile" && c !== "group") {
            let optionX = document.createElement("option");
            optionX.innerHTML = c;
            optionX.value = c;

            let optionY = optionX.cloneNode(true);
            let optionC = optionX.cloneNode(true);

            selectXAxisSP.appendChild(optionX);
            selectYAxisSP.appendChild(optionY);
            selectCAxisSP.appendChild(optionC);
            if (c === xAxisSPValue && c) {
                selectXAxisSP.value = xAxisSPValue;
            }
            if (c === yAxisSPValue && c) {
                selectYAxisSP.value = yAxisSPValue;
            }
            if (c === cAxisSPValue && c) {
                selectCAxisSP.value = cAxisSPValue;
            }
        }
    }
}

function sendRequest(name, data, group, ...args) {
    showLoading();
    let msg = {
        "fct": name,
        "data": data || [],
        "group": group || 0,
        "args": args
    };
    mySocket.send(JSON.stringify(msg));
    console.log("Request sent at : ", Date.now());
}

// ************************* OPEN CITY *************************

function openCity(evt, cityName) {
    // Declare all variables
    let i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the link that opened the tab
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}

// ************************* ADD DATA *************************
window.addEventListener("load", main);

let listSelectedFiles1 = [];
let listSelectedFiles2 = [];
let displaySelectedFiles;
let displayAddedFiles;
let filesToLi = {};
let listFilesIdx = [];

function main() {
    setupTabs();
    // setupListeners();
    setUpPCOptions();
    setUpOptions();
    setUpGeneralizedOptions();
    setUpSPGeneralizedOptions();
}

function setupTabs() {
    let addFilesTab = document.getElementById("addFilesTab");
    let drawParallelCoordinatesTab = document.getElementById("drawParallelCoordinatesTab");
    let drawLineChartScatterPlotTab = document.getElementById("drawLineChartScatterPlotTab");
    let drawLineChartScatterPlotGeneralizedTab = document.getElementById("drawLineChartScatterPlotGeneralizedTab");
    let drawScatterPlotGeneralizedTab = document.getElementById("drawScatterPlotGeneralizedTab");

    addFilesTab.addEventListener("click", function (ev) {
        openCity(event, 'addFiles');
    });

    drawParallelCoordinatesTab.addEventListener("click", function (ev) {
        openCity(event, 'drawParallelCoordinatesPlot');
        askPCDataAll();
    });

    drawLineChartScatterPlotTab.addEventListener("click", function (ev) {
        openCity(event, 'drawLineChartScatterPlot');
        askLCSPDataAll();
    });

    drawLineChartScatterPlotGeneralizedTab.addEventListener("click", function (ev) {
        openCity(event, 'drawLineChartScatterPlotGeneralized');
        askLCSPGeneralizedDataAll();
    });

    drawScatterPlotGeneralizedTab.addEventListener("click", function (ev) {
        openCity(event, 'drawScatterPlotGeneralized');
        askSPGeneralizedDataAll();
    });
}

let orders = {
    name: {
        order: 1,
        compare: function (a, b) {
            return orders.name.order * a.name.localeCompare(b.name);
        }
    },
    size: {
        order: 1,
        compare: function (a, b) {
            return orders.size.order * (a.size - b.size);
        }
    },
    type: {
        order: 1,
        compare: function (a, b) {
            return orders.type.order * a.type.localeCompare(b.type);
        }
    },
    lastModifiedDate: {
        order: 1,
        compare: function (a, b) {
            if (a.lastModifiedDate.getTime() === b.lastModifiedDate.getTime()) {
                return 0;
            } else {
                let val = a.lastModifiedDate < b.lastModifiedDate ? -1 : 1;
                return orders.lastModifiedDate.order * val;
            }
        }
    },
};

// function setupListeners() {
//     let importFolder = document.getElementById("import");
//     let table = document.getElementById("fileList");
//     displaySelectedFiles = document.getElementById("selectedFiles");
//     displayAddedFiles = document.getElementById("addedFiles");
//     let addSelectedFiles = document.getElementById("addSelectedFiles");
//
//     // ORDERING VARIABLES
//     let name = document.getElementById("name");
//     let type = document.getElementById("type");
//     let size = document.getElementById("size");
//     let lastModifiedDate = document.getElementById("lastModifiedDate");
//
//     let fs = [];
//
//     importFolder.addEventListener("change", function (ev) {
//         let files = ev.path[0].files;
//         for (let f of files) {
//             fs.push(f);
//         }
//         fillFileList(fs, table, "name");
//     });
//
//     // Order by name
//     name.addEventListener("click", function (ev) {
//         orders.name.order *= -1;
//         fillFileList(fs, table, "name");
//     });
//
//     // Order by file type
//     type.addEventListener("click", function (ev) {
//         orders.type.order *= -1;
//         fillFileList(fs, table, "type");
//     });
//
//     // Order by size
//     size.addEventListener("click", function (ev) {
//         orders.size.order *= -1;
//         fillFileList(fs, table, "size");
//     });
//
//     // Order by last modified date
//     lastModifiedDate.addEventListener("click", function (ev) {
//         orders.lastModifiedDate.order *= -1;
//         fillFileList(fs, table, "lastModifiedDate");
//     });
//
//     addSelectedFiles.addEventListener("click", function (ev) {
//         readAndSendSelectedFiles(listSelectedFiles1, 0);
//         readAndSendSelectedFiles(listSelectedFiles2, 1);
//     });
//
//     // SEARCH FILES
//     searchFiles(fs);
// }

function setUpPCOptions() {
    let sideNav = document.getElementById("openSideNavPC");
    let closeNav = document.getElementById("closeNavPC");

    sideNav.addEventListener("click", function (ev) {
        document.getElementById("mySidenavPC").style.width = "250px";
    });

    closeNav.addEventListener("click", function (ev) {
        document.getElementById("mySidenavPC").style.width = "0";
    });
}

function setUpOptions() {
    let sideNav = document.getElementById("openSideNavLCSP");
    let closeNav = document.getElementById("closeNavLCSP");

    sideNav.addEventListener("click", function (ev) {
        document.getElementById("mySidenavLCSP").style.width = "250px";
    });

    closeNav.addEventListener("click", function (ev) {
        document.getElementById("mySidenavLCSP").style.width = "0";
    });
}


function setUpGeneralizedOptions() {
    let sideNav = document.getElementById("openSideNavLCSPGeneralized");
    let closeNav = document.getElementById("closeNavLCSPGeneralized");

    sideNav.addEventListener("click", function (ev) {
        document.getElementById("mySidenavLCSPGeneralized").style.width = "250px";
    });

    closeNav.addEventListener("click", function (ev) {
        document.getElementById("mySidenavLCSPGeneralized").style.width = "0";
    });
}

function setUpSPGeneralizedOptions() {
    let sideNav = document.getElementById("openSideNavSPGeneralized");
    let closeNav = document.getElementById("closeNavSPGeneralized");

    sideNav.addEventListener("click", function (ev) {
        document.getElementById("mySidenavSPGeneralized").style.width = "250px";
    });

    closeNav.addEventListener("click", function (ev) {
        document.getElementById("mySidenavSPGeneralized").style.width = "0";
    });
}

function readAndSendSelectedFiles(files, id) {
    let dataAll = [];
    let nbFiles = 0;
    for (let i = 0, len = files.length; i < len; i++) {
        let file = files[i];
        let reader = new FileReader();


        reader.onload = (function (theFile) {
            return function (e) {
                d3.csv(e.target.result, function (error, data) {
                    let power = 0;
                    for (let d of data) {
                        if (d["power"]) {
                            power = d["power"];
                        } else {
                            d["power"] = power;
                        }
                        d["idxFile"] = theFile.name;
                    }
                    listFilesIdx.push(theFile.name);
                    dataAll = dataAll.concat(data);
                    nbFiles++;
                    if (nbFiles === files.length) {
                        sendRequest("addSelectedFiles", JSON.stringify(dataAll), id);
                    }
                });
            };
        })(file);
        reader.readAsDataURL(file);
    }
}

function updateSelectedFilesList(file, val, isShifted) {
    if (val) {
        if (isShifted) {
            listSelectedFiles1.push(file);
        } else {
            listSelectedFiles2.push(file);
        }
        let li = document.createElement("li");
        li.className = isShifted ? "selectedFile1" : "selectedFile2";
        li.innerHTML = file.name;
        displaySelectedFiles.appendChild(li);
        filesToLi[file.name] = li;
    } else {
        let idx = listSelectedFiles1.indexOf(file);
        if (idx !== -1) {
            listSelectedFiles1.splice(idx, 1);
        } else {
            let idx = listSelectedFiles2.indexOf(file);
            listSelectedFiles2.splice(idx, 1);
        }
        let liToRM = filesToLi[file.name];
        displaySelectedFiles.removeChild(liToRM);
    }
}

let tr = document.createElement("tr");
tr.className = "fileInfo";

let td = document.createElement("td");

function showFile(file, tbody) {
    let tri = tr.cloneNode(false);
    tri.addEventListener("mousedown", function (ev) {
        let isAlt = ev.altKey;

        if (!tri.classList.contains("trDisabled")) {
            let toggle = tri.classList.toggle("trActive");
            if (toggle) {
                if (isAlt) {
                    tri.classList.toggle("groupActive1", true);
                } else {
                    tri.classList.toggle("groupActive2", true);
                }
            } else {
                tri.classList.toggle("groupActive1", false);
                tri.classList.toggle("groupActive2", false);
            }
            updateSelectedFilesList(file, toggle, isAlt);
        }
    });
    let tdName = td.cloneNode(false);
    let tdType = td.cloneNode(false);
    let tdSize = td.cloneNode(false);
    let tdDate = td.cloneNode(false);
    tdName.className = "nameInfo";
    tdType.className = "typeInfo";
    tdSize.className = "sizeInfo";
    tdDate.className = "dateInfo";
    tdName.innerHTML = file.name;
    tdType.innerHTML = file.type;
    tdSize.innerHTML = file.size;
    tdDate.innerHTML = file.lastModifiedDate;
    tri.appendChild(tdName);
    tri.appendChild(tdType);
    tri.appendChild(tdSize);
    tri.appendChild(tdDate);
    tbody.appendChild(tri);
}

function showMore (files, currentIdx, tbody) {
    let end = Math.min(files.length, currentIdx + 30);
    for (let i = currentIdx; i < end; i++) {
        showFile(files[i], tbody);
    }
    return end;
}

function fillFileList(files, table, key) {

    let div = table.parentNode;
    let currentIdx = 0;

    div.addEventListener('scroll', function() {
        if (div.scrollTop + div.clientHeight >= div.scrollHeight) {
            currentIdx = showMore(files, currentIdx, tbody);
        }
    });

    console.log(files);
    console.time('sort');
    files.sort(orders[key].compare);
    console.timeEnd('sort');
    let oldTbody = table.querySelector("tbody");
    if (oldTbody) {
        oldTbody.parentElement.removeChild(oldTbody);
    }

    let tbody = document.createElement("tbody");
    table.appendChild(tbody);

    console.log(table.getBoundingClientRect(), div.scrollHeight);

    while (table.getBoundingClientRect().height <= div.clientHeight) {
        currentIdx = showMore(files, currentIdx, tbody);
    }

}

function searchFiles(fs) {
    let searchFiles = document.getElementById("searchFiles");
    let table = document.getElementById("fileList");

    searchFiles.addEventListener("input", function (ev) {
        let matches = [];
        let search = searchFiles.value.toString();
        console.log(search);

        for (let file of fs) {
            if (file["name"].includes(search)) {
                matches.push(file);
            }
        }
        console.log(matches);
        fillFileList(matches, table, "name");
    });

}


// ************************* PARALLEL COORDINATES *************************
let drawFromSelection = document.getElementById("drawFromSelection");
let resetSelection = document.getElementById("resetSelection");

resetSelection.addEventListener("click", askPCDataAll);

// drawFromSelection.addEventListener("click", function () {
//     let selectedFiles = getSelectedValues(selectFilePC);
//     let selectedColumns = getSelectedValues(selectColumnsPC);
//
//     let selection = pc && pc.selection ? pc.selection : {};
//
//     console.log(pc);
//
//     sendRequest("getPCData", selectedFiles, 0, selectedColumns, selection);
// });

function askPCDataAll() {
    if (state[0].files.length) {
        askPCData(0);
    }
    if (state[1].files.length) {
        askPCData(1);
    }
}

function askPCData(group) {
    let selectedFiles = getSelectedValues(document.getElementById("selectFilePC" + group));
    let selectedColumns = getSelectedValues(document.getElementById("selectColumnsPC"));
    // let selectedColumns = getSelectedValues(selectColumnsPC);

    sendRequest("getPCData", selectedFiles, group, selectedColumns, {});
}

let pc = [];

function fillParallelCoordinates(data, group, cols) {
    document.getElementById("pcContainer" + group).innerHTML = "";
    document.getElementById("pcContainer").innerHTML = "";
    if (state[0].files.length && state[1].files.length) {
        pc[group] = new ParallelCoords("pcContainer" + group, data, {
            colorAxis: cols[cols.length - 1]
        });
        let otherGroup = group === 0 ? 1 : 0;
        if (pc[otherGroup]) {
            pc[group].neighboor = pc[otherGroup];
            pc[otherGroup].neighboor = pc[group];
        }
    } else {
        pc[group] = new ParallelCoords("pcContainer", data, {
            width: 1000,
            height: 600,
            colorAxis: cols[cols.length - 1]
        });
    }
}

// ************************* LINE CHART + SCATTER PLOT *************************
function askLCSPDataAll() {
    if (state[0].files.length) {
        askLCSPData(0);
    }
    if (state[1].files.length) {
        askLCSPData(1);
    }
}

function askLCSPData(group) {
    let selectFileLCSP = document.getElementById("selectFileLCSP" + group);
    sendRequest("getLCSPData", selectFileLCSP.value, group);
}

let lcsp;
let lcspGeneralized;
let spGeneralized;
let pcsp;

function fillLineChartScatterPlot(data, group, cols) {
    document.getElementById("lscpContainer" + group).innerHTML = "";
    document.getElementById("lcspDisplay").innerHTML = "";
    if (state[0].files.length && state[1].files.length) {
        lcsp = new LineChartScatterPlot("lscpContainer" + group, data, cols);
    } else {
        lcsp = new LineChartScatterPlot("lcspDisplay", data, cols, {
            width: 800,
            height: 350
        });
    }
    console.log("xAxisLCSP" + group);
    let selectXAxisLCSP = document.getElementById("xAxisLCSP" + group);
    let selectYAxisLCSP = document.getElementById("yAxisLCSP" + group);


    selectXAxisLCSP.value = lcsp.xAxis;
    selectYAxisLCSP.value = lcsp.yAxis;
}

// ************************* LINE CHART + SCATTER PLOT GENERALIZED *************************
function askLCSPGeneralizedDataAll() {
    askLCSPGeneralizedData();
    // askLCSPGeneralizedData(1);
}

function askLCSPGeneralizedData(group) {
    sendRequest("getLCSPGeneralizedData", {}, group);
}

function fillLineChartScatterPlotGeneralized(data, group, cols) {
    let lscpContainerGeneralized = document.getElementById("lcspGeneralizedContainer");
    let selectXAxisLCSPGeneralized = document.getElementById("xAxisLCSPGeneralized" + group);
    let selectYAxisLCSPGeneralized = document.getElementById("yAxisLCSPGeneralized" + group);
    lscpContainerGeneralized.innerHTML = "";

    lcspGeneralized = new LineChartScatterPlotGeneralized("lcspGeneralizedContainer", data, cols);

    selectXAxisLCSPGeneralized.value = lcspGeneralized.xAxis;
    selectYAxisLCSPGeneralized.value = lcspGeneralized.yAxis;
}

// ************************* SCATTER PLOT GENERALIZED *************************
function askSPGeneralizedDataAll() {
    sendRequest("getSPGeneralizedData", {}, {});
    // sendRequest("getSPGeneralizedData", {});
}

function fillScatterPlotGeneralized(data, files, columns) {
    let spFiles = showSPFiles(files);
    // TODO - we don't need to replot unless we have added files
    // TODO - Implement this optim (flag)
    let spContainerGeneralized = document.getElementById("spGeneralizedContainer");
    let selectXAxisSPGeneralized = document.getElementById("xAxisSPGeneralized");
    let selectYAxisSPGeneralized = document.getElementById("yAxisSPGeneralized");
    let selectCAxisSPGeneralized = document.getElementById("cAxisSPGeneralized");
    let selectColorScaleSPGeneralized = document.getElementById("colorScaleSPGeneralized");
    let sptableftdown = document.getElementById("sptableftdown");
    spContainerGeneralized.innerHTML = "";
    sptableftdown.innerHTML = "";


    spGeneralized = new ScatterPlotGeneralized("spGeneralizedContainer", data, spFiles, {
        colorSelect: selectCAxisSPGeneralized
    });

    pcsp = new ParallelCoords("sptableftdown", data, {
        width: 800,
        height: 250,
        colorAxis: spGeneralized.cAxis
    });

    spGeneralized.neighboor = pcsp;
    pcsp.neighboorSc = spGeneralized;

    selectXAxisSPGeneralized.value = spGeneralized.xAxis;
    selectYAxisSPGeneralized.value = spGeneralized.yAxis;
    selectCAxisSPGeneralized.value = spGeneralized.cAxis;
    selectColorScaleSPGeneralized.value = spGeneralized.colorScale;
}


function showSPFiles(files) {
    let spFiles = {};
    let listFiles = document.getElementById("spFiles");
    listFiles.innerHTML = "";
    for (let file of files) {
        let li = document.createElement("li");
        li.innerHTML = file;
        listFiles.appendChild(li);
        spFiles[file] = li;
    }
    return spFiles;
}