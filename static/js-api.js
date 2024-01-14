async function getResult(url) {
    return await fetch(url, {
        method: 'GET',
        headers: {
            "Content-Type": "text/plain",
            "Accept": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-REQUEST-Method": "GET"
        }
    })
    .then(response => response.text());
}

async function postResult(dateTime, drug, url) {
    return await fetch(url, {
        method: "POST",
        headers: {
            "timestamp": getDateTimeDBString(dateTime),
            "medication": drug,
            "Content-type": "application/json; charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Request-Method": "POST"
        }
    });
}

function getMonthName(month) {
    switch(month) {
        case 0:
            return "January";
        case 1:
            return "February";
        case 2:
            return "March";
        case 3:
            return "April";
        case 4:
            return "May";
        case 5:
            return "June";
        case 6:
            return "July";
        case 7:
            return "August";
        case 8:
            return "September";
        case 9:
            return "October";
        case 10:
            return "November";
        case 11:
            return "December";
        default:
            return "Unknown";
    }
}

function getDateTimeString(dDate) {
    return getMonthName(dDate.getMonth()) + " " + dDate.getDate() + ", " + dDate.getFullYear() + " at " + dDate.getHours() + ":" + dDate.getMinutes() + ":" + dDate.getSeconds();
}

function getDateTimeDBString(dDate) {
    return dDate.getMonth() + "-" + dDate.getDate() + "-" + dDate.getFullYear() + " " + dDate.getHours() + ":" + dDate.getMinutes() + ":" + dDate.getSeconds();
}

function confirmPress(buttonName, url) {
    let d = new Date();
    let conf = confirm("Confirm Max was given " + buttonName + " on " + getDateTimeString(d));
    if(conf) {
        postResult(d, buttonName, url).then(r => {
            location.reload();
        });
    } else {
        getResult(url).then(response=>console.log(response));
    }
}

function convertDate(time) {
    var date = "";
    let fTime = time.split(" ")[1];
    if(time.split(" ")[0].split("-")[0].length > 2) {
        let splDate = time.split(" ")[0].split("-");
        date = splDate[1] + "-" + splDate[2] + "-" + splDate[0];
    } else {
        date = time.split(" ")[0];
    }
    return date + " " + fTime;
}

function convertTime(time) {
    var toRet = time.split(" ")[0];
    let fTime = time.split(" ")[1];
    let min = fTime.split(":")[1];
    let sec = fTime.split(":")[2];
    let intTSConv = parseInt(fTime.split(":")[0]);
    if(intTSConv < 13 && intTSConv > 0) {
        toRet = toRet + " " + fTime + " AM";
    } else if (intTSConv < 24) {
        if(intTSConv < 20) {
            toRet = toRet + " 0" + (intTSConv-12) + ":" + min + ":" + sec + " PM";
        } else {
            toRet = toRet + " " + (intTSConv - 12) + ":" + min + ":" + sec + " PM";
        }
    } else {
        toRet = toRet + " 00:" + min + ":" + sec + " AM";
    }
    return toRet;
}

function onLoad() {
    getResult("http://<IP_ADDRESS>:5000/trazadone").then(response => {
        let d = new Date();
        let hour = 3600;
        let h8 = hour * 8;
        let h12 = hour * 12;
        let traButton = document.getElementById("traButton");

        //Parsing multi-response data..
        var parsedDates = [];
        console.log("Response: " + response);
        let jsonResponse = JSON.parse(response);
        let dates = [];
        for(let i = 0; i < jsonResponse['data'].length; i++) {
            let lastDate = Date.parse(jsonResponse["data"][i]["timestamp"]) / 1000;
            parsedDates.push(lastDate);
            let adjustedDate = convertTime(convertDate(jsonResponse["data"][i]["timestamp"]));
            dates.push(adjustedDate.replace("T", " "));
        }

        //Setting up last-updated-at text for Trazadone..
        let lastUpdatedAt = document.getElementById("last-updated-at");
        lastUpdatedAt.innerHTML = '<div><div style="text-align: left; position:absolute;">Last Taken At: </div><div style="text-align:right;"><div>' + dates[0] + '</div><div>' + dates[1] + '</div></div></div>';

        // For multi-response timestamps...
        let measuredDate = parsedDates[1];
        if((d/1000) - measuredDate > h12) {
            traButton.classList.add("green");
        } else if((d/1000) - measuredDate > h8) {
            traButton.classList.add("yellow");
        } else {
            traButton.classList.add("red");
        }
    });
    getResult("http://<IP_ADDRESS>:5000/gabapentin").then(response => {
        let d = new Date();
        let hour = 3600;
        let h8 = hour * 8;
        let h12 = hour * 12;
        console.log(response)
        let parsedDate = Date.parse(JSON.parse(response)["timestamp"])/1000;
        let gabButton = document.getElementById("gabButton");
        if(((d/1000) - parsedDate) > h12) {
            gabButton.classList.add("green");
        } else if(((d/1000) - parsedDate) > h8) {
            gabButton.classList.add("yellow");
        } else {
            gabButton.classList.add("red");
        }
        console.log("GABAPENTIN:\ntimestamp:" + JSON.parse(response)['timestamp'] + "\nparsedDate: " + parsedDate);
    })
}
// onLoad();
