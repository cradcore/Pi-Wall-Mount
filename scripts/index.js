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
                if (res.data.results.length == 0) {
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
            let name = rows[index + 1].substring(8),
                start = rows[index + 3],
                startTime = '',
                end = rows[index + 4],
                endTime = '',
                loc = rows[index + 5].substring(9);
            for (let i = 0; i < start.length; i++) {
                if (!isNaN(start.charAt(i))) {
                    start = start.substring(i);
                    break;
                }
            }
            if (start.length > 8) {
                startTime = start.substring(8, 11) + ":" + start.substring(11, 13) + ":" + start.substring(13, 15) + "Z";
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
                loc: loc
            };
            if (event.end >= date)
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
            let len = events[i].end.getDate() - events[i].start.getDate(),
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
                let d = events[i].start.getTime() + (j * (60 * 60 * 24 * 1000))
                e = {
                    date: new Date(new Date(d).toDateString()),
                    loc: events[i].loc,
                    name: events[i].name
                };
                drawableEvents.push(e);
            }
        }

        function drawableEventsCompare(a, b) {
            if (a.date < b.date)
                return -1;
            if (a.date > b.date)
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
                if(i + 1 < drawableEvents.length && drawableEvents[i + 1].date.getDate() == currDate)
                    i++;
                else break;
            }
            while(eventWrapper.children[1].children[1] != null) {
                eventWrapper.children[1].children[1].remove();
            }
            for(let j = 0; j < times.length; j++) {
                let timeWrapper = eventWrapper.children[1].children[0].cloneNode(true);
                timeWrapper.classList.remove('display-none');
                if(parseInt(times[j].substring(0,2)) > 12) {
                    timeWrapper.innerHTML = parseInt(times[j].substring(0,2)) % 12 + times[j].substring(2, 5) + ' PM';
                }
                else timeWrapper.innerHTML = times[j].substring(0, 5);
                if(times[j].substring(0,5) == '00:00')
                    timeWrapper.innerHTML = "All Day";
                eventWrapper.children[1].appendChild(timeWrapper);
            }
            while(eventWrapper.children[2].children[1] != null) {
                eventWrapper.children[2].children[1].remove();
            }
            for(let j = 0; j < names.length; j++) {
                let namesWrapper = eventWrapper.children[2].children[0].cloneNode(true);
                namesWrapper.classList.remove('display-none');
                namesWrapper.innerHTML = names[j];
                eventWrapper.children[2].appendChild(namesWrapper);
            }
            eventContainer.appendChild(eventWrapper);
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

/******** init ***********/
window.onload = function () {
    DATETIME.updateDateAndTime();
    WEATHER.updateWeather();
    CALENDAR.updateCalendarContinuously();
};
