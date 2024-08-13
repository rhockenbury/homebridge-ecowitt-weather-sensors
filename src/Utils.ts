// Github issue link short urls
export const BUG_REPORT_LINK = "https://bit.ly/3yklrWZ";
export const FEATURE_REQ_LINK = "https://bit.ly/4fzeAtj";
export const GATEWAY_SETUP_LINK = "https://bit.ly/3YGnYVU";

//------------------------------------------------------------------------------

// custom characteristics name and uuid
export const CHAR_VALUE_NAME = 'Value';
export const CHAR_VALUE_UUID = 'dc87b6c3-84ab-41a6-ae13-69fea759ee39';

export const CHAR_TIME_NAME = 'Last Updated';
export const CHAR_TIME_UUID = 'd1130039-59df-4b0e-a8ba-8527c854e3fa';

export const CHAR_INTENSITY_NAME = 'Intensity';
export const CHAR_INTENSITY_UUID = 'fdd76937-37bb-49f2-b1a0-0705fe548782';

//------------------------------------------------------------------------------

// experimental plugin options
export const STATIC_NAMES = false;

//------------------------------------------------------------------------------

export function toCelcius(fahrenheit): number {
  return Math.round(((parseFloat(fahrenheit) - 32) * 5) / 9);
}

//------------------------------------------------------------------------------

export function tohPa(inHg): number {
  return parseFloat(inHg) * 33.8638;
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

interface Beaufort {
  force: number;
  description: string;
  kts: number;
  mph: number;
  kmh: number;
  mps: number;
}

// upper limits for each scale threshold
const kBeaufortScale = [
  {
    force: undefined,
    description: 'None',
    kts: 0,
    mph: 0,
    kmh: 0,
    mps: 0,
  },
  {
    force: 0,
    description: 'Calm',
    kts: 1,
    mph: 1,
    kmh: 2,
    mps: 0.5,
  },
  {
    force: 1,
    description: 'Light Air',
    kts: 3,
    mph: 3,
    kmh: 5,
    mps: 1.5,
  },
  {
    force: 2,
    description: 'Light Breeze',
    kts: 6,
    mph: 7,
    kmh: 11,
    mps: 3.3,
  },
  {
    force: 3,
    description: 'Gentle Breeze',
    kts: 10,
    mph: 12,
    kmh: 19,
    mps: 5.5,
  },
  {
    force: 4,
    description: 'Moderate Breeze',
    kts: 16,
    mph: 18,
    kmh: 28,
    mps: 7.9,
  },
  {
    force: 5,
    description: 'Fresh Breeze',
    kts: 21,
    mph: 24,
    kmh: 38,
    mps: 10.7,
  },
  {
    force: 6,
    description: 'Strong Breeze',
    kts: 27,
    mph: 31,
    kmh: 49,
    mps: 13.8,
  },
  {
    force: 7,
    description: 'Near Gale',
    kts: 33,
    mph: 38,
    kmh: 61,
    mps: 17.1,
  },
  {
    force: 8,
    description: 'Gale',
    kts: 40,
    mph: 46,
    kmh: 74,
    mps: 20.7,
  },
  {
    force: 9,
    description: 'Strong Gale',
    kts: 47,
    mph: 54,
    kmh: 88,
    mps: 24.4,
  },
  {
    force: 10,
    description: 'Storm',
    kts: 55,
    mph: 63,
    kmh: 102,
    mps: 28.4,
  },
  {
    force: 11,
    description: 'Violent Storm',
    kts: 63,
    mph: 72,
    kmh: 117,
    mps: 32.6,
  },
  {
    force: 12,
    description: 'Hurricane',
    kts: Number.POSITIVE_INFINITY,
    mph: Number.POSITIVE_INFINITY,
    kmh: Number.POSITIVE_INFINITY,
    mps: Number.POSITIVE_INFINITY,
  },
];

//------------------------------------------------------------------------------

export function toKts(mph): number {
  return parseFloat(mph) * 0.86897624;
}

//------------------------------------------------------------------------------

export function toKmh(mph): number {
  return parseFloat(mph) * 1.609344;
}

//------------------------------------------------------------------------------

export function toMps(mph): number {
  return parseFloat(mph) * 0.44704;
}

//------------------------------------------------------------------------------

export function toBeafort(mph): Beaufort {
  mph = parseFloat(mph);

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

  const index = Math.round((degrees % 360) / 22.5);

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
