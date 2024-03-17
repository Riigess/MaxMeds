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
    // console.log("Timestamp: " + timestamp);
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
        let modal = document.getElementById("edit-modal"); //Needed for edit button -- overlay
        let editDate = document.getElementById("edit-date");
        let editTime = document.getElementById("edit-time");
        let editCol = document.createElement("div");
        editCol.classList.add("col-1");
        let editColAnch = document.createElement("a");
        editColAnch.href = "javascript:void(0)";
        editColAnch.onclick = function() {
            modal.style.display = "block";
            let strDateSpl = timestamp.split(' ')[0].split('-');
            let strDate = strDateSpl[2] + '-' + strDateSpl[0] + '-' + strDateSpl[1];
            let strTimeSpl = timestamp.split(' ')[1].split(':');
            var hour = parseInt(strTimeSpl[0]);
            if (timestamp.split(' ')[2] == "PM") {
                hour += 12;
            }
            hour = hour.toString();
            let strTime = hour + ':' + strTimeSpl[1];
            console.log("strDate: " + strDate + " | strTime: " + strTime);
            editDate.setAttribute("value", strDate);
            editTime.setAttribute("value", strTime);
        };
        let modalCloseBtn = document.getElementsByClassName("close")[0];
        modalCloseBtn.onclick = function() {
            modal.style.display = "none";
        }
        let modalSubmitBtn = document.getElementsByClassName("edit-submit-btn")[0];
        modalSubmitBtn.onclick = function() {
            modal.style.display = "none";
            deleteEntry(id, med_name, timestamp);
            let updatedDateTime = editDate.getAttribute("value") + "T" + editTime.getAttribute("value") + "Z";
            let newDate = Date.parse(updatedDateTime);
            let formattedDate = new Date(newDate);
            console.log("Updating entry " + id + " with newDate " + formattedDate.toDateString());
            postResult(formattedDate, med_name, "http://<IP_ADDRESS>:5000/").then(r => {
                location.reload();
            });
        }

        let editColImg = document.createElement("object");
        editColImg.data = "http://<IP_ADDRESS>:5000/static/images/edit.png";
        editColImg.style.width = "30px";
        editColImg.style.height = "30px";
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
