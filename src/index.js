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
    const cityContainer = document.createElement('div');
    cityContainer.setAttribute('class', 'cityContainer');

    cityContainer.textContent = `${list[index].name}, ${list[index].region}, ${list[index].country}`;

    searchListContainer.appendChild(cityContainer);

    cityContainer.addEventListener('click', function (e) {
      getFromApi(list[index].id);
    });
  }
}

async function getIdFromSearch() {
  const searchTag = searchInput.value;
  try {
    const searchQ = await fetch(
      `https://api.weatherapi.com/v1/search.json?key=2787bc9543fe424eb6b92142240506&days=3&q=${searchTag}`
    );
    const searchList = await searchQ.json();
    if (searchList.length < 1) {
      alert('No results, try something else');
      return;
    } else if (searchList.length > 1) {
      createOptionsForDataList(searchList);
    } else {
      getFromApi(searchList[0].id);
    }
  } catch (error) {}
}

async function getFromApi(id) {
  try {
    const responseForecast = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=2787bc9543fe424eb6b92142240506&days=3&q=id:${id}`
    );
    const responseData = await responseForecast.json();

    if (responseData.error) {
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
  } catch (error) {}
}

function setBackgroundByTime() {
  // dawn = sunrise - 30 mins < sunrise < afternoon 12:00 < sunset < dusk = sunset + 30 mins < night 22:00
  // moonrise > sunrise > sunset > moonset
  if (!forecastData.forecast) return;
  const phase = forecastData.forecast.forecastday[0].astro;
  const time = Date.parse(forecastData.location.localtime);
  // Substract 30 minutes from sunrise time in order to have night time until dawn
  if (time <= getPhaseTime(phase.sunrise) - 30 * 60 * 1000) {
    // Set background to Night
    document.body.setAttribute('class', 'night');
  } else if (time <= getPhaseTime(phase.sunrise)) {
    // Set background to Dawn
    document.body.setAttribute('class', 'dawn');
  } else if (time <= getPhaseTime('08:00 AM')) {
    // Set background to Sunrise
    document.body.setAttribute('class', 'sunrise');
  } else if (time <= getPhaseTime('12:00 PM')) {
    //Set background to Morning
    document.body.setAttribute('class', 'morning');
  } else if (time <= getPhaseTime(phase.sunset)) {
    // Set background to Afernoon
    document.body.setAttribute('class', 'afternoon');
    // Add 30 minutes from sunset in order to have sunset until dusk
  } else if (time <= getPhaseTime(phase.sunset) + 30 * 60 * 1000) {
    // Set background to Sunset
    document.body.setAttribute('class', 'sunset');
  } else if (time <= getPhaseTime('10:00 PM')) {
    // Set background to Dusk
    document.body.setAttribute('class', 'dusk');
  } else if (time <= getPhaseTime('11:59:59 PM')) {
    // Set background to Night
    document.body.setAttribute('class', 'night');
  }
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

  dayContainer.addEventListener('click', function (e) {
    e.preventDefault();
    dataForThisDay(forecastday);
  });

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

function getPhaseTime(phase) {
  const newPhase = Date.parse(
    `${forecastData.forecast.forecastday[0].date} ${phase}`
  );
  return newPhase;
}

function dataForThisDay(day) {
  const hourlyContainer = document.createElement('div');

  hourlyContainer.setAttribute('class', 'hourlyContainer');

  document.body.appendChild(hourlyContainer);

  hourlyContainer.addEventListener('click', function () {
    document.body.removeChild(hourlyContainer);
  });

  for (const hour in day.hour) {
    const units = {
      temp: [day.hour[hour].temp_c, day.hour[hour].temp_f],
    };
    const hourlyData = document.createElement('div');
    const time = document.createElement('div');
    const weatherContainer = document.createElement('div');
    const weatherCondition = document.createElement('div');
    const weatherIcon = document.createElement('img');
    const temperature = document.createElement('div');

    time.textContent = day.hour[hour].time.split(' ')[1];
    weatherCondition.textContent = day.hour[hour].condition.text;
    temperature.textContent = `${units.temp[regionUnits]}°`;

    weatherIcon.src = day.hour[hour].condition.icon;

    hourlyContainer.appendChild(hourlyData);

    hourlyData.appendChild(time);
    hourlyData.appendChild(weatherContainer);
    hourlyData.appendChild(temperature);

    weatherContainer.appendChild(weatherCondition);
    weatherContainer.appendChild(weatherIcon);
  }
}
