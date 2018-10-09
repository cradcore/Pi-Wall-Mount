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
    const url = 'https://calendar.zoho.com/ical/692bec6ab235e89cc81c2f4396550d5114b84a210383773464da795cb50c4317dbb1832fec8c2a872a88ef109692dd25/pvt_675fc46fe4206f6ed2ec22701f676a13dce8d502c3bcbff0ad393afef8c226488cabcad57cbbb1a0';

    const _getFile = () => {
        var request = new XMLHttpRequest();
        request.open("GET", url);
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                //response handling code


            }
        };
        request.send(null); // Send the request now
        console.log(request);

    };

    const updateCalendar = () => {
        _getFile();
    };

    return {
        updateCalendar
    }
})();

/******** init ***********/
window.onload = function () {
    DATETIME.updateDateAndTime();
    WEATHER.updateWeather();
    CALENDAR.updateCalendar();
};
