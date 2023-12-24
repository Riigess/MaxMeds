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
        postResult(d, buttonName, "http://127.0.0.1:5000/");
    } else {
        getResult('http://127.0.0.1:5000/').then(response=>console.log(response));
    }
}
