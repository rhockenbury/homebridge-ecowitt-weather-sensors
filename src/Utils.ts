import { PlatformConfig } from 'homebridge';
// eslint-disable-next-line  @typescript-eslint/no-var-requires
const merge = require('deepmerge');

// external help links
export const BUG_REPORT_LINK = 'https://bit.ly/3yklrWZ';
export const FEATURE_REQ_LINK = 'https://bit.ly/4fzeAtj';
export const GATEWAY_SETUP_LINK = 'https://bit.ly/3YGnYVU';
export const MIGRATION_GUIDE_LINK = 'https://bit.ly/4d4K8oh';

//------------------------------------------------------------------------------

// custom characteristics name and uuid
export const CHAR_VALUE_NAME = 'Value';
export const CHAR_VALUE_UUID = 'dc87b6c3-84ab-41a6-ae13-69fea759ee39';

export const CHAR_TIME_NAME = 'Last Updated';
export const CHAR_TIME_UUID = 'd1130039-59df-4b0e-a8ba-8527c854e3fa';

export const CHAR_INTENSITY_NAME = 'Intensity';
export const CHAR_INTENSITY_UUID = 'fdd76937-37bb-49f2-b1a0-0705fe548782';

//------------------------------------------------------------------------------

// config keys
export const v1ConfigKeys = ['mac', 'port', 'path', 'unregister', 'ws', 'thbin', 'th', 'tf', 'soil', 'leak', 'pm25', 'lightning'];
export const v2ConfigKeys = ['baseStation', 'nameOverrides', 'additional', 'thresholds', 'hidden', 'units'];

//------------------------------------------------------------------------------

export function boundRange(percent: number, lowerBound: number = 0, upperBound: number = 100): number {
  return Math.max(lowerBound, Math.min(upperBound, percent));
}

//------------------------------------------------------------------------------

export function truthy(val): boolean {
  if (typeof val === 'undefined') {
    return false;
  }
  return String(val).toLowerCase() === 'true' || String(val).toLowerCase() === '1';
}

//------------------------------------------------------------------------------

export function falsy(val): boolean {
  if (typeof val === 'undefined') {
    return true;
  }
  return String(val).toLowerCase() === 'false' || String(val).toLowerCase() === '0';
}

//------------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lookup(object, key): any {
  if (typeof object === 'undefined' || typeof key === 'undefined') {
    return undefined;
  }

  let obj = {};
  if (Array.isArray(object)) {
    object.forEach(x => obj[x.key] = x.value);
  } else {
    obj = object;
  }

  const lowKey = key.toLowerCase();
  const index = Object.keys(obj).find(k => k.toLowerCase() === lowKey);

  if (typeof index === 'undefined') {
    return undefined;
  } else {
    return obj[index];
  }
}

//------------------------------------------------------------------------------

export function includesAll(arr, values): boolean {
  const lowArr = arr.map(name => name.toLowerCase());
  const lowVal = values.map(name => name.toLowerCase());
  return lowVal.every(k => lowArr.includes(k));
}

//------------------------------------------------------------------------------

export function includesAny(arr, values): boolean {
  const lowArr = arr.map(name => name.toLowerCase());
  const lowVal = values.map(name => name.toLowerCase());
  return lowVal.some(k => lowArr.includes(k));
}

//------------------------------------------------------------------------------

export function toCelcius(fahrenheit): number {
  return ((parseFloat(fahrenheit) - 32.0) * 5.0) / 9.0;
}

//------------------------------------------------------------------------------

export function toFahrenheit(celcius): number {
  return ((9.0 / 5.0) * parseFloat(celcius)) + 32.0;
}

//------------------------------------------------------------------------------

export function tohPa(inHg): number {
  return parseFloat(inHg) * 33.8638;
}

//------------------------------------------------------------------------------

export function toMile(km): number {
  return parseFloat(km) * 0.6214;
}

//------------------------------------------------------------------------------

const kWindSectors = [
  'N',
  'NNE',
  'NE',
  'ENE',
  'E',
  'ESE',
  'SE',
  'SSE',
  'S',
  'SSW',
  'SW',
  'WSW',
  'W',
  'WNW',
  'NW',
  'NNW',
];

//------------------------------------------------------------------------------

interface BeaufortType {
  force: number;
  description: string;
  kts: number;
  mph: number;
  kph: number;
  mps: number;
}

// upper limits for each scale threshold
const kBeaufortScale = [
  {
    force: 0,
    description: 'Calm',
    kts: 1,
    mph: 1,
    kph: 2,
    mps: 0.5,
  },
  {
    force: 1,
    description: 'Light Air',
    kts: 3,
    mph: 3,
    kph: 5,
    mps: 1.5,
  },
  {
    force: 2,
    description: 'Light Breeze',
    kts: 6,
    mph: 7,
    kph: 11,
    mps: 3.3,
  },
  {
    force: 3,
    description: 'Gentle Breeze',
    kts: 10,
    mph: 12,
    kph: 19,
    mps: 5.5,
  },
  {
    force: 4,
    description: 'Moderate Breeze',
    kts: 16,
    mph: 18,
    kph: 28,
    mps: 7.9,
  },
  {
    force: 5,
    description: 'Fresh Breeze',
    kts: 21,
    mph: 24,
    kph: 38,
    mps: 10.7,
  },
  {
    force: 6,
    description: 'Strong Breeze',
    kts: 27,
    mph: 31,
    kph: 49,
    mps: 13.8,
  },
  {
    force: 7,
    description: 'Near Gale',
    kts: 33,
    mph: 38,
    kph: 61,
    mps: 17.1,
  },
  {
    force: 8,
    description: 'Gale',
    kts: 40,
    mph: 46,
    kph: 74,
    mps: 20.7,
  },
  {
    force: 9,
    description: 'Strong Gale',
    kts: 47,
    mph: 54,
    kph: 88,
    mps: 24.4,
  },
  {
    force: 10,
    description: 'Storm',
    kts: 55,
    mph: 63,
    kph: 102,
    mps: 28.4,
  },
  {
    force: 11,
    description: 'Violent Storm',
    kts: 63,
    mph: 72,
    kph: 117,
    mps: 32.6,
  },
  {
    force: 12,
    description: 'Hurricane',
    kts: Number.POSITIVE_INFINITY,
    mph: Number.POSITIVE_INFINITY,
    kph: Number.POSITIVE_INFINITY,
    mps: Number.POSITIVE_INFINITY,
  },
];

//------------------------------------------------------------------------------

export function toKts(mph): number {
  return parseFloat(mph) * 0.86897624;
}

//------------------------------------------------------------------------------

export function toKph(mph): number {
  return parseFloat(mph) * 1.609344;
}

//------------------------------------------------------------------------------

export function toMps(mph): number {
  return parseFloat(mph) * 0.44704;
}

//------------------------------------------------------------------------------

export function toBeafort(mph: number): BeaufortType {
  let beaufort = kBeaufortScale.find((scale) => mph <= scale.mph);

  if (!beaufort) {
    beaufort = kBeaufortScale[kBeaufortScale.length - 1];
  }

  return beaufort;
}

//------------------------------------------------------------------------------

export function toWindSector(degrees): string {
  if (typeof degrees !== 'number' || isNaN(degrees)) {
    return 'NaN';
  }

  const index = Math.round((degrees % 360) / 24.0);

  let sectorName = kWindSectors[index];
  if (!sectorName) {
    sectorName = 'None';
  }

  return sectorName;
}

//------------------------------------------------------------------------------

// classifcations from MANOBS (Manual of Surface Weather Observations)
export function toRainIntensity(ratemm: number): string {
  if (ratemm <= 0) {
    return 'None';
  } else if (ratemm <= 2.5) {
    return 'Light';
  } else if (ratemm <= 7.5) {
    return 'Moderate';
  } else if (ratemm <= 50.0) {
    return 'Heavy';
  } else {
    return 'Violent';
  }
}

//------------------------------------------------------------------------------

interface AirQualityScaleType {
  scale: number;
  description: string;
  pm10: number;
  pm25: number;
}

// european air quality index - https://ecmwf-projects.github.io/copernicus-training-cams/proc-aq-index.html
const airQualityScale = [
  {
    scale: 1,
    description: 'Excellent',
    pm10: 20,
    pm25: 10,
  },
  {
    scale: 2,
    description: 'Good',
    pm10: 40,
    pm25: 20,
  },
  {
    scale: 3,
    description: 'Fair',
    pm10: 50,
    pm25: 25,
  },
  {
    scale: 4,
    description: 'Inferior',
    pm10: 100,
    pm25: 50,
  },
  {
    scale: 5,
    description: 'Poor',
    pm10: Number.POSITIVE_INFINITY,
    pm25: Number.POSITIVE_INFINITY,
  },
];

//------------------------------------------------------------------------------

export function toAirQuality(pm: number, pmType: string): AirQualityScaleType {
  let airQuality = airQualityScale.find((scale) => pm <= scale[pmType]);

  if (!airQuality) {
    airQuality = airQualityScale[airQualityScale.length - 1];
  }

  return airQuality;
}

//------------------------------------------------------------------------------

interface UVIndexScaleType {
  level: number;
  risk: string;
}

// https://en.wikipedia.org/wiki/Ultraviolet_index
const uvIndexScale = [
  {
    level: 2,
    risk: 'Low',
  },
  {
    level: 5,
    risk: 'Moderate',
  },
  {
    level: 7,
    risk: 'High',
  },
  {
    level: 10,
    risk: 'Very High',
  },
  {
    level: Number.POSITIVE_INFINITY,
    risk: 'Extreme',
  },
];

//------------------------------------------------------------------------------

export function toUVRiskLevel(index: number): UVIndexScaleType {
  let uvRating = uvIndexScale.find((scale) => index <= scale.level);

  if (!uvRating) {
    uvRating = uvIndexScale[uvIndexScale.length - 1];
  }

  return uvRating;
}

//------------------------------------------------------------------------------

export function v1ConfigTest(v1Config: object): boolean {
  if (includesAny(Object.keys(v1Config), v1ConfigKeys)) {
    return true;
  }

  return false;
}

//------------------------------------------------------------------------------

// convert ambient data report to ecowitt data report
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dataReportTranslator(ambDataReport: any): any {
  const ecoDataReport = JSON.parse(JSON.stringify(ambDataReport));
  let key, value;

  for (const entry of Object.entries(ambDataReport)) {
    key = entry[0];
    value = entry[1];

    if (key === 'battout') {
      if (ambDataReport.stationtype.startsWith('WS1965')) {
        delete ecoDataReport.battout;
        ecoDataReport.wh65batt = value; // assume default sensor array
        ecoDataReport.model = 'WN1920';
      }
    }
  }

  return ecoDataReport;
}

//------------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function baseStationRemapper(config: any): PlatformConfig {
  const remappedConfig = JSON.parse(JSON.stringify(config));
  let key, value;

  // hidden
  if (config.hidden !== undefined ) {
    for (const entry of Object.entries(config.hidden)) {
      key = entry[0];
      value = entry[1];

      if (key === 'GW1000' || key === 'GW2000' || key === 'GW3000' || key === 'HP2560') {
        delete remappedConfig.hidden[key];
        remappedConfig.hidden.BASE = value;
      }
    }
  }

  // nameoverride
  if (config.nameOverrides !== undefined) {
    for (let i = 0; i < config.nameOverrides.length; i++) {
      key = config.nameOverrides[i].key.split(':');
      value = config.nameOverrides[i].value;

      if (key[0] === 'GW1000' || key[0] === 'GW2000' || key[0] === 'GW3000' || key[0] === 'HP2560') {
        remappedConfig.nameOverrides[i].key = `BASE:${key[1]}`;
      }
    }
  }

  return remappedConfig;
}

//------------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function v1ConfigRemapper(v1Config: any): PlatformConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const v2Config: any = {
    'baseStation': {},
    'nameOverrides': [],
    'additional': {},
    'thresholds': {},
    'hidden': {},
    'units': {},
    'platform': 'Ecowitt',
  };

  // base station
  if (v1Config?.mac) {
    v2Config.baseStation.mac = v1Config.mac;
  }

  if (v1Config?.port) {
    v2Config.baseStation.port = v1Config.port;
  }

  if (v1Config?.path) {
    v2Config.baseStation.path = v1Config.path;
  }

  // units
  if (v1Config?.ws?.wind?.units) {
    v2Config.units.wind = v1Config?.ws?.wind?.units;
  }

  if (v1Config?.ws?.rain?.units) {
    v2Config.units.rain = v1Config?.ws?.rain?.units;
  }

  if (v1Config?.lightning?.units ) {
    v2Config.units.distance = v1Config?.lightning?.units;
  }

  v2Config.units.temperature = 'fh';

  // hidden
  if (truthy(v1Config?.thbin?.hide)) {
    v2Config.hidden['GW1000'] = true;
    v2Config.hidden['GW2000'] = true;
    v2Config.hidden['HP2560'] = true;
  }

  if (truthy(v1Config?.ws?.hide)) {
    v2Config.hidden['WS85'] = true;
    v2Config.hidden['WH65'] = true;
  }

  if (truthy(v1Config?.th?.hide)) {
    v2Config.hidden['WN31'] = true;
  }

  if (truthy(v1Config?.tf?.hide)) {
    v2Config.hidden['WN34'] = true;
  }

  if (truthy(v1Config?.soil?.hide)) {
    v2Config.hidden['WH51'] = true;
  }

  if (truthy(v1Config?.leak?.hide)) {
    v2Config.hidden['WH55'] = true;
  }

  if (truthy(v1Config?.pm25?.hide)) {
    v2Config.hidden['WH41'] = true;
  }

  if (truthy(v1Config?.lightning?.hide)) {
    v2Config.hidden['WH57'] = true;
  }

  if (truthy(v1Config?.ws?.uv?.hide)) {
    v2Config.hidden.uvIndex = true;
  }

  if (truthy(v1Config?.ws?.solarradiation?.hide)) {
    v2Config.hidden.solarRadiation = true;
  }

  const rainHide = v1Config?.ws?.rain?.hide;
  if (Array.isArray(rainHide)) {
    if (rainHide.includes('Rate')) {
      v2Config.hidden.rainRate = true;
    }

    if (rainHide.includes('Event')) {
      v2Config.hidden.rainEventTotal = true;
    }

    if (rainHide.includes('Hourly')) {
      v2Config.hidden.rainHourlyTotal = true;
    }

    if (rainHide.includes('Daily')) {
      v2Config.hidden.rainDailyTotal = true;
    }

    if (rainHide.includes('Weekly')) {
      v2Config.hidden.rainWeeklyTotal = true;
    }

    if (rainHide.includes('Monthly')) {
      v2Config.hidden.rainMonthlyTotal = true;
    }

    if (rainHide.includes('Yearly')) {
      v2Config.hidden.rainYearlyTotal = true;
    }
  }

  const windHide = v1Config?.ws?.wind?.hide;
  if (Array.isArray(windHide)) {
    if (windHide.includes('Direction')) {
      v2Config.hidden.windDirection = true;
    }

    if (windHide.includes('Speed')) {
      v2Config.hidden.windSpeed = true;
    }

    if (windHide.includes('Gust')) {
      v2Config.hidden.windGustSpeed = true;
    }

    if (windHide.includes('MaxDailyGust')) {
      v2Config.hidden.windMaxDailySpeed = true;
    }
  }

  // thresholds
  if (v1Config?.ws?.uv?.threshold) {
    v2Config.thresholds.uvIndex = v1Config?.ws?.uv?.threshold;
  }

  const windUnits = v2Config.units.wind;
  if (v1Config?.ws?.wind?.speedThreshold) {
    const threshold = boundRange(v1Config?.ws?.wind?.speedThreshold, 0, 11);
    v2Config.thresholds.windSpeed = kBeaufortScale[threshold][windUnits];
  }

  if (v1Config?.ws?.wind?.gustThreshold) {
    const threshold = boundRange(v1Config?.ws?.wind?.gustThreshold, 0, 11);
    v2Config.thresholds.windGustSpeed = kBeaufortScale[threshold][windUnits];
  }

  if (v1Config?.ws?.wind?.maxDailyGustThreshold) {
    const threshold = boundRange(v1Config?.ws?.wind?.maxDailyGustThreshold, 0, 11);
    v2Config.thresholds.windMaxDailySpeed = kBeaufortScale[threshold][windUnits];
  }

  const rainUnits = v2Config.units.rain;
  if (v1Config?.ws?.rain?.rateThreshold) {
    v2Config.thresholds.rainRate = rainUnits === 'mm' ? v1Config?.ws?.rain?.rateThreshold :
      parseFloat((v1Config?.ws?.rain?.rateThreshold / 25.4).toFixed(3));
  }

  if (v1Config?.ws?.rain?.eventThreshold) {
    v2Config.thresholds.rainEventTotal = rainUnits === 'mm' ? v1Config?.ws?.rain?.eventThreshold :
      parseFloat((v1Config?.ws?.rain?.eventThreshold / 25.4).toFixed(3));
  }

  if (v1Config?.ws?.rain?.hourlyThreshold) {
    v2Config.thresholds.rainHourlyTotal = rainUnits === 'mm' ? v1Config?.ws?.rain?.hourlyThreshold :
      parseFloat((v1Config?.ws?.rain?.hourlyThreshold / 25.4).toFixed(3));
  }

  if (v1Config?.ws?.rain?.dailyThreshold) {
    v2Config.thresholds.rainDailyTotal = rainUnits === 'mm' ? v1Config?.ws?.rain?.dailyThreshold :
      parseFloat((v1Config?.ws?.rain?.dailyThreshold / 25.4).toFixed(3));
  }

  if (v1Config?.ws?.rain?.weeklyThreshold) {
    v2Config.thresholds.rainWeeklyTotal = rainUnits === 'mm' ? v1Config?.ws?.rain?.weeklyThreshold :
      parseFloat((v1Config?.ws?.rain?.weeklyThreshold / 25.4).toFixed(3));
  }

  if (v1Config?.ws?.rain?.monthlyThreshold) {
    v2Config.thresholds.rainMonthlyTotal = rainUnits === 'mm' ? v1Config?.ws?.rain?.monthlyThreshold :
      parseFloat((v1Config?.ws?.rain?.monthlyThreshold / 25.4).toFixed(3));
  }

  if (v1Config?.ws?.rain?.yearlyThreshold) {
    v2Config.thresholds.rainYearlyTotal = rainUnits === 'mm' ? v1Config?.ws?.rain?.yearlyThreshold :
      parseFloat((v1Config?.ws?.rain?.yearlyThreshold / 25.4).toFixed(3));
  }

  // name overrides
  for (let channel = 1; channel <= 8; channel++) {
    if (v1Config?.th?.[`name${channel}`]) {
      v2Config.nameOverrides.push({'key': `WN31CH${channel}:temperature`, 'value': v1Config?.th?.[`name${channel}`]});
      v2Config.nameOverrides.push({'key': `WN31CH${channel}:humidity`, 'value': v1Config?.th?.[`name${channel}`]});
    }
  }

  for (let channel = 1; channel <= 8; channel++) {
    if (v1Config?.tf?.[`name${channel}`]) {
      v2Config.nameOverrides.push({'key': `WN34CH${channel}:temperature`, 'value': v1Config?.tf?.[`name${channel}`]});
    }
  }

  for (let channel = 1; channel <= 4; channel++) {
    if (v1Config?.pm25?.[`name${channel}`]) {
      v2Config.nameOverrides.push({'key': `WH41CH${channel}:airQualityPM25`, 'value': v1Config?.pm25?.[`name${channel}`]});
      v2Config.nameOverrides.push({'key': `WH41CH${channel}:airQualityPM25Avg`, 'value': v1Config?.pm25?.[`name${channel}`]});
    }
  }

  for (let channel = 1; channel <= 8; channel++) {
    if (v1Config?.soil?.[`name${channel}`]) {
      v2Config.nameOverrides.push({'key': `WH51CH${channel}:soilMoisture`, 'value': v1Config?.soil?.[`name${channel}`]});
    }
  }

  for (let channel = 1; channel <= 4; channel++) {
    if (v1Config?.leak?.[`name${channel}`]) {
      v2Config.nameOverrides.push({'key': `WH55CH${channel}:waterLeak`, 'value': v1Config?.leak?.[`name${channel}`]});
    }
  }

  // advanced
  if (v1Config?.ws?.solarradiation?.luxFactor) {
    v2Config.additional.luxFactor = v1Config?.ws?.solarradiation?.luxFactor || 126.7;
  }

  v2Config.additional.staticNames = 'false';
  v2Config.additional.validateMac = 'true';
  v2Config.additional.acceptAnyPath = 'false';
  v2Config.additional.validateTimestamp = 'true';
  v2Config.additional.removeStaleDevices = 'true';

  // ensure nameOverrides is array so v1 v2 merge concats overrides
  if (!Array.isArray(v1Config?.nameOverrides)) {
    v1Config.nameOverrides = [];
  }

  // v1config may be partially or fully migrated to v2
  v1ConfigKeys.forEach(v => delete v1Config[v]); // remove all migrated keys from v1
  let mergedConfig = merge(v2Config, v1Config); // merge, v1 wins conflicts
  mergedConfig = Object.fromEntries(v2ConfigKeys.map(key => [key, mergedConfig[key]])); // retain only valid v2 keys

  return mergedConfig;
}
