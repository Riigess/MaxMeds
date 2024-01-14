function addRow(id, med_name, timestamp, hasDelete, i) {
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
    if(hasDelete) {
        // Create Edit button
        let editCol = document.createElement("div");
        editCol.classList.add("col-1");
        let editColAnch = document.createElement("a");
        editColAnch.href = "javascript:void(0)";
        editColAnch.onclick = function() { alert('test') };
        // let editColImg = document.createElement("img");
        // editColImg.src = "http://<IP_ADDRESS>:5000/static/images/edit.svg";
        // editColImg.style.width = "30px";
        // editColImg.style.height = "30px";
        let editColImg = document.createElement("object");
        editColImg.data = "http://<IP_ADDRESS>:5000/static/images/edit.svg";
        editColImg.style.width = "30px";
        editColImg.style.height = "30px";
        console.log("%j", editColAnch);
        editColAnch.appendChild(editColImg);
        editCol.appendChild(editColAnch);
        headerRow.appendChild(editCol);

        // Create delete button
        let delCol = document.createElement("div");
        delCol.classList.add("col-1");
        let delColAnch = document.createElement("a");
        delColAnch.href = "javascript:void(0)";
        delColAnch.onclick = function() {
            deleteEntry(id, med_name, timestamp)
        };
        let delColImg = document.createElement("img");
        delColImg.src = "http://<IP_ADDRESS>:5000/static/images/remove.png";
        delColImg.style.width = "30px";
        delColImg.style.height = "30px";

        delColAnch.appendChild(delColImg);
        delCol.appendChild(delColAnch);
        headerRow.appendChild(delCol);
    }
    medsHistCont.appendChild(headerRow);
    medsHistCont.appendChild(br);
}

function deleteEntry(id, med_name, timestamp) {
    if(confirm("Do you want to DELETE the entry (" + id + ", " + med_name + ", " + timestamp + ")?")) {
        getResult("http://<IP_ADDRESS>:5000/delete/" + id).then(response => {
            location.reload();
        });
    }
}

function onload() {
    getResult("http://<IP_ADDRESS>:5000/all").then(response => {
        let jsonResponse = JSON.parse(response);
        
        let medsHistCont = document.getElementById("meds-history");
        let br = document.createElement("div");
        br.style = "width: 90%; height: 0.5em";
        medsHistCont.appendChild(br);

        addRow("id", "Medication", "Timestamp", false, 1);
        if(jsonResponse.hasOwnProperty("data")) {
            for(let i = 0; i < jsonResponse["data"].length; i++) {
                let rowData = jsonResponse["data"][i];
                addRow(rowData["id"], rowData["med_name"], convertTime(convertDate(rowData["timestamp"])).replace("T", " "), true, i);
            }
        }
    });
}
onload();
