'use strict';

// Github issue link short urls
export const BUG_REPORT_LINK = "https://bit.ly/3yklrWZ";
export const FEATURE_REQ_LINK = "https://bit.ly/4fzeAtj";

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
  kts: number[];
  mph: number[];
  kmh: number[];
  mps: number[];
}

const kBeaufortScale = [
  {
    force: 0,
    description: 'Calm',
    kts: [1],
    mph: [1],
    kmh: [2],
    mps: [0.5],
  },
  {
    force: 1,
    description: 'Light Air',
    kts: [1, 3],
    mph: [1, 3],
    kmh: [2, 5],
    mps: [0.5, 1.5],
  },
  {
    force: 2,
    description: 'Light Breeze',
    kts: [4, 6],
    mph: [4, 7],
    kmh: [6, 11],
    mps: [1.6, 3.3],
  },
  {
    force: 3,
    description: 'Gentle Breeze',
    kts: [7, 10],
    mph: [8, 12],
    kmh: [12, 19],
    mps: [3.4, 5.5],
  },
  {
    force: 4,
    description: 'Moderate Breeze',
    kts: [11, 16],
    mph: [13, 18],
    kmh: [20, 28],
    mps: [5.5, 7.9],
  },
  {
    force: 5,
    description: 'Fresh Breeze',
    kts: [17, 21],
    mph: [19, 24],
    kmh: [29, 38],
    mps: [8, 10.7],
  },
  {
    force: 6,
    description: 'Strong Breeze',
    kts: [22, 27],
    mph: [25, 31],
    kmh: [39, 49],
    mps: [10.8, 13.8],
  },
  {
    force: 7,
    description: 'Moderate Gale',
    kts: [28, 33],
    mph: [32, 38],
    kmh: [50, 61],
    mps: [13.9, 17.1],
  },
  {
    force: 8,
    description: 'Gale',
    kts: [34, 40],
    mph: [39, 46],
    kmh: [62, 74],
    mps: [17.2, 20.7],
  },
  {
    force: 9,
    description: 'Severe Gale',
    kts: [41, 47],
    mph: [47, 54],
    kmh: [75, 88],
    mps: [20.8, 24.4],
  },
  {
    force: 10,
    description: 'Storm',
    kts: [48, 55],
    mph: [55, 63],
    kmh: [89, 102],
    mps: [24.5, 28.4],
  },
  {
    force: 11,
    description: 'Violent Storm',
    kts: [56, 63],
    mph: [64, 72],
    kmh: [103, 117],
    mps: [28.5, 32.6],
  },
  {
    force: 12,
    description: 'Hurricane',
    kts: [64, 9999],
    mph: [73, 9999],
    kmh: [118, 9999],
    mps: [32.7, 9999],
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
  for (const beaufort of kBeaufortScale) {
    if (beaufort.mph.length === 1 && mph < beaufort.mph[0]) {
      return beaufort;
    } else if (
      beaufort.mph.length === 2 &&
      mph >= beaufort.mph[0] &&
      mph <= beaufort.mph[1]
    ) {
      return beaufort;
    }
  }

  return kBeaufortScale[kBeaufortScale.length - 1];
}

//------------------------------------------------------------------------------

export function toWindSector(degrees): string {
  if (typeof degrees !== 'number' || isNaN(degrees)) {
    return 'Unkown';
  }

  const index = Math.round((degrees % 360) / 22.5);

  let sectorName = kWindSectors[index];
  if (!sectorName) {
    sectorName = 'Variable';
  }

  return sectorName;
}

//------------------------------------------------------------------------------
