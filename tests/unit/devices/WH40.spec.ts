import { expect } from 'chai';
import { WH40 } from './../../../src/devices/WH40';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let sensor = null;

const dataReport = {
  "dateutc": "2024-07-24 19:04:22",
  "rainratein": "1.100",
  "eventrainin": "2.200",
  "hourlyrainin": "3.300",
  "dailyrainin": "4.400",
  "weeklyrainin": "5.500",
  "monthlyrainin": "6.600",
  "yearlyrainin": "7.700",
  "wh40batt": "1.2"
};

const configs = ["v1Default", "v1Full", "v2Default", "v2Full"];

configs.forEach(config => {
  describe(`WH40 device should be configured ${config}`, () => {
    before('Initialize device', () => {
      platform = createPlatform(config);
      accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03");
      platform.baseStationInfo.protocol = "Ecowitt";
      platform.config.nameOverrides = [];
      platform.config.hidden = {};

      device = new WH40(platform, accessory);
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
      expect(device.dailyRain).to.not.be.undefined;
      expect(device.weeklyRain).to.not.be.undefined;
      expect(device.monthlyRain).to.not.be.undefined;
      expect(device.yearlyRain).to.not.be.undefined;

      expect(device.battery.service.characteristics[0].value).to.equal('Battery');
      expect(device.rainRate.service.characteristics[0].value).to.equal("Rain Rate");
      expect(device.eventRain.service.characteristics[0].value).to.equal("Rain Event Total");
      expect(device.hourlyRain.service.characteristics[0].value).to.equal("Rain Hourly Total");
      expect(device.dailyRain.service.characteristics[0].value).to.equal("Rain Daily Total");
      expect(device.weeklyRain.service.characteristics[0].value).to.equal("Rain Weekly Total");
      expect(device.monthlyRain.service.characteristics[0].value).to.equal("Rain Monthly Total");
      expect(device.yearlyRain.service.characteristics[0].value).to.equal("Rain Yearly Total");
      done();
    });

    it('Update is called successfully', (done) => {
      device.update(dataReport);

      expect(device.battery.service.characteristics[1].value).to.equal(0); // low batt
      expect(device.battery.service.characteristics[4].value).to.equal(75); // batt percentage
      expect(device.rainRate.service.characteristics[0].value).to.equal("Rain Rate 1.1 in/hour");
      expect(device.eventRain.service.characteristics[0].value).to.equal("Rain Event Total 2.2 in");
      expect(device.hourlyRain.service.characteristics[0].value).to.equal("Rain Hourly Total 3.3 in");
      expect(device.dailyRain.service.characteristics[0].value).to.equal("Rain Daily Total 4.4 in");
      expect(device.weeklyRain.service.characteristics[0].value).to.equal("Rain Weekly Total 5.5 in");
      expect(device.monthlyRain.service.characteristics[0].value).to.equal("Rain Monthly Total 6.6 in");
      expect(device.yearlyRain.service.characteristics[0].value).to.equal("Rain Yearly Total 7.7 in");
      done();
    });

    it('Services are created with name overrides', (done) => {
      platform.config.nameOverrides[0] = {"key": "WH40:rainRate", "value": "Test Rain Rate Name"};
      platform.config.nameOverrides[1] = {"key": "WH40:rainEventTotal", "value": "Test Rain Event Total Name"};
      platform.config.nameOverrides[2] = {"key": "WH40:rainHourlyTotal", "value": "Test Rain Hourly Total Name"};
      platform.config.nameOverrides[3] = {"key": "WH40:rainDailyTotal", "value": "Test Rain Daily Total Name"};
      platform.config.nameOverrides[4] = {"key": "WH40:rainWeeklyTotal", "value": "Test Rain Weekly Total Name"};
      platform.config.nameOverrides[5] = {"key": "WH40:rainMonthlyTotal", "value": "Test Rain Monthly Total Name"};
      platform.config.nameOverrides[6] = {"key": "WH40:rainYearlyTotal", "value": "Test Rain Yearly Total Name"};

      device = new WH40(platform, accessory);

      expect(device.rainRate.service.characteristics[0].value).to.equal("Test Rain Rate Name");
      expect(device.eventRain.service.characteristics[0].value).to.equal("Test Rain Event Total Name");
      expect(device.hourlyRain.service.characteristics[0].value).to.equal("Test Rain Hourly Total Name");
      expect(device.dailyRain.service.characteristics[0].value).to.equal("Test Rain Daily Total Name");
      expect(device.weeklyRain.service.characteristics[0].value).to.equal("Test Rain Weekly Total Name");
      expect(device.monthlyRain.service.characteristics[0].value).to.equal("Test Rain Monthly Total Name");
      expect(device.yearlyRain.service.characteristics[0].value).to.equal("Test Rain Yearly Total Name");
      done();
    });

    it('Services are not created when hidden with general override', (done) => {
      platform.config.hidden["rainRate"] = true;
      platform.config.hidden["rainEventTotal"] = true;
      platform.config.hidden["rainHourlyTotal"] = true;
      platform.config.hidden["rainDailyTotal"] = true;
      platform.config.hidden["rainWeeklyTotal"] = true;
      platform.config.hidden["rainMonthlyTotal"] = true;
      platform.config.hidden["rainYearlyTotal"] = true;

      device = new WH40(platform, accessory);

      expect(device.rainRate).to.be.undefined;
      expect(device.eventRain).to.be.undefined;
      expect(device.hourlyRain).to.be.undefined;
      expect(device.dailyRain).to.be.undefined;
      expect(device.weeklyRain).to.be.undefined;
      expect(device.monthlyRain).to.be.undefined;
      expect(device.yearlyRain).to.be.undefined;
      done();
    });

    it('Services are not created when hidden with device-specific override', (done) => {
      platform.config.hidden["WH40:rainRate"] = true;
      platform.config.hidden["WH40:rainEventTotal"] = true;
      platform.config.hidden["WH40:rainHourlyTotal"] = true;
      platform.config.hidden["WH40:rainDailyTotal"] = true;
      platform.config.hidden["WH40:rainWeeklyTotal"] = true;
      platform.config.hidden["WH40:rainMonthlyTotal"] = true;
      platform.config.hidden["WH40:rainYearlyTotal"] = true;

      device = new WH40(platform, accessory);

      expect(device.rainRate).to.be.undefined;
      expect(device.eventRain).to.be.undefined;
      expect(device.hourlyRain).to.be.undefined;
      expect(device.dailyRain).to.be.undefined;
      expect(device.weeklyRain).to.be.undefined;
      expect(device.monthlyRain).to.be.undefined;
      expect(device.yearlyRain).to.be.undefined;
      done();
    });
  });
});
