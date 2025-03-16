import { expect } from 'chai';
import { WS85 } from './../../../src/devices/WS85';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let sensor = null;

const dataReport = {
  "dateutc": "2024-07-24 19:04:22",
  "winddir": "285",
  "windspeedmph": "0.0",
  "windgustmph": "5.62",
  "maxdailygust": "1.79",
  "rrain_piezo": "0.03",
  "erain_piezo": "0.4",
  "hrain_piezo": "0.5",
  "drain_piezo": "0.000",
  "wrain_piezo": "0.272",
  "mrain_piezo": "0.819",
  "yrain_piezo": "0.819",
  "ws85cap_volt": "5.5",
  "ws85_ver": "107",
  "wh85batt": "3.28",
};

const configs = ["v1Default", "v1Full", "v2Default", "v2Full"];

configs.forEach(config => {
  describe(`WS85 device should be configured ${config}`, () => {
    before('Initialize device', () => {
      platform = createPlatform(config);
      accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03");
      platform.baseStationInfo.protocol = "Ecowitt";
      platform.config.nameOverrides = [];
      platform.config.hidden = {};

      device = new WS85(platform, accessory);
    });

    beforeEach('Reset config', () => {
      platform.config.nameOverrides = [];
      platform.config.hidden = {};
    });

    it('Services are created', (done) => {
      device = new WS85(platform, accessory);

      expect(device.battery).to.not.be.undefined;
      expect(device.windDirection).to.not.be.undefined;
      expect(device.windSpeed).to.not.be.undefined;
      expect(device.windGustSpeed).to.not.be.undefined;
      expect(device.windMaxDailySpeed).to.not.be.undefined;
      expect(device.rainRate).to.not.be.undefined;
      expect(device.rainEventTotal).to.not.be.undefined;
      expect(device.rainHourlyTotal).to.not.be.undefined;
      expect(device.rainDailyTotal).to.not.be.undefined;
      expect(device.rainWeeklyTotal).to.not.be.undefined;
      expect(device.rainMonthlyTotal).to.not.be.undefined;
      expect(device.rainYearlyTotal).to.not.be.undefined;

      expect(device.battery.service.displayName).to.equal('Battery');
      expect(device.windDirection.service.characteristics[0].value).to.equal("Wind Direction");
      expect(device.windSpeed.service.characteristics[0].value).to.equal("Wind Speed");
      expect(device.windGustSpeed.service.characteristics[0].value).to.equal("Wind Gust Speed");
      expect(device.windMaxDailySpeed.service.characteristics[0].value).to.equal("Wind Max Daily Speed");
      expect(device.rainRate.service.characteristics[0].value).to.equal("Rain Rate");
      expect(device.rainEventTotal.service.characteristics[0].value).to.equal("Rain Event Total");
      expect(device.rainHourlyTotal.service.characteristics[0].value).to.equal("Rain Hourly Total");
      expect(device.rainDailyTotal.service.characteristics[0].value).to.equal("Rain Daily Total");
      expect(device.rainWeeklyTotal.service.characteristics[0].value).to.equal("Rain Weekly Total");
      expect(device.rainMonthlyTotal.service.characteristics[0].value).to.equal("Rain Monthly Total");
      expect(device.rainYearlyTotal.service.characteristics[0].value).to.equal("Rain Yearly Total");
      done();
    });

    it('Update is called successfully', (done) => {
      device = new WS85(platform, accessory);
      device.update(dataReport);

      expect(device.battery.service.characteristics[1].value).to.equal(0); // low batt
      expect(device.battery.service.characteristics[4].value).to.equal(99); // batt percentage
      expect(device.windDirection.service.characteristics[0].value).to.equal("Wind Direction 285° (W)");
      expect(device.windSpeed.service.characteristics[0].value).to.equal("Wind Speed 0.0 mph");
      expect(device.windGustSpeed.service.characteristics[0].value).to.equal("Wind Gust Speed 5.6 mph");
      expect(device.windMaxDailySpeed.service.characteristics[0].value).to.equal("Wind Max Daily Speed 1.8 mph");
      expect(device.rainRate.service.characteristics[0].value).to.equal("Rain Rate 0.0 in/hour");
      expect(device.rainEventTotal.service.characteristics[0].value).to.equal("Rain Event Total 0.4 in");
      expect(device.rainHourlyTotal.service.characteristics[0].value).to.equal("Rain Hourly Total 0.5 in");
      expect(device.rainDailyTotal.service.characteristics[0].value).to.equal("Rain Daily Total 0.0 in");
      expect(device.rainWeeklyTotal.service.characteristics[0].value).to.equal("Rain Weekly Total 0.3 in");
      expect(device.rainMonthlyTotal.service.characteristics[0].value).to.equal("Rain Monthly Total 0.8 in");
      expect(device.rainYearlyTotal.service.characteristics[0].value).to.equal("Rain Yearly Total 0.8 in");
      done();
    });

    it('Services are created with name overrides', (done) => {
      platform.config.nameOverrides[0] = {"key": "WS85:windDirection", "value": "Test Wind Direction Name"};
      platform.config.nameOverrides[1] = {"key": "WS85:windSpeed", "value": "Test Wind Speed Name"};
      platform.config.nameOverrides[2] = {"key": "WS85:windGustSpeed", "value": "Test Wind Gust Speed Name"};
      platform.config.nameOverrides[3] = {"key": "WS85:windMaxDailySpeed", "value": "Test Wind Max Daily Speed Name"};
      platform.config.nameOverrides[4] = {"key": "WS85:rainRate", "value": "Test Rain Rate Name"};
      platform.config.nameOverrides[5] = {"key": "WS85:rainEventTotal", "value": "Test Rain Event Total Name"};
      platform.config.nameOverrides[6] = {"key": "WS85:rainHourlyTotal", "value": "Test Rain Hourly Total Name"};
      platform.config.nameOverrides[7] = {"key": "WS85:rainDailyTotal", "value": "Test Rain Daily Total Name"};
      platform.config.nameOverrides[8] = {"key": "WS85:rainWeeklyTotal", "value": "Test Rain Weekly Total Name"};
      platform.config.nameOverrides[9] = {"key": "WS85:rainMonthlyTotal", "value": "Test Rain Monthly Total Name"};
      platform.config.nameOverrides[10] = {"key": "WS85:rainYearlyTotal", "value": "Test Rain Yearly Total Name"};

      device = new WS85(platform, accessory);

      expect(device.windDirection.service.characteristics[0].value).to.equal("Test Wind Direction Name");
      expect(device.windSpeed.service.characteristics[0].value).to.equal("Test Wind Speed Name");
      expect(device.windGustSpeed.service.characteristics[0].value).to.equal("Test Wind Gust Speed Name");
      expect(device.windMaxDailySpeed.service.characteristics[0].value).to.equal("Test Wind Max Daily Speed Name");
      expect(device.rainRate.service.characteristics[0].value).to.equal("Test Rain Rate Name");
      expect(device.rainEventTotal.service.characteristics[0].value).to.equal("Test Rain Event Total Name");
      expect(device.rainHourlyTotal.service.characteristics[0].value).to.equal("Test Rain Hourly Total Name");
      expect(device.rainDailyTotal.service.characteristics[0].value).to.equal("Test Rain Daily Total Name");
      expect(device.rainWeeklyTotal.service.characteristics[0].value).to.equal("Test Rain Weekly Total Name");
      expect(device.rainMonthlyTotal.service.characteristics[0].value).to.equal("Test Rain Monthly Total Name");
      expect(device.rainYearlyTotal.service.characteristics[0].value).to.equal("Test Rain Yearly Total Name");
      done();
    });

    it('Services are not created when hidden with general override', (done) => {
      platform.config.hidden["windDirection"] = true;
      platform.config.hidden["windSpeed"] = true;
      platform.config.hidden["windGustSpeed"] = true;
      platform.config.hidden["windMaxDailySpeed"] = true;
      platform.config.hidden["rainRate"] = true;
      platform.config.hidden["rainEventTotal"] = true;
      platform.config.hidden["rainHourlyTotal"] = true;
      platform.config.hidden["rainDailyTotal"] = true;
      platform.config.hidden["rainWeeklyTotal"] = true;
      platform.config.hidden["rainMonthlyTotal"] = true;
      platform.config.hidden["rainYearlyTotal"] = true;

      device = new WS85(platform, accessory);

      expect(device.windDirection).to.be.undefined;
      expect(device.windSpeed).to.be.undefined;
      expect(device.windGustSpeed).to.be.undefined;
      expect(device.windMaxDailySpeed).to.be.undefined;
      expect(device.rainRate).to.be.undefined;
      expect(device.rainEventTotal).to.be.undefined;
      expect(device.rainHourlyTotal).to.be.undefined;
      expect(device.rainDailyTotal).to.be.undefined;
      expect(device.rainWeeklyTotal).to.be.undefined;
      expect(device.rainMonthlyTotal).to.be.undefined;
      expect(device.rainYearlyTotal).to.be.undefined;
      done();
    });

    it('Services are not created when hidden with device-specific override', (done) => {
      platform.config.hidden["WS85:windDirection"] = true;
      platform.config.hidden["WS85:windSpeed"] = true;
      platform.config.hidden["WS85:windGustSpeed"] = true;
      platform.config.hidden["WS85:windMaxDailySpeed"] = true;
      platform.config.hidden["WS85:rainRate"] = true;
      platform.config.hidden["WS85:rainEventTotal"] = true;
      platform.config.hidden["WS85:rainHourlyTotal"] = true;
      platform.config.hidden["WS85:rainDailyTotal"] = true;
      platform.config.hidden["WS85:rainWeeklyTotal"] = true;
      platform.config.hidden["WS85:rainMonthlyTotal"] = true;
      platform.config.hidden["WS85:rainYearlyTotal"] = true;

      device = new WS85(platform, accessory);

      expect(device.windDirection).to.be.undefined;
      expect(device.windSpeed).to.be.undefined;
      expect(device.windGustSpeed).to.be.undefined;
      expect(device.windMaxDailySpeed).to.be.undefined;
      expect(device.rainRate).to.be.undefined;
      expect(device.rainEventTotal).to.be.undefined;
      expect(device.rainHourlyTotal).to.be.undefined;
      expect(device.rainDailyTotal).to.be.undefined;
      expect(device.rainWeeklyTotal).to.be.undefined;
      expect(device.rainMonthlyTotal).to.be.undefined;
      expect(device.rainYearlyTotal).to.be.undefined;
      done();
    });
  });
});
