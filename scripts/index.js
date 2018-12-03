const DATETIME = (function () {
    const currentDate = document.querySelector("#date"),
        currentTime = document.querySelector("#time");
    let d;

    const _updateDate = () => {
        d = new Date();
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            monthsOfYear = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let dateString = '';
        dateString += daysOfWeek[d.getDay()] + ' ' + monthsOfYear[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
        currentDate.innerHTML = dateString;
    };

    const _updateTime = () => {
        d = new Date();
        let timeString = '';
        let end = '';
        if (d.getHours() > 12) {
            timeString += d.getHours() % 12;
            end = 'PM';
        } else {
            timeString += d.getHours();
            end = 'AM';
        }
        timeString += ':';
        if (d.getMinutes() < 10)
            timeString += '0' + d.getMinutes();
        else timeString += d.getMinutes();
        timeString += ' ' + end;

        currentTime.innerHTML = timeString;
    };

    const updateDateAndTime = () => {
        _updateDate();
        _updateTime();
        setInterval(_updateDate, 60000);
        setInterval(_updateTime, 5000);
    };

    return {
        updateDateAndTime
    }
})();

const WEATHER = (function () {
    const darkSkyKey = '0c6edb67c3b77ecfbb0e6c5fa92ece5d',
        openCageDataKey = 'b1ddc25b55724b6f85d9a057239ad30c',
        location = 'Colorado Springs',
        _getGeocodeURL = () => 'https://api.opencagedata.com/geocode/v1/json?q=' + location + '&key=' + openCageDataKey,
        _getDarkSkyURL = (lat, long) => 'https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/' + darkSkyKey + '/' + lat + ',' + long;

    const _getWeather = () => {
        let geocodeURL = _getGeocodeURL();

        axios.get(geocodeURL)
            .then((res) => {
                if (res.data.results.length === 0) {
                    console.error("Invalid location");
                    return;
                }

                let lat = res.data.results[0].geometry.lat;
                let long = res.data.results[0].geometry.lng;

                let darkSkyURL = _getDarkSkyURL(lat, long);
                _getDarkSkyData(darkSkyURL, location);
            })
            .catch((err) => {
                console.error(err);
            })
    };

    const _getDarkSkyData = (url, location) => {
        axios.get(url)
            .then((res) => {
                _drawWeatherData(res.data);
            })
            .catch((err) => {
                console.error(err);
            })
    };

    const _drawWeatherData = (data) => {
        _drawCurrentWeather(data);
        _drawDayWeather(data);

    };

    const _drawCurrentWeather = (data) => {
        const currentTempContainer = document.querySelector("#current-temp"),
            currentIconContainer = document.querySelector("#current-icon"),
            currentSummaryContainer = document.querySelectorAll("#current-summary"),
            currentTemp = Math.round(data.currently.temperature) + '&#176;',
            currentIcon = './images/summary-icons/' + data.currently.icon + '-white.png',
            currentSummary = data.currently.summary;

        currentTempContainer.innerHTML = currentTemp;
        currentIconContainer.src = currentIcon;
        currentSummaryContainer[0].innerText = currentSummary;
    }

    const _drawDayWeather = (data) => {
        const dailyWeatherWrapper = document.querySelector("#daily-weather"),
            daysOfWeek = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'],
            d = new Date();
        while (dailyWeatherWrapper.children[1] != null) {
            dailyWeatherWrapper.children[1].remove();
        }
        for (let i = 0; i < 7; i++) {
            let dailyWeather = dailyWeatherWrapper.children[0].cloneNode(true);
            dailyWeather.classList.remove('display-none');
            dailyWeather.children[0].innerHTML = daysOfWeek[(d.getDay() + i) % 7];
            dailyWeather.children[1].src = "./images/summary-icons/" + data.daily.data[i].icon + "-white.png";
            dailyWeather.children[2].innerHTML = Math.round(data.daily.data[i].temperatureMax) + '&#176;';
            dailyWeather.children[3].innerHTML = Math.round(data.daily.data[i].temperatureMin) + '&#176;';
            dailyWeatherWrapper.appendChild(dailyWeather);
        }
    };

    const updateWeather = () => {
        _getWeather();
        setInterval(_getWeather, 1800000);
    };

    return {
        updateWeather
    }
})();

const CALENDAR = (function () {
    const fileLoc = './iCal.txt';
    var file,
        events = [],
        date,
        drawableEvents = [];

    const _getFile = () => {
        while (drawableEvents.length > 0) {
            drawableEvents.pop();
        }
        while (events.length > 0) {
            events.pop();
        }
        let rawFile = new XMLHttpRequest();
        rawFile.open("GET", fileLoc, false);
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState === 4)
                if (rawFile.status === 200 || rawFile.status == 0)
                    file = rawFile.responseText;

        }
        rawFile.send(null);
    };

    const _parseFile = () => {
        date = new Date();
        let rows = file.split("\n");
        rows.forEach((r, index) => {
            if (!r.includes("BEGIN:VEVENT")) {
                return;
            }
            let name = '',
                start = '',
                startTime = 'T00:00:00',
                end = '',
                endTime = '',
                loc = '',
                recur = '';
            for (let i = index + 1; ; i++) {
                let atI = rows[i];

                if (atI.includes("END:VEVENT"))
                    break;

                if (atI.includes("SUMMARY:"))
                    name = atI.substring(8);
                else if (atI.includes("DTSTART"))
                    start = atI;
                else if (atI.includes("DTEND"))
                    end = atI;
                else if (atI.includes("LOCATION:"))
                    loc = atI.substring(9);
                else if (atI.includes("RRULE:"))
                    recur = atI.substring(6);
            }
            for (let i = 0; i < start.length; i++) {
                if (!isNaN(start.charAt(i))) {
                    start = start.substring(i);
                    break;
                }
            }
            if (name.includes("TBA"))
                console.log("FOUND");
            if (start.length > 8) {
                if (start.charAt(start.length - 1) == 'Z')
                    startTime = start.substring(8, 11) + ":" + start.substring(11, 13) + ":" + start.substring(13, 15) + "Z";
                else startTime = start.substring(8, 11) + ":" + start.substring(11, 13) + ":" + start.substring(13, 15);
            }
            start = start.substring(0, 4) + "-" + start.substring(4, 6) + "-" + start.substring(6, 8);
            for (let i = 0; i < end.length; i++) {
                if (!isNaN(end.charAt(i))) {
                    end = end.substring(i);
                    break;
                }
            }
            if (end.length > 8) {
                endTime = end.substring(8, 11) + ":" + end.substring(11, 13) + ":" + end.substring(13, 15) + "Z";
            }
            end = end.substring(0, 4) + "-" + end.substring(4, 6) + "-" + end.substring(6, 8);
            let event = {
                name: name,
                start: new Date(start + startTime),
                end: new Date(end + endTime),
                loc: loc,
                recur: recur
            };
            if (event.end >= date || recur != '')
                events.push(event);
        });
    };

    const _sortEvents = () => {
        function eventsCompare(a, b) {
            if (a.start < b.start)
                return -1;
            if (a.start > b.start)
                return 1;
            return 0;
        }

        events.sort(eventsCompare);
        for (let i = 0; i < events.length; i++) {
            // let len = events[i].end.getDate() - events[i].start.getDate(),
            let len = Math.round(Math.abs((events[i].start.getTime() - events[i].end.getTime()) / (24 * 60 * 60 * 1000))) - 1,
                d = events[i].start;
            if (len > 0)
                d = new Date(d.toDateString());
            let e = {
                date: d,
                loc: events[i].loc,
                name: events[i].name
            };
            drawableEvents.push(e);
            for (let j = 1; j <= len; j++) {
                let d = events[i].start.getTime() + (j * (60 * 60 * 24 * 1000));
                e = {
                    date: new Date(new Date(d).toDateString()),
                    loc: events[i].loc,
                    name: events[i].name
                };
                drawableEvents.push(e);
            }
            if (events[i].recur != '') {
                recurringEvents(e, events[i].recur);
            }
        }

        function recurringEvents(e, recur) {
            recur = recur.split(";");
            let freq = '',
                interval = '',
                count = '',
                until = '',
                byDay = '',
                byMonthDay = '',
                bySetPos = '',
                byMonth = '';

            for (let i = 0; i < recur.length; i++) {
                if (recur[i].includes("FREQ"))
                    freq = recur[i].split("=")[1];
                else if (recur[i].includes("INTERVAL"))
                    interval = recur[i].split("=")[1];
                else if (recur[i].includes("COUNT"))
                    count = recur[i].split("=")[1];
                else if (recur[i].includes("UNTIL"))
                    until = recur[i].split("=")[1];
                else if (recur[i].includes("BYDAY"))
                    byDay = recur[i].split("=")[1];
                else if (recur[i].includes("BYMONTHDAY"))
                    byMonthDay = recur[i].split("=")[1];
                else if (recur[i].includes("BYSETPOS"))
                    bySetPos = recur[i].split("=")[1];
                else if (recur[i].includes("BYMONTH"))
                    byMonth = recur[i].split("=")[1];
            }

            switch (freq) {
                case "HOURLY":
                    // recEvHourly(e, interval, until, count);
                    break;
                case "DAILY":
                    recEvDaily(e, byDay, interval, until, count);
                    break;
                case "WEEKLY":
                    // recEvWeekly(e, byDay, interval, until, count);
                    break;
                case "MONTHLY":
                    // recEvMonthly(e, byMonthDay, bySetPos, byDay, interval, until, count);
                    break;
                case "YEARLY":
                    // recEvYearly(e, byDay, bySetPos, byMonth, byMonthDay, until, count);
                    break;
                default:
                    console.log("\n\n===============\tERROR: " + freq + "\t===============\n\n");
                    break;
            }

        }

        function recEvHourly(e, interval, until, count) {
            console.log("\nHOURLY");
            console.log("NAME:\t\t\t" + e.name);
            console.log("LOCATION:\t\t" + e.loc);
            console.log("DATE:\t\t\t" + e.date);
            console.log("INTERVAL:\t\t" + interval);
            console.log("UNTIL:\t\t\t" + until);
            console.log("COUNT:\t\t\t" + count);
        }

        function recEvDaily(e, byDay, interval, until, count) {
            console.log("\nDAILY");
            console.log("NAME:\t\t\t" + e.name);
            console.log("LOCATION:\t\t" + e.loc);
            console.log("DATE:\t\t\t" + e.date);
            console.log("BYDAY:\t\t\t" + byDay);
            console.log("INTERVAL:\t\t" + interval);
            console.log("UNTIL:\t\t\t" + until);
            console.log("COUNT:\t\t\t" + count);

            // Recur: By day
            if (byDay != '') {
                byDay = byDay.split(",");
                let days = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
                for (let i = 0; i < byDay.length; i++)
                    byDay[i] = days.indexOf(byDay[i]);

                // End: after
                if (count != '') {
                    for (let i = 1; i < count; i++) {
                        let dayNum = e.date.getDay() + i;
                        let newE = {
                            date: new Date(e.date),
                            loc: e.loc,
                            name: e.name
                        };
                        while(byDay.indexOf(dayNum % 7) == -1) {
                            dayNum++;
                        }
                        newE.date.setDate(newE.date.getDate() + Math.abs(newE.date.getDay() - dayNum));
                        if ((newE.date.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000) > 365)
                            break;
                        drawableEvents.push(newE);
                    }
                }
                // End: on date
                else if (until != '') {
                    until = until.substring(0, 4) + '-' + until.substring(4, 6) + '-' + until.substring(6, 8);
                    let d = new Date(until + "T00:00:00"),
                        len = Math.round(Math.abs((e.date.getTime() - d.getTime()) / (24 * 60 * 60 * 1000)));
                    for (let i = 1; i <= len; i++) {
                        let dayNum = e.date.getDay() + i;
                        let newE = {
                            date: new Date(e.date),
                            loc: e.loc,
                            name: e.name
                        };
                        while(byDay.indexOf(dayNum % 7) == -1) {
                            dayNum++;
                            len--;
                        }
                        newE.date.setDate(newE.date.getDate() + Math.abs(newE.date.getDay() - dayNum));
                        if ((newE.date.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000) > 365)
                            break;
                        drawableEvents.push(newE);
                    }
                }
                // End: Never
                else
                {
                    for (let i = 1; ; i++) {
                        let dayNum = e.date.getDay() + i;
                        let newE = {
                            date: new Date(e.date),
                            loc: e.loc,
                            name: e.name
                        };
                        while(byDay.indexOf(dayNum % 7) == -1) {
                            dayNum++;
                            i++;
                        }
                        newE.date.setDate(newE.date.getDate() + Math.abs(newE.date.getDay() - dayNum));
                        if ((newE.date.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000) > 365)
                            break;
                        drawableEvents.push(newE);
                    }
                }
            }
            // Recur: By interval
            else {
                // End: after
                if (count != '') {
                    for (let i = 1; i < count; i++) {
                        let newE = {
                            date: new Date(e.date),
                            loc: e.loc,
                            name: e.name
                        };
                        newE.date.setDate(newE.date.getDate() + (i * interval));
                        if ((newE.date.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000) > 365)
                            break;
                        drawableEvents.push(newE);
                    }
                }
                // End: on date
                else if (until != '') {
                    until = until.substring(0, 4) + '-' + until.substring(4, 6) + '-' + until.substring(6, 8);
                    let d = new Date(until + "T00:00:00"),
                        len = Math.round(Math.abs((e.date.getTime() - d.getTime()) / (24 * 60 * 60 * 1000)));
                    for (let i = 1; i <= len; i++) {
                        let newE = {
                            date: new Date(e.date),
                            loc: e.loc,
                            name: e.name
                        };
                        newE.date.setDate(newE.date.getDate() + (i * interval));
                        if ((newE.date.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000) > 365)
                            break;
                        drawableEvents.push(newE);
                    }
                }
                // End: Never
                else {
                    for (let i = 1; ; i++) {
                        let newE = {
                            date: new Date(e.date),
                            loc: e.loc,
                            name: e.name
                        };
                        newE.date.setDate(newE.date.getDate() + (i * interval));
                        if ((newE.date.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000) > 365)
                            break;
                        drawableEvents.push(newE);
                    }
                }
            }

        }

        function recEvWeekly(e, byDay, interval, until, count) {
            console.log("\nWEEKLY");
            console.log("NAME:\t\t\t" + e.name);
            console.log("LOCATION:\t\t" + e.loc);
            console.log("DATE:\t\t\t" + e.date);
            console.log("INTERVAL:\t\t" + interval);
            console.log("UNTIL:\t\t\t" + until);
            console.log("COUNT:\t\t\t" + count);
            console.log("BYDAY:\t\t\t " + byDay);
        }

        function recEvMonthly(e, byMonthDay, bySetPos, byDay, interval, until, count) {
            console.log("\nMONTHLY");
            console.log("NAME:\t\t\t" + e.name);
            console.log("LOCATION:\t\t" + e.loc);
            console.log("DATE:\t\t\t" + e.date);
            console.log("INTERVAL:\t\t" + interval);
            console.log("UNTIL:\t\t\t" + until);
            console.log("COUNT:\t\t\t" + count);
            console.log("BYMONTHDAY:\t\t" + byMonthDay);
            console.log("BYSETPOS:\t\t" + bySetPos);
            console.log("BYDAY:\t\t\t" + byDay);
        }

        function recEvYearly(e, byDay, bySetPos, byMonth, byMonthDay, until, count) {
            console.log("\nYEARLY");
            console.log("NAME:\t\t\t" + e.name);
            console.log("LOCATION:\t\t" + e.loc);
            console.log("DATE:\t\t\t" + e.date);
            console.log("UNTIL:\t\t\t" + until);
            console.log("COUNT:\t\t\t" + count);
            console.log("BYMONTHDAY:\t\t" + byMonthDay);
            console.log("BYSETPOS:\t\t" + bySetPos);
            console.log("BYDAY:\t\t\t" + byDay);
            console.log("BYMONTH:\t\t" + byMonth);
        }

        function drawableEventsCompare(a, b) {
            // if (a.date < b.date)
            //     return -1;
            // if (a.date > b.date)
            //     return 1;
            // return 0;
            if (a.date > b.date)
                return -1;
            if (a.date < b.date)
                return 1;
            return 0;
        }

        drawableEvents.sort(drawableEventsCompare);
    };

    const _drawCalendar = () => {
        const eventContainer = document.querySelector("#calendar"),
            daysOfWeek = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'],
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        while (eventContainer.children[1] != null) {
            eventContainer.children[1].remove();
        }
        for (let i = 0; i < drawableEvents.length; i++) {
            let eventWrapper = eventContainer.children[0].cloneNode(true),
                event = drawableEvents[i];
            eventWrapper.classList.remove('display-none');
            eventWrapper.children[0].children[0].innerHTML = daysOfWeek[drawableEvents[i].date.getDay()];
            eventWrapper.children[0].children[1].innerHTML = months[drawableEvents[i].date.getMonth()] + ' ' + drawableEvents[i].date.getDate();
            let times = [],
                names = [],
                currDate = drawableEvents[i].date.getDate();
            while (true) {
                times.push(drawableEvents[i].date.toTimeString());
                names.push(drawableEvents[i].name);
                if (i + 1 < drawableEvents.length && drawableEvents[i + 1].date.getDate() == currDate)
                    i++;
                else break;
            }
            while (eventWrapper.children[1].children[1] != null) {
                eventWrapper.children[1].children[1].remove();
            }
            for (let j = 0; j < times.length; j++) {
                let timeWrapper = eventWrapper.children[1].children[0].cloneNode(true);
                timeWrapper.classList.remove('display-none');
                if (parseInt(times[j].substring(0, 2)) > 12) {
                    timeWrapper.innerHTML = parseInt(times[j].substring(0, 2)) % 12 + times[j].substring(2, 5) + ' PM';
                }
                else timeWrapper.innerHTML = timeWrapper.innerHTML = parseInt(times[j].substring(0, 2)) + times[j].substring(2, 5) + ' AM';
                if (times[j].substring(0, 5) == '00:00')
                    timeWrapper.innerHTML = "All Day";
                eventWrapper.children[1].appendChild(timeWrapper);
            }
            while (eventWrapper.children[2].children[1] != null) {
                eventWrapper.children[2].children[1].remove();
            }
            for (let j = 0; j < names.length; j++) {
                let namesWrapper = eventWrapper.children[2].children[0].cloneNode(true);
                namesWrapper.classList.remove('display-none');
                namesWrapper.innerHTML = names[j];
                eventWrapper.children[2].appendChild(namesWrapper);
            }
            eventContainer.appendChild(eventWrapper);
            if (eventContainer.children.length > 10)
                return;
        }
    };

    const _updateCalendar = () => {
        _getFile();
        _parseFile();
        _sortEvents();
        _drawCalendar();
    };

    const updateCalendarContinuously = () => {
        _updateCalendar();
        setInterval(_updateCalendar, 3600000);
    }

    return {
        updateCalendarContinuously
    }
})();

const BACKGROUND = (function () {

    const _updateBackground = () => {
        let num = (Math.round(Math.random() * 100) % 16) + 1;
        const bg = document.querySelector(".background");
        bg.style.backgroundImage = "url('images/bg/bg-" + num + ".jpg')";
    };

    const randomlyUpdate = () => {
        _updateBackground();
        setInterval(_updateBackground, 86400000);
    };

    return {
        randomlyUpdate
    }
})();

/******** init ***********/
window.onload = function () {
    DATETIME.updateDateAndTime();
    WEATHER.updateWeather();
    CALENDAR.updateCalendarContinuously();
    BACKGROUND.randomlyUpdate();
};
