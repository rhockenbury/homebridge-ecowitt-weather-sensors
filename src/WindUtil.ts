'use strict';

//------------------------------------------------------------------------------

const kSectors = [
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

const kBeaufortScale = [
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

export function toSector(degrees): string {
  if (typeof degrees !== 'number' || isNaN(degrees)) {
    return 'NaN';
  }

  const index = Math.round((degrees % 360) / 22.5);

  let sectorName = kSectors[index];
  if (!sectorName) {
    sectorName = 'NaN';
  }

  return sectorName;
}
