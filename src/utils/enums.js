import config from './loadConfig.js';

export const DATE_OPTIONS = {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  timeZone: config.timezone,
};

export const bands = [
  {
    band: '160m',
    lower: 1.8,
    upper: 2,
  },
  {
    band: '80m',
    lower: 3.5,
    upper: 4,
  },
  {
    band: '60m',
    lower: 5.06,
    upper: 5.45,
  },
  {
    band: '40m',
    lower: 7,
    upper: 7.3,
  },
  {
    band: '30m',
    lower: 10.1,
    upper: 10.15,
  },
  {
    band: '20m',
    lower: 14,
    upper: 14.35,
  },
  {
    band: '17m',
    lower: 18.068,
    upper: 18.168,
  },
  {
    band: '15m',
    lower: 21,
    upper: 21.45,
  },
  {
    band: '12m',
    lower: 24.89,
    upper: 24.99,
  },
  {
    band: '10m',
    lower: 28,
    upper: 29.7,
  },
  {
    band: '6m',
    lower: 50,
    upper: 54,
  },
  {
    band: '4m',
    lower: 70,
    upper: 71,
  },
  {
    band: '2m',
    lower: 144,
    upper: 148,
  },
  {
    band: '1.25m',
    lower: 222,
    upper: 225,
  },
  {
    band: '70cm',
    lower: 420,
    upper: 450,
  },
];

export const bandNames = bands.map((i) => i.band);

export const mapFrequencyToBandName = (frequency) => {
  const freqMhz = frequency / 1000;
  const bandObj = bands.find((item) => {
    return freqMhz >= item.lower && freqMhz <= item.upper;
  });
  return (bandObj && bandObj.band) || false;
};
