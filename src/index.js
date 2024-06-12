// background cu epochtime
import './style.css';
import searchImage from './images/search.svg';
import arrowImage from './images/arrow-up.svg';

let forecastData;
let regionUnits = 0;

const searchForm = document.querySelector('form');
const searchInput = document.querySelector('#search');
const searchIcon = document.querySelector('.searchImg');
const container = document.querySelector('.container');
const searchListContainer = document.createElement('div');
const containerMessage = document.createElement('div');
const listContainer = document.createElement('div');
const dataContainer = document.createElement('div');
const daysContainer = document.createElement('div');
const containerUnits = document.createElement('div');
const cUnits = document.createElement('span');
const fUnits = document.createElement('span');

cUnits.textContent = '°C';
fUnits.textContent = '°F';

fUnits.setAttribute('class', 'inactive');
containerUnits.setAttribute('class', 'containerUnits');
searchListContainer.setAttribute('class', 'searchListContainer');
containerMessage.setAttribute('class', 'containerMessage');
listContainer.setAttribute('class', 'listContainer');

containerUnits.appendChild(cUnits);
containerUnits.appendChild(fUnits);
listContainer.appendChild(containerMessage);
listContainer.appendChild(searchListContainer);

searchIcon.src = searchImage;

searchIcon.addEventListener('submit', function (e) {
  e.preventDefault();
  getIdFromSearch();
});

searchForm.addEventListener('submit', function (e) {
  e.preventDefault();
  getIdFromSearch();
});

cUnits.addEventListener('click', function (e) {
  e.preventDefault();
  switchUnitsC();
  if (forecastData) {
    displayInfo(forecastData);
  }
});

fUnits.addEventListener('click', function (e) {
  e.preventDefault();
  switchUnitsF();
  if (forecastData) {
    displayInfo(forecastData);
  }
});

function removeFromParent(element) {
  if (element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

function createOptionsForDataList(list) {
  removeFromParent(containerUnits);
  removeFromParent(dataContainer);
  removeFromParent(daysContainer);
  container.appendChild(listContainer);
  searchListContainer.textContent = '';
  containerMessage.textContent =
    'Multiple cities found, please click on the desired one';
  for (const index in list) {
    console.log(list[index]);
    const cityContainer = document.createElement('div');
    cityContainer.setAttribute('class', 'cityContainer');

    cityContainer.textContent = `${list[index].name}, ${list[index].region}, ${list[index].country}`;

    searchListContainer.appendChild(cityContainer);

    cityContainer.addEventListener('click', function (e) {
      console.log(list[index].id);
      getFromApi(list[index].id);
    });
  }
}

async function getIdFromSearch() {
  const searchTag = searchInput.value;
  console.log(searchInput.value);
  if (searchTag.length < 1) return;
  console.log(searchTag.length);
  try {
    const searchQ = await fetch(
      `https://api.weatherapi.com/v1/search.json?key=2787bc9543fe424eb6b92142240506&days=3&q=${searchTag}`
    );
    const searchList = await searchQ.json();
    console.log(searchList);
    console.log(searchList.length);
    if (searchList.length < 1) {
      return;
    } else if (searchList.length > 1) {
      createOptionsForDataList(searchList);
    } else {
      console.log('doar una');
      getFromApi(searchList[0].id);
    }
  } catch (error) {
    console.error('Eroare: ' + error);
  }
}

async function getFromApi(id) {
  try {
    const responseForecast = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=2787bc9543fe424eb6b92142240506&days=3&q=id:${id}`
    );
    const responseData = await responseForecast.json();
    console.log(responseData);

    if (responseData.error) {
      console.log(responseData.error.message);
      if (responseData.error.code !== 1003) {
        alert(responseData.error.message);
      }
      return;
    } else {
      forecastData = responseData;
      setBackgroundByTime();
      displayInfo(forecastData);
      removeFromParent(listContainer);
    }
  } catch (error) {
    console.error('Eroare: ' + error);
  }
}

function setBackgroundByTime() {
  // moonrise > sunrise > sunset > moonset
  if (!forecastData.forecast) return;
  const phase = forecastData.forecast.forecastday[0].astro;
  const time = forecastData.current.last_updated
    .split(' ')[1]
    .split(':')
    .join('');
  console.log(phase);
  console.log(time);
  getDateFromEpoch(forecastData.location.localtime_epoch);
  // Set background to Dawn
  if (
    time <= phase.sunrise.split(' ')[0].split(':').join('') &&
    time >= '0500'
  ) {
    document.body.setAttribute('class', 'dawn');
    // Set background to Sunrise
  } else if (
    time <= '0800' &&
    time >= phase.sunrise.split(' ')[0].split(':').join('')
  ) {
    document.body.setAttribute('class', 'sunrise');
    // Set background to Morning
  } else if (time <= '1200' && time >= '0800') {
    document.body.setAttribute('class', 'morning');
    // Set background to Afernoon
  } else if (
    time <= from12To24(phase.sunset.split(' ')[0].split(':').join('')) &&
    time >= '1200'
  ) {
    document.body.setAttribute('class', 'afternoon');
    // Set background to Sunset
  } else if (
    time <= from12To24(phase.moonset.split(' ')[0].split(':').join('')) &&
    time >= from12To24(phase.sunset.split(' ')[0].split(':').join(''))
  ) {
    document.body.setAttribute('class', 'sunset');
    // Set background to Dusk
  } else if (
    time <= '2200' &&
    time >=
      add30Mins(
        from12To24(phase.sunset.split(' ')[0].split(':').join('')),
        '0030'
      )
  ) {
    document.body.setAttribute('class', 'dusk');
    // Set background to Night
  } else if (time >= '2200') {
    document.body.setAttribute('class', 'night');
  }
}

function from12To24(string) {
  return String(Number(string) + 1200);
}

function add30Mins(string1, string2) {
  let transfer = String(Number(string1) + Number(string2));
  if (transfer.at(-2) >= 6) {
    transfer = (Number(string2) - Number(string1)) * -1 + 100;
  }
  console.log(transfer);
  return String(transfer);
}

function displayInfo(data) {
  searchForm.appendChild(containerUnits);

  dataContainer.textContent = '';
  let units = {
    tempUnits: ['°C', '°F'],
    speedUnits: ['kph', 'mph'],
    temp: [data.current.temp_c, data.current.temp_f],
    tempFeel: [data.current.feelslike_c, data.current.feelslike_f],
    heatIndex: [data.current.heatindex_c, data.current.heatindex_f],
    precip: [data.current.precip_mm, data.current.precip_in],
    wind: [data.current.wind_kph, data.current.wind_mph],
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
  temperature.textContent = `${units.temp[regionUnits]} ${units.tempUnits[regionUnits]}`;
  feelTemp.textContent = `Feels like: ${units.tempFeel[regionUnits]} ${units.tempUnits[regionUnits]}`;
  weatherCondition.textContent = data.current.condition.text;
  wind.textContent = `Wind: ${units.wind[regionUnits]} ${units.speedUnits[regionUnits]}`;
  windDir.textContent = `Wind direction: ${data.current.wind_dir}`;
  precip.textContent = `Precipitation: ${units.precip[regionUnits]}%`;
  humidity.textContent = `Humidity: ${data.current.humidity}%`;
  daysContainer.textContent = '';

  windDegreeImg.src = arrowImage;
  weatherIcon.src = data.current.condition.icon;

  windDegreeImg.style.rotate = `${data.current.wind_degree}deg`;

  containerWeather.setAttribute('class', 'containerWeather');
  dataContainer.setAttribute('class', 'dataContainer');
  containerDetails.setAttribute('class', 'containerDetails');
  containerWeatherCondition.setAttribute('class', 'containerWeatherCondition');
  daysContainer.setAttribute('class', 'daysContainer');

  container.appendChild(dataContainer);
  container.appendChild(daysContainer);
  dataContainer.appendChild(nameRegion);
  dataContainer.appendChild(timeAndDate);
  dataContainer.appendChild(containerWeather);
  dataContainer.appendChild(containerDetails);
  dataContainer.appendChild(containerWeatherCondition);

  containerWind.appendChild(windDegree);
  containerWind.appendChild(windDegreeImg);

  containerWeatherCondition.appendChild(wind);
  containerWeatherCondition.appendChild(windDir);
  containerWeatherCondition.appendChild(containerWind);

  containerWeather.appendChild(weatherCondition);
  containerWeather.appendChild(weatherIcon);
  containerWeather.appendChild(temperature);

  containerDetails.appendChild(humidity);
  containerDetails.appendChild(precip);
  containerDetails.appendChild(feelTemp);

  for (const index in data.forecast.forecastday) {
    showPerDayData(data.forecast.forecastday[index]);
  }
}

function switchUnitsC() {
  if (regionUnits === 1) {
    regionUnits = 0;
    fUnits.setAttribute('class', 'inactive');
    cUnits.removeAttribute('class');
  }
}

function switchUnitsF() {
  if (regionUnits === 0) {
    regionUnits = 1;
    cUnits.setAttribute('class', 'inactive');
    fUnits.removeAttribute('class');
  }
}

function showPerDayData(forecastday) {
  const units = {
    maxtemp: [forecastday.day.maxtemp_c, forecastday.day.maxtemp_f],
    mintemp: [forecastday.day.mintemp_c, forecastday.day.mintemp_f],
  };

  const dayContainer = document.createElement('div');
  const dayName = document.createElement('div');
  const tempContainer = document.createElement('div');
  const maxTemp = document.createElement('div');
  const precipitation = document.createElement('div');
  const avgWeatherContainer = document.createElement('div');
  const weatherIcon = document.createElement('img');
  const weatherText = document.createElement('div');
  const minTemp = document.createElement('div');

  dayContainer.setAttribute('class', 'dayContainer');
  tempContainer.setAttribute('class', 'tempContainer');
  avgWeatherContainer.setAttribute('class', 'avgWeatherContainer');

  dayName.textContent = getDayOfWeek();
  minTemp.textContent = `${units.mintemp[regionUnits]}°`;
  maxTemp.textContent = `${units.maxtemp[regionUnits]}°`;
  weatherText.textContent = `${forecastday.day.condition.text}`;

  weatherIcon.src = `${forecastday.day.condition.icon}`;

  minTemp.style.opacity = '50%';

  daysContainer.appendChild(dayContainer);

  dayContainer.appendChild(avgWeatherContainer);
  dayContainer.appendChild(precipitation);

  avgWeatherContainer.appendChild(dayName);
  avgWeatherContainer.appendChild(weatherText);
  avgWeatherContainer.appendChild(weatherIcon);
  avgWeatherContainer.appendChild(tempContainer);

  tempContainer.appendChild(maxTemp);
  tempContainer.appendChild(minTemp);

  function checkPrecipitation() {
    if (forecastday.day.daily_will_it_rain === 1) {
      precipitation.textContent = `Chance of rain is ${forecastday.day.daily_chance_of_rain}%`;
    } else if (forecastday.day.daily_will_it_snow === 1) {
      precipitation.textContent = `Chance of snow is ${forecastday.day.daily_chance_of_snow}%`;
    } else {
      precipitation.textContent = `No chance of precipitation`;
    }
  }

  function getDayOfWeek() {
    const today = new Date(forecastday.date);
    let day = today.toString();
    day = day.split(' ')[0];
    return day;
  }

  getDayOfWeek();
  checkPrecipitation();
}

function getDateFromEpoch(epoch) {
  const dateTime = new Date(epoch * 1000);
  console.log(dateTime);
  return dateTime;
}
