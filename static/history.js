function addRow(id, med_name, timestamp, i) {
    let medsHistCont = document.getElementById("meds-history");
    let headerRow = document.createElement("div");
    headerRow.classList.add("row");
    headerRow.style = "text-align: center; color: #ccc;";
    let hColA = document.createElement("div");
    hColA.classList.add("col-2");
    hColA.textContent = id;
    let hColB = document.createElement("div");
    hColB.classList.add("col-2");
    hColB.textContent = med_name;
    let hColC = document.createElement("div");
    hColC.classList.add("col-4");
    hColC.textContent = timestamp;
    let br = document.createElement("div");
    var backgroundColor = "background: #ccc";
    if(i % 2 == 0) {
        backgroundColor = "";
    }
    br.style = "width: 92%; height: 2px; margin-top:0.5em; " + backgroundColor;

    headerRow.appendChild(hColA);
    headerRow.appendChild(hColB);
    headerRow.appendChild(hColC);
    medsHistCont.appendChild(headerRow);
    medsHistCont.appendChild(br);
}

function onload() {
    getResult("http://<IP_ADDRESS>:5000/all").then(response => {
        let jsonResponse = JSON.parse(response);
        
        let medsHistCont = document.getElementById("meds-history");
        let br = document.createElement("div");
        br.style = "width: 90%; height: 0.5em";
        medsHistCont.appendChild(br);

        addRow("id", "Medication", "Timestamp", 1);
        if(jsonResponse.hasOwnProperty("data")) {
            for(let i = 0; i < jsonResponse["data"].length; i++) {
                let rowData = jsonResponse["data"][i];
                addRow(rowData["id"], rowData["med_name"], convertTime(convertDate(rowData["timestamp"])).replace("T", " "), i);
            }
        }
    });
}
onload();