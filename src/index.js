import "./style.css";
import searchImage from "./images/search.svg";
import arrowImage from "./images/arrow-up.svg";

const searchForm = document.querySelector('form');
const searchInput = document.querySelector('#search');
const searchIcon = document.querySelector('.searchImg');
const dataContainer = document.createElement('div');
const containerUnits = document.createElement('div');
const cUnits = document.createElement('span');
const fUnits = document.createElement('span');

cUnits.textContent = '°C';
fUnits.textContent = '°F';

containerUnits.setAttribute('class', 'containerUnits');

searchForm.appendChild(containerUnits);
containerUnits.appendChild(cUnits);
containerUnits.appendChild(fUnits);

searchIcon.src = searchImage;

searchIcon.addEventListener('click', function(e) {
    getFromApi()
})

searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    getFromApi()
});

cUnits.addEventListener('click', function(e) {
    e.preventDefault();
    switchUnitsC();
    if (responseData) {
        displayInfo(responseData);
    }
});

fUnits.addEventListener('click', function(e) {
    e.preventDefault();
    switchUnitsF();
    if (responseData) {
        displayInfo(responseData);
    }
});

let responseData;
let forecastData;
let regionUnits = 0;

if (regionUnits === 0) {
    document.querySelector("body > form > div > span:nth-child(2)").style.opacity = "30%";
} else {
    document.querySelector("body > form > div > span:nth-child(1)").style.opacity = "30%";
}

async function getFromApi() {
    const searchTag = searchInput.value
    console.log(searchInput.value)
    try {
        const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=2787bc9543fe424eb6b92142240506&q=${searchTag}`);
        responseData = await response.json();
        const responseForecast = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=2787bc9543fe424eb6b92142240506&days=3&q=${searchTag}`);
        forecastData = await responseForecast.json();
        console.log(responseData);
        console.log(forecastData);

        if (responseData.error) {
            console.log(responseData.error.message);
            if (responseData.error.code !== 1003) {
                alert(responseData.error.message);
            }
            return
        }

    } catch (error) {
        console.error('Eroare: ' + error);
    }

    setBackgroundByTime();
    displayInfo(responseData);
}

function setBackgroundByTime() {
    if (!forecastData.forecast) return;
    const phase = forecastData.forecast.forecastday[0].astro;
    const time = responseData.current.last_updated.split(' ')[1].split(':').join('');
    console.log(phase)
    console.log(time)
    // Set background to Dawn
    if (time <= (phase.sunrise.split(' ')[0].split(':').join('')) && time >= (phase.moonrise.split(' ')[0].split(':').join(''))) {
        document.body.setAttribute('class', 'dawn');
    // Set background to Sunrise
    } else if (time <= '0800' && time >= (phase.sunrise.split(' ')[0].split(':').join(''))) {
        document.body.setAttribute('class', 'sunrise');
    // Set background to Morning
    } else if (time <= '1200' && time >= '0800') {
        document.body.setAttribute('class', 'morning');
    // Set background to Afernoon
    } else if (time <= from12To24(phase.sunset.split(' ')[0].split(':').join('')) && time >= '1200') {
        document.body.setAttribute('class', 'afternoon');
    // Set background to Sunset
    } else if (time <= from12To24(phase.moonset.split(' ')[0].split(':').join('')) && time >= from12To24(phase.sunset.split(' ')[0].split(':').join(''))) {
        document.body.setAttribute('class', 'sunset');
    // Set background to Dusk
    } else if (time <= '2200' && time >= from12To24(phase.moonset.split(' ')[0].split(':').join(''))) {
        document.body.setAttribute('class', 'dusk');
    // Set background to Night
    } else if (time <= (phase.moonrise.split(' ')[0].split(':').join('')) || time >= '2200') {
        document.body.setAttribute('class', 'night');
    }
}

function from12To24(string) {
    return String(Number(string) + 1200)
}

function displayInfo(data) {
    const today = new Date(forecastData.forecast.forecastday[0].date);
    const day = `${today}`;
    console.log(today);
    console.log(day.split(" ")[0]);
    dataContainer.textContent = '';
    let units = {
        'temp': [data.current.temp_c, data.current.temp_f],
        'tempFeel': [data.current.feelslike_c, data.current.feelslike_f],
        'heatIndex': [data.current.heatindex_c, data.current.heatindex_f],
        'precip': [data.current.precip_mm, data.current.precip_in],
        'wind': [data.current.wind_kph, data.current.wind_mph]
    };
    const nameRegion = document.createElement('div');
    const timeAndDate = document.createElement('div');
    const temperature = document.createElement('div');
    const feelTemp = document.createElement('div');
    const containerWeatherCondition = document.createElement('div');
    const containerWeather = document.createElement('div');
    const weatherCondition = document.createElement('div');
    const weatherIcon = document.createElement('img');
    const containerWind = document.createElement('div');
    const wind = document.createElement('div');
    const windDegree = document.createElement('div');
    const windDegreeImg = document.createElement('img');
    const windDir = document.createElement('div');
    const precip = document.createElement('div');
    const humidity = document.createElement('div');
    const containerDetails = document.createElement('div');
    nameRegion.textContent = `Displaying weather in ${data.location.name}, ${data.location.region}`;
    timeAndDate.textContent = `Local time: ${data.location.localtime}`;
    temperature.textContent = `Temperature: ${units.temp[regionUnits]}°`;
    feelTemp.textContent = `Feels like: ${units.tempFeel[regionUnits]}°`;
    weatherCondition.textContent = data.current.condition.text;
    wind.textContent = `Wind: ${units.wind[regionUnits]}°`;
    windDegree.textContent = `Wind degree: ${data.current.wind_degree}° `;
    windDir.textContent = `Wind direction: ${data.current.wind_dir}`;
    precip.textContent = `Precipitation: ${units.precip[regionUnits]}%`;
    humidity.textContent = `Humidity: ${data.current.humidity}%`;

    windDegreeImg.src = arrowImage
    weatherIcon.src = (data.current.condition.icon);

    windDegreeImg.style.rotate = `${data.current.wind_degree}deg`
  

    containerWeather.setAttribute('class', 'containerWeather');
    dataContainer.setAttribute('class', 'dataContainer');
    containerDetails.setAttribute('class', 'containerDetails')

    document.body.appendChild(dataContainer);
    dataContainer.appendChild(nameRegion);
    dataContainer.appendChild(timeAndDate);
    dataContainer.appendChild(containerWeather);
    dataContainer.appendChild(containerDetails);
    dataContainer.appendChild(containerWeatherCondition);

    containerWind.appendChild(windDegree);
    containerWind.appendChild(windDegreeImg);

    containerWeatherCondition.appendChild(wind);
    containerWeatherCondition.appendChild(containerWind);
    containerWeatherCondition.appendChild(windDir);
    
    containerWeather.appendChild(weatherCondition);
    containerWeather.appendChild(weatherIcon);

    containerDetails.appendChild(temperature);
    containerDetails.appendChild(humidity);
    containerDetails.appendChild(precip);
    containerDetails.appendChild(feelTemp);
    
}

function switchUnitsC() {
    if (regionUnits === 1) {
        regionUnits = 0;
        document.querySelector("body > form > div > span:nth-child(2)").style.opacity = "30%";
        document.querySelector("body > form > div > span:nth-child(1)").style.opacity = "100%";
    }
}

function switchUnitsF() {
    if (regionUnits === 0) {
        regionUnits = 1;
        document.querySelector("body > form > div > span:nth-child(1)").style.opacity = "30%";
        document.querySelector("body > form > div > span:nth-child(2)").style.opacity = "100%";
    }
}
