async function getResult(url) {
    return await fetch(url, {
        // mode: 'no-cors',
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
        postResult(d, buttonName, url);
        if(buttonName === "Trazadone") {
            let traButton = document.getElementById("traButton");
            traButton.classList.remove("green");
            traButton.classList.remove("red");
            traButton.classList.add("red");
        } else {
            let gabButton = document.getElementById("gabButton");
            gabButton.classList.remove("green");
            gabButton.classList.remove("red");
            gabButton.classList.add("red");
        }
    } else {
        getResult(url).then(response=>console.log(response));
    }
}

function onLoad() {
    // let traButton = document.getElementById("traButton");
    // let gabButton = document.getElementById("gabButton");
    getResult("http://192.168.15.33:5000/trazadone").then(response => {
        let d = new Date();
        let hour = 3600;
        let h8 = hour * 8;
        let h12 = hour * 12;
        let parsedDate = Date.parse(JSON.parse(response)["timestamp"])/1000;
        let traButton = document.getElementById("traButton");
        if (((d/1000) - parsedDate) > h8) {
            traButton.classList.add("yellow");
        }
        if(((d/1000) - parsedDate) > h12) {
            traButton.classList.remove("yellow");
            traButton.classList.add("green");
        } else {
            traButton.classList.add("red");
        }
        console.log("TRAZADONE:\n" + response + "\ntimestamp:" + JSON.parse(response)['timestamp'] + "\nparsedDate: " + parsedDate);
    });
    getResult("http://192.168.15.33:5000/gabapentin").then(response => {
        let d = new Date();
        let hour = 3600;
        let h8 = hour * 8;
        let h12 = hour * 12;
        let parsedDate = Date.parse(JSON.parse(response)["timestamp"])/1000;
        let gabButton = document.getElementById("gabButton");
        if(((d/1000) - parsedDate) > h8) {
            gabButton.classList.add("yellow");
        }
        if(((d/1000) - parsedDate) > h12) {
            gabButton.classList.remove("yellow");
            gabButton.classList.add("green");
        } else {
            gabButton.classList.add("red");
        }
        console.log("GABAPENTIN:\ntimestamp:" + JSON.parse(response)['timestamp'] + "\nparsedDate: " + parsedDate);
    })
}
onLoad();
