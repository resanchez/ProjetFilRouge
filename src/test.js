// ************************* VARIABLES *************************
let fileInput = document.getElementById("data");
let btnTestWrite = document.getElementById("launchTestWrite");
let btnTestRead = document.getElementById("launchTestRead");
let writeIDB = document.getElementById("writeIDB");
let writeServer = document.getElementById("writeServer");
let readIDB = document.getElementById("readIDB");
let readServer = document.getElementById("readServer");

let testFile;
let data = [{"datetime": "kikoo", "fuelflow": "cookie", "torque1": "Euh"}, {
    "datetime": "kikoo2",
    "fuelflow": "cookie2",
    "torque1": "Euh2"
}];

let mySocket;

// ************************* LOAD DATA *************************
fileInput.addEventListener("change", function (ev) {
    let files = ev.path[0].files;
    let file;
    for (let f of files) {
        file = f;
    }
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
                    let keys = Object.keys(d);
                    for (let k of keys) {
                        if (k.includes(" ")) {
                            let new_k = k.replace(/\s/g, "_").replace(/\./g, "");
                            d[new_k] = d[k];
                            delete d[k];
                        }
                    }
                }
                console.log("ok lecture fichier");
                testFile = data;
            });
        };
    })(file);
    reader.readAsDataURL(file);
});

// ************************* WEBSOCKET *************************
let files, columns;
window.addEventListener("load", function () {
    // Create the WebSocket instance
    let addr = window.location.href.replace("http://", "").replace(":8080/test.html", "");
    mySocket = new WebSocket("ws://" + addr + ":9000");

    // Find existing selected files
    mySocket.onopen = () => {
    };
    // Ecoute pour les messages arrivant
    mySocket.onmessage = (event) => {
        let res = JSON.parse(event.data);
        if (res.fct === "addSelectedFiles") {
            console.log("All done kikoo2 !", res);
            files = res.data.files;
            columns = res.data.columns;
            let t1SW = performance.now();
            let elapsed = 0|(t1SW - t0SW);
            writeServer.innerHTML = "" + elapsed;
        } else {
            if (res.fct === "getDebugData") {
                console.log("All done kikoo2 !", res.data.pcData);
                let t1SR = performance.now();
                let elapsed = 0|(t1SR - t0SR);
                readServer.innerHTML = "" + elapsed;
            }
        }
    };
});

function sendRequest(name, data, group, ...args) {
    let msg = {
        "fct": name,
        "data": data || [],
        "group": group || 0,
        "args": args
    };
    mySocket.send(JSON.stringify(msg));
}

// ************************* INDEXED DB *************************
// Create DB
let db;
let objectStore;

// Open database
let request = window.indexedDB.open("KikooDB", 1);
request.onerror = ev => {
    console.error(ev);
};

// Create the schema
request.onupgradeneeded = ev => {
    // Save te IDBDatabase interface
    db = ev.target.result;

    // Create an objectStore for this database
    objectStore = db.createObjectStore("test", {keyPath: "date_time"});
};

request.onsuccess = ev => {
    // Save te IDBDatabase interface
    db = ev.target.result;
};

let t0SW;
let t0SR;

btnTestWrite.addEventListener("click", ev => {
    let t0 = performance.now();
    let transaction = db.transaction(["test"], "readwrite");

    transaction.oncomplete = ev => {
        console.log("All done kikoo !");
        let t1 = performance.now();
        let elapsed = 0|(t1 - t0);
        writeIDB.innerHTML = "" + elapsed;
    };

    let testObjectStore = transaction.objectStore("test");
    testFile.forEach(el => {
        let r = testObjectStore.add(el);
    });


    t0SW = performance.now();
    sendRequest("addSelectedFiles", JSON.stringify(testFile), 0)
});

btnTestRead.addEventListener("click", ev => {
    let t0 = performance.now();
    let transaction = db.transaction(["test"]);
    let testObjectStore = transaction.objectStore("test");

    let request = testObjectStore.getAll();

    request.onsuccess = ev => {
        console.log("All done kikoo !", request.result);
        let t1 = performance.now();
        let elapsed = 0|(t1 - t0);
        readIDB.innerHTML = "" + elapsed;
    };

    t0SR = performance.now();
    sendRequest("getDebugData", files, 0, columns, {});
});