import { expect } from 'chai';
import { WH40 } from './../../../src/devices/WH40';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let sensor = null;

const dataReport1 = {
  "dateutc": "2024-07-24 19:04:22",
  "rainratein": "1.100",
  "eventrainin": "2.200",
  "hourlyrainin": "3.300",
  "dailyrainin": "4.400",
  "weeklyrainin": "5.500",
  "monthlyrainin": "6.600",
  "yearlyrainin": "7.700",
  "totalrainin": "8.800",
  "wh40batt": "1.2"
};

const dataReport2 = {
  "dateutc": "2024-07-24 19:04:22",
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

    // ['rainRate', 'rainEventTotal', 'rainHourlyTotal',
    //   'rainDailyTotal', 'rainWeeklyTotal', 'rainMonthlyTotal', 'rainYearlyTotal', 'rainTotal'];
    //
    it('Services are created', (done) => {
      expect(device.battery).to.not.be.undefined;
      expect(device.rainRate).to.not.be.undefined;
      expect(device.rainEventTotal).to.not.be.undefined;
      expect(device.rainHourlyTotal).to.not.be.undefined;
      expect(device.rainDailyTotal).to.not.be.undefined;
      expect(device.rainWeeklyTotal).to.not.be.undefined;
      expect(device.rainMonthlyTotal).to.not.be.undefined;
      expect(device.rainYearlyTotal).to.not.be.undefined;
      expect(device.rainTotal).to.not.be.undefined;

      expect(device.battery.service.characteristics[0].value).to.equal('Battery');
      expect(device.rainRate.service.characteristics[0].value).to.equal("Rain Rate");
      expect(device.rainEventTotal.service.characteristics[0].value).to.equal("Rain Event Total");
      expect(device.rainHourlyTotal.service.characteristics[0].value).to.equal("Rain Hourly Total");
      expect(device.rainDailyTotal.service.characteristics[0].value).to.equal("Rain Daily Total");
      expect(device.rainWeeklyTotal.service.characteristics[0].value).to.equal("Rain Weekly Total");
      expect(device.rainMonthlyTotal.service.characteristics[0].value).to.equal("Rain Monthly Total");
      expect(device.rainYearlyTotal.service.characteristics[0].value).to.equal("Rain Yearly Total");
      expect(device.rainTotal.service.characteristics[0].value).to.equal("Rain Total");
      done();
    });

    it('Update is called successfully', (done) => {
      device.update(dataReport1);

      expect(device.battery.service.characteristics[1].value).to.equal(0); // low batt
      expect(device.battery.service.characteristics[4].value).to.equal(75); // batt percentage
      expect(device.rainRate.service.characteristics[0].value).to.equal("Rain Rate 1.1 in/hour");
      expect(device.rainEventTotal.service.characteristics[0].value).to.equal("Rain Event Total 2.2 in");
      expect(device.rainHourlyTotal.service.characteristics[0].value).to.equal("Rain Hourly Total 3.3 in");
      expect(device.rainDailyTotal.service.characteristics[0].value).to.equal("Rain Daily Total 4.4 in");
      expect(device.rainWeeklyTotal.service.characteristics[0].value).to.equal("Rain Weekly Total 5.5 in");
      expect(device.rainMonthlyTotal.service.characteristics[0].value).to.equal("Rain Monthly Total 6.6 in");
      expect(device.rainYearlyTotal.service.characteristics[0].value).to.equal("Rain Yearly Total 7.7 in");
      expect(device.rainTotal.service.characteristics[0].value).to.equal("Rain Total 8.8 in");
      done();
    });

    it('Update is called successfully with no optional data', (done) => {
      device.update(dataReport2);

      expect(device.battery.service.characteristics[1].value).to.equal(0); // low batt
      expect(device.battery.service.characteristics[4].value).to.equal(75); // batt percentage
      expect(device.rainEventTotal.service.characteristics[0].value).to.equal("Rain Event Total 2.2 in");
      expect(device.rainHourlyTotal.service.characteristics[0].value).to.equal("Rain Hourly Total 3.3 in");
      expect(device.rainDailyTotal.service.characteristics[0].value).to.equal("Rain Daily Total 4.4 in");
      expect(device.rainWeeklyTotal.service.characteristics[0].value).to.equal("Rain Weekly Total 5.5 in");
      expect(device.rainMonthlyTotal.service.characteristics[0].value).to.equal("Rain Monthly Total 6.6 in");
      expect(device.rainYearlyTotal.service.characteristics[0].value).to.equal("Rain Yearly Total 7.7 in");

      // optional
      expect(device.rainRate).to.be.undefined;
      expect(device.rainTotal).to.be.undefined;
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
      platform.config.nameOverrides[7] = {"key": "WH40:rainTotal", "value": "Test Rain Total Name"};

      device = new WH40(platform, accessory);

      expect(device.rainRate.service.characteristics[0].value).to.equal("Test Rain Rate Name");
      expect(device.rainEventTotal.service.characteristics[0].value).to.equal("Test Rain Event Total Name");
      expect(device.rainHourlyTotal.service.characteristics[0].value).to.equal("Test Rain Hourly Total Name");
      expect(device.rainDailyTotal.service.characteristics[0].value).to.equal("Test Rain Daily Total Name");
      expect(device.rainWeeklyTotal.service.characteristics[0].value).to.equal("Test Rain Weekly Total Name");
      expect(device.rainMonthlyTotal.service.characteristics[0].value).to.equal("Test Rain Monthly Total Name");
      expect(device.rainYearlyTotal.service.characteristics[0].value).to.equal("Test Rain Yearly Total Name");
      expect(device.rainTotal.service.characteristics[0].value).to.equal("Test Rain Total Name");
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
      platform.config.hidden["rainTotal"] = true;

      device = new WH40(platform, accessory);

      expect(device.rainRate).to.be.undefined;
      expect(device.rainEventTotal).to.be.undefined;
      expect(device.rainHourlyTotal).to.be.undefined;
      expect(device.rainDailyTotal).to.be.undefined;
      expect(device.rainWeeklyTotal).to.be.undefined;
      expect(device.rainMonthlyTotal).to.be.undefined;
      expect(device.rainYearlyTotal).to.be.undefined;
      expect(device.rainTotal).to.be.undefined;
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
      platform.config.hidden["WH40:rainTotal"] = true;

      device = new WH40(platform, accessory);

      expect(device.rainRate).to.be.undefined;
      expect(device.rainEventTotal).to.be.undefined;
      expect(device.rainHourlyTotal).to.be.undefined;
      expect(device.rainDailyTotal).to.be.undefined;
      expect(device.rainWeeklyTotal).to.be.undefined;
      expect(device.rainMonthlyTotal).to.be.undefined;
      expect(device.rainYearlyTotal).to.be.undefined;
      expect(device.rainTotal).to.be.undefined;
      done();
    });
  });
});
