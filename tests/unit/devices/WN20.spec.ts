import { expect } from 'chai';
import { WN20 } from './../../../src/devices/WN20';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let device = null;

const dataReport1 = {
  'dateutc': '2024-07-24 19:04:22',
  'rainratein': '1.100',
  'eventrainin': '2.200',
  'hourlyrainin': '3.300',
  'last24hrainin': '4.500',
  'dailyrainin': '4.400',
  'weeklyrainin': '5.500',
  'monthlyrainin': '6.600',
  'yearlyrainin': '7.700',
  'totalrainin': '8.800',
  'wn20batt': '2.4',
};

const dataReport2 = {
  'dateutc': '2024-07-24 19:04:22',
  'eventrainin': '2.200',
  'hourlyrainin': '3.300',
  'dailyrainin': '4.400',
  'weeklyrainin': '5.500',
  'monthlyrainin': '6.600',
  'yearlyrainin': '7.700',
  'wn20batt': '2.4',
};

const configs = ['v1Default', 'v1Full', 'v2Default', 'v2Full'];

configs.forEach(config => {
  describe(`WN20 device should be configured ${config}`, () => {
    before('Initialize device', () => {
      platform = createPlatform(config);
      accessory = new api.platformAccessory('Accessory', '5746853e-4fee-4e47-97dd-53065ef1de03');
      platform.baseStationInfo.protocol = 'Ecowitt';
      platform.config.nameOverrides = [];
      platform.config.hidden = {};

      device = new WN20(platform, accessory);
    });

    beforeEach('Reset config', () => {
      platform.config.nameOverrides = [];
      platform.config.hidden = {};
    });

    it('Services are created', (done) => {
      expect(device.battery).to.not.be.undefined;
      expect(device.rainRate).to.not.be.undefined;
      expect(device.eventRain).to.not.be.undefined;
      expect(device.hourlyRain).to.not.be.undefined;
      expect(device.last24hRain).to.not.be.undefined;
      expect(device.dailyRain).to.not.be.undefined;
      expect(device.weeklyRain).to.not.be.undefined;
      expect(device.monthlyRain).to.not.be.undefined;
      expect(device.yearlyRain).to.not.be.undefined;
      expect(device.totalRain).to.not.be.undefined;

      expect(device.battery.service.characteristics[0].value).to.equal('Battery');
      expect(device.rainRate.service.characteristics[0].value).to.equal('Rain Rate');
      expect(device.eventRain.service.characteristics[0].value).to.equal('Rain Event Total');
      expect(device.hourlyRain.service.characteristics[0].value).to.equal('Rain Hourly Total');
      expect(device.last24hRain.service.characteristics[0].value).to.equal('Rain Last 24h Total');
      expect(device.dailyRain.service.characteristics[0].value).to.equal('Rain Daily Total');
      expect(device.weeklyRain.service.characteristics[0].value).to.equal('Rain Weekly Total');
      expect(device.monthlyRain.service.characteristics[0].value).to.equal('Rain Monthly Total');
      expect(device.yearlyRain.service.characteristics[0].value).to.equal('Rain Yearly Total');
      expect(device.totalRain.service.characteristics[0].value).to.equal('Rain Total');
      done();
    });

    it('Update is called successfully', (done) => {
      device.update(dataReport1);

      expect(device.battery.service.characteristics[1].value).to.equal(0); // not low batt
      expect(device.battery.service.characteristics[4].value).to.equal(73); // batt percentage
      expect(device.rainRate.service.characteristics[0].value).to.equal('Rain Rate 1.1 in/hour');
      expect(device.eventRain.service.characteristics[0].value).to.equal('Rain Event Total 2.2 in');
      expect(device.hourlyRain.service.characteristics[0].value).to.equal('Rain Hourly Total 3.3 in');
      expect(device.last24hRain.service.characteristics[0].value).to.equal('Rain Last 24h Total 4.5 in');
      expect(device.dailyRain.service.characteristics[0].value).to.equal('Rain Daily Total 4.4 in');
      expect(device.weeklyRain.service.characteristics[0].value).to.equal('Rain Weekly Total 5.5 in');
      expect(device.monthlyRain.service.characteristics[0].value).to.equal('Rain Monthly Total 6.6 in');
      expect(device.yearlyRain.service.characteristics[0].value).to.equal('Rain Yearly Total 7.7 in');
      expect(device.totalRain.service.characteristics[0].value).to.equal('Rain Total 8.8 in');
      done();
    });

    it('Update is called successfully with no optional data', (done) => {
      device.update(dataReport2);

      expect(device.battery.service.characteristics[1].value).to.equal(0); // not low batt
      expect(device.battery.service.characteristics[4].value).to.equal(73); // batt percentage
      expect(device.eventRain.service.characteristics[0].value).to.equal('Rain Event Total 2.2 in');
      expect(device.hourlyRain.service.characteristics[0].value).to.equal('Rain Hourly Total 3.3 in');
      expect(device.dailyRain.service.characteristics[0].value).to.equal('Rain Daily Total 4.4 in');
      expect(device.weeklyRain.service.characteristics[0].value).to.equal('Rain Weekly Total 5.5 in');
      expect(device.monthlyRain.service.characteristics[0].value).to.equal('Rain Monthly Total 6.6 in');
      expect(device.yearlyRain.service.characteristics[0].value).to.equal('Rain Yearly Total 7.7 in');

      // optional
      expect(device.rainRate).to.be.undefined;
      expect(device.last24hRain).to.be.undefined;
      expect(device.totalRain).to.be.undefined;
      done();
    });

    it('Services are created with name overrides', (done) => {
      platform.config.nameOverrides[0] = {'key': 'WN20:rainRate', 'value': 'Test Rain Rate Name'};
      platform.config.nameOverrides[1] = {'key': 'WN20:rainEventTotal', 'value': 'Test Rain Event Total Name'};
      platform.config.nameOverrides[2] = {'key': 'WN20:rainHourlyTotal', 'value': 'Test Rain Hourly Total Name'};
      platform.config.nameOverrides[3] = {'key': 'WN20:rainLast24hTotal', 'value': 'Test Rain Last 24h Total Name'};
      platform.config.nameOverrides[4] = {'key': 'WN20:rainDailyTotal', 'value': 'Test Rain Daily Total Name'};
      platform.config.nameOverrides[5] = {'key': 'WN20:rainWeeklyTotal', 'value': 'Test Rain Weekly Total Name'};
      platform.config.nameOverrides[6] = {'key': 'WN20:rainMonthlyTotal', 'value': 'Test Rain Monthly Total Name'};
      platform.config.nameOverrides[7] = {'key': 'WN20:rainYearlyTotal', 'value': 'Test Rain Yearly Total Name'};
      platform.config.nameOverrides[8] = {'key': 'WN20:rainTotal', 'value': 'Test Rain Total Name'};

      device = new WN20(platform, accessory);

      expect(device.rainRate.service.characteristics[0].value).to.equal('Test Rain Rate Name');
      expect(device.eventRain.service.characteristics[0].value).to.equal('Test Rain Event Total Name');
      expect(device.hourlyRain.service.characteristics[0].value).to.equal('Test Rain Hourly Total Name');
      expect(device.last24hRain.service.characteristics[0].value).to.equal('Test Rain Last 24h Total Name');
      expect(device.dailyRain.service.characteristics[0].value).to.equal('Test Rain Daily Total Name');
      expect(device.weeklyRain.service.characteristics[0].value).to.equal('Test Rain Weekly Total Name');
      expect(device.monthlyRain.service.characteristics[0].value).to.equal('Test Rain Monthly Total Name');
      expect(device.yearlyRain.service.characteristics[0].value).to.equal('Test Rain Yearly Total Name');
      expect(device.totalRain.service.characteristics[0].value).to.equal('Test Rain Total Name');
      done();
    });

    it('Services are not created when hidden with general override', (done) => {
      platform.config.hidden['rainRate'] = true;
      platform.config.hidden['rainEventTotal'] = true;
      platform.config.hidden['rainHourlyTotal'] = true;
      platform.config.hidden['rainLast24hTotal'] = true;
      platform.config.hidden['rainDailyTotal'] = true;
      platform.config.hidden['rainWeeklyTotal'] = true;
      platform.config.hidden['rainMonthlyTotal'] = true;
      platform.config.hidden['rainYearlyTotal'] = true;
      platform.config.hidden['rainTotal'] = true;

      device = new WN20(platform, accessory);

      expect(device.rainRate).to.be.undefined;
      expect(device.eventRain).to.be.undefined;
      expect(device.hourlyRain).to.be.undefined;
      expect(device.last24hRain).to.be.undefined;
      expect(device.dailyRain).to.be.undefined;
      expect(device.weeklyRain).to.be.undefined;
      expect(device.monthlyRain).to.be.undefined;
      expect(device.yearlyRain).to.be.undefined;
      expect(device.totalRain).to.be.undefined;
      done();
    });

    it('Services are not created when hidden with device-specific override', (done) => {
      platform.config.hidden['WN20:rainRate'] = true;
      platform.config.hidden['WN20:rainEventTotal'] = true;
      platform.config.hidden['WN20:rainHourlyTotal'] = true;
      platform.config.hidden['WN20:rainLast24hTotal'] = true;
      platform.config.hidden['WN20:rainDailyTotal'] = true;
      platform.config.hidden['WN20:rainWeeklyTotal'] = true;
      platform.config.hidden['WN20:rainMonthlyTotal'] = true;
      platform.config.hidden['WN20:rainYearlyTotal'] = true;
      platform.config.hidden['WN20:rainTotal'] = true;

      device = new WN20(platform, accessory);

      expect(device.rainRate).to.be.undefined;
      expect(device.eventRain).to.be.undefined;
      expect(device.hourlyRain).to.be.undefined;
      expect(device.last24hRain).to.be.undefined;
      expect(device.dailyRain).to.be.undefined;
      expect(device.weeklyRain).to.be.undefined;
      expect(device.monthlyRain).to.be.undefined;
      expect(device.yearlyRain).to.be.undefined;
      expect(device.totalRain).to.be.undefined;
      done();
    });
  });
});
