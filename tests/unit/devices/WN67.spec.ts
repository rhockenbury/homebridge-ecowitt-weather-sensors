import { expect } from 'chai';
import { WN67 } from './../../../src/devices/WN67';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let sensor = null;

const dataReport1 = {
  "dateutc": "2024-07-24 19:04:22",
  "tempf": "80.78",
  "humidity": "49",
  "winddir": "285",
  "windspeedmph": "0.0",
  "windgustmph": "5.62",
  "maxdailygust": "1.79",
  "rainratein": "0.03",
  "eventrainin": "0.4",
  "hourlyrainin": "0.5",
  "dailyrainin": "0.000",
  "weeklyrainin": "0.272",
  "monthlyrainin": "0.819",
  "yearlyrainin": "0.819",
  "totalrainin": "0.819",
  "wh65batt": "0",
};

const dataReport2 = {
  "dateutc": "2024-07-24 19:04:22",
  "tempf": "80.78",
  "humidity": "49",
  "winddir": "285",
  "windspeedmph": "0.0",
  "windgustmph": "5.62",
  "maxdailygust": "1.79",
  "eventrainin": "0.4",
  "hourlyrainin": "0.5",
  "dailyrainin": "0.000",
  "weeklyrainin": "0.272",
  "monthlyrainin": "0.819",
  "yearlyrainin": "0.819",
  "wh65batt": "0",
};


const configs = ["v1Default", "v1Full", "v2Default", "v2Full"];

configs.forEach(config => {
  describe(`WN67 device should be configured ${config}`, () => {
    before('Initialize device', () => {
      platform = createPlatform(config);
      accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03");
      platform.baseStationInfo.protocol = "Ecowitt";
      platform.config.nameOverrides = [];
      platform.config.hidden = {};

      device = new WN67(platform, accessory);
    });

    beforeEach('Reset config', () => {
      platform.config.nameOverrides = [];
      platform.config.hidden = {};
    });

    it('Services are created', (done) => {
      device = new WN67(platform, accessory);

      expect(device.battery).to.not.be.undefined;
      expect(device.temperature).to.not.be.undefined;
      expect(device.humidity).to.not.be.undefined;
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
      expect(device.rainTotal).to.not.be.undefined;

      expect(device.battery.service.displayName).to.equal('Battery');
      expect(device.temperature.service.characteristics[0].value).to.equal("Temperature");
      expect(device.humidity.service.characteristics[0].value).to.equal("Humidity");
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
      expect(device.rainTotal.service.characteristics[0].value).to.equal("Rain Total");
      done();
    });


    it('Update is called successfully', (done) => {
      device = new WN67(platform, accessory);
      device.update(dataReport1);

      expect(device.battery.service.characteristics[1].value).to.equal(0); // low batt
      expect(device.humidity.service.characteristics[0].value).to.equal("Humidity 49 %")
      expect(device.temperature.service.characteristics[0].value).to.equal("Temperature 80.60°F")
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
      expect(device.rainTotal.service.characteristics[0].value).to.equal("Rain Total 0.8 in");
      done();
    });

    it('Update is called successfully with no optional data', (done) => {
      device.update(dataReport2);

      expect(device.battery.service.characteristics[1].value).to.equal(0); // low batt
      expect(device.humidity.service.characteristics[0].value).to.equal("Humidity 49 %")
      expect(device.temperature.service.characteristics[0].value).to.equal("Temperature 80.60°F")
      expect(device.windDirection.service.characteristics[0].value).to.equal("Wind Direction 285° (W)");
      expect(device.windSpeed.service.characteristics[0].value).to.equal("Wind Speed 0.0 mph");
      expect(device.windGustSpeed.service.characteristics[0].value).to.equal("Wind Gust Speed 5.6 mph");
      expect(device.windMaxDailySpeed.service.characteristics[0].value).to.equal("Wind Max Daily Speed 1.8 mph");
      expect(device.rainEventTotal.service.characteristics[0].value).to.equal("Rain Event Total 0.4 in");
      expect(device.rainHourlyTotal.service.characteristics[0].value).to.equal("Rain Hourly Total 0.5 in");
      expect(device.rainDailyTotal.service.characteristics[0].value).to.equal("Rain Daily Total 0.0 in");
      expect(device.rainWeeklyTotal.service.characteristics[0].value).to.equal("Rain Weekly Total 0.3 in");
      expect(device.rainMonthlyTotal.service.characteristics[0].value).to.equal("Rain Monthly Total 0.8 in");
      expect(device.rainYearlyTotal.service.characteristics[0].value).to.equal("Rain Yearly Total 0.8 in");

      // optional
      expect(device.rainRate).to.be.undefined;
      expect(device.rainTotal).to.be.undefined;
      done();
    });

    it('Services are created with name overrides', (done) => {
      platform.config.nameOverrides[0] = {"key": "WN67:temperature", "value": "Test Temperature Name"};
      platform.config.nameOverrides[1] = {"key": "WN67:humidity", "value": "Test Humidity Name"};
      platform.config.nameOverrides[2] = {"key": "WN67:windDirection", "value": "Test Wind Direction Name"};
      platform.config.nameOverrides[3] = {"key": "WN67:windSpeed", "value": "Test Wind Speed Name"};
      platform.config.nameOverrides[4] = {"key": "WN67:windGustSpeed", "value": "Test Wind Gust Speed Name"};
      platform.config.nameOverrides[5] = {"key": "WN67:windMaxDailySpeed", "value": "Test Wind Max Daily Speed Name"};
      platform.config.nameOverrides[6] = {"key": "WN67:rainRate", "value": "Test Rain Rate Name"};
      platform.config.nameOverrides[7] = {"key": "WN67:rainEventTotal", "value": "Test Rain Event Total Name"};
      platform.config.nameOverrides[8] = {"key": "WN67:rainHourlyTotal", "value": "Test Rain Hourly Total Name"};
      platform.config.nameOverrides[9] = {"key": "WN67:rainDailyTotal", "value": "Test Rain Daily Total Name"};
      platform.config.nameOverrides[10] = {"key": "WN67:rainWeeklyTotal", "value": "Test Rain Weekly Total Name"};
      platform.config.nameOverrides[11] = {"key": "WN67:rainMonthlyTotal", "value": "Test Rain Monthly Total Name"};
      platform.config.nameOverrides[12] = {"key": "WN67:rainYearlyTotal", "value": "Test Rain Yearly Total Name"};
      platform.config.nameOverrides[13] = {"key": "WN67:rainTotal", "value": "Test Rain Total Name"};

      device = new WN67(platform, accessory);

      expect(device.temperature.service.characteristics[0].value).to.equal("Test Temperature Name");
      expect(device.humidity.service.characteristics[0].value).to.equal("Test Humidity Name");
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
      expect(device.rainTotal.service.characteristics[0].value).to.equal("Test Rain Total Name");
      done();
    });

    it('Services are not created when hidden with general override', (done) => {
      platform.config.hidden["temperature"] = true;
      platform.config.hidden["humidity"] = true;
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
      platform.config.hidden["rainTotal"] = true;

      device = new WN67(platform, accessory);

      expect(device.temperature).to.be.undefined;
      expect(device.humidity).to.be.undefined;
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
      expect(device.rainTotal).to.be.undefined;
      done();
    });

    it('Services are not created when hidden with device-specific override', (done) => {
      platform.config.hidden["WN67:temperature"] = true;
      platform.config.hidden["WN67:humidity"] = true;
      platform.config.hidden["WN67:windDirection"] = true;
      platform.config.hidden["WN67:windSpeed"] = true;
      platform.config.hidden["WN67:windGustSpeed"] = true;
      platform.config.hidden["WN67:windMaxDailySpeed"] = true;
      platform.config.hidden["WN67:rainRate"] = true;
      platform.config.hidden["WN67:rainEventTotal"] = true;
      platform.config.hidden["WN67:rainHourlyTotal"] = true;
      platform.config.hidden["WN67:rainDailyTotal"] = true;
      platform.config.hidden["WN67:rainWeeklyTotal"] = true;
      platform.config.hidden["WN67:rainMonthlyTotal"] = true;
      platform.config.hidden["WN67:rainYearlyTotal"] = true;
      platform.config.hidden["WN67:rainTotal"] = true;

      device = new WN67(platform, accessory);

      expect(device.temperature).to.be.undefined;
      expect(device.humidity).to.be.undefined;
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
      expect(device.rainTotal).to.be.undefined;
      done();
    });
  });
});
