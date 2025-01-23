import { expect } from 'chai';
import { WS80 } from './../../../src/devices/WS80';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let sensor = null;

const dataReport = {
  "dateutc": "2024-07-24 19:04:22",
  "tempf": "80.78",
  "humidity": "49",
  "winddir": "285",
  "windspeedmph": "0.0",
  "windgustmph": "5.62",
  "maxdailygust": "1.79",
  "solarradiation": "291.16",
  "uv": "1",
  "wh80batt": "3.00",
};

const configs = ["v1Default", "v1Full", "v2Default", "v2Full"];

configs.forEach(config => {
  describe(`WS80 device should be configured ${config}`, () => {
    before('Initialize device', () => {
      platform = createPlatform(config);
      accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03")
      device = new WS80(platform, accessory);
    });

    beforeEach('Reset config', () => {
      platform.config.nameOverrides = [];
      platform.config.hidden = {};
    });

    it('Services are created', (done) => {
      device = new WS80(platform, accessory);

      expect(device.battery).to.not.be.undefined;
      expect(device.temperature).to.not.be.undefined;
      expect(device.humidity).to.not.be.undefined;
      expect(device.solarRadiation).to.not.be.undefined;
      expect(device.uvIndex).to.not.be.undefined;
      expect(device.windDirection).to.not.be.undefined;
      expect(device.windSpeed).to.not.be.undefined;
      expect(device.windGust).to.not.be.undefined;
      expect(device.maxDailyGust).to.not.be.undefined;

      expect(device.battery.displayName).to.equal('');
      expect(device.temperature.service.characteristics[0].value).to.equal("Temperature");
      expect(device.humidity.service.characteristics[0].value).to.equal("Humidity");
      expect(device.solarRadiation.service.characteristics[0].value).to.equal("Solar Radiation");
      expect(device.uvIndex.service.characteristics[0].value).to.equal("UV Index");
      expect(device.windDirection.service.characteristics[0].value).to.equal("Wind Direction");
      expect(device.windSpeed.service.characteristics[0].value).to.equal("Wind Speed");
      expect(device.windGust.service.characteristics[0].value).to.equal("Wind Gust Speed");
      expect(device.maxDailyGust.service.characteristics[0].value).to.equal("Wind Max Daily Speed");
      done();
    });


    it('Update is called successfully', (done) => {
      device = new WS80(platform, accessory);
      device.update(dataReport);

      expect(device.battery.characteristics[0].value).to.equal(0); // low batt
      expect(device.humidity.service.characteristics[0].value).to.equal("Humidity 49 %")
      expect(device.temperature.service.characteristics[0].value).to.equal("Temperature 80.60°F")
      expect(device.solarRadiation.service.characteristics[0].value).to.equal("Solar Radiation 36890lx");
      expect(device.uvIndex.service.characteristics[0].value).to.equal("UV Index 1");
      expect(device.windDirection.service.characteristics[0].value).to.equal("Wind Direction 285° (W)");
      expect(device.windSpeed.service.characteristics[0].value).to.equal("Wind Speed 0.0 mph");
      expect(device.windGust.service.characteristics[0].value).to.equal("Wind Gust Speed 5.6 mph");
      expect(device.maxDailyGust.service.characteristics[0].value).to.equal("Wind Max Daily Speed 1.8 mph");
      done();
    });

    it('Services are created with name overrides', (done) => {
      platform.config.nameOverrides[0] = {"key": "WS80:temperature", "value": "Test Temperature Name"};
      platform.config.nameOverrides[1] = {"key": "WS80:humidity", "value": "Test Humidity Name"};
      platform.config.nameOverrides[2] = {"key": "WS80:solarRadiation", "value": "Test Solar Radiation Name"};
      platform.config.nameOverrides[3] = {"key": "WS80:uvIndex", "value": "Test UV Index Name"};
      platform.config.nameOverrides[4] = {"key": "WS80:windDirection", "value": "Test Wind Direction Name"};
      platform.config.nameOverrides[5] = {"key": "WS80:windSpeed", "value": "Test Wind Speed Name"};
      platform.config.nameOverrides[6] = {"key": "WS80:windGustSpeed", "value": "Test Wind Gust Speed Name"};
      platform.config.nameOverrides[7] = {"key": "WS80:windMaxDailySpeed", "value": "Test Wind Max Daily Speed Name"};

      device = new WS80(platform, accessory);

      expect(device.temperature.service.characteristics[0].value).to.equal("Test Temperature Name");
      expect(device.humidity.service.characteristics[0].value).to.equal("Test Humidity Name");
      expect(device.solarRadiation.service.characteristics[0].value).to.equal("Test Solar Radiation Name");
      expect(device.uvIndex.service.characteristics[0].value).to.equal("Test UV Index Name");
      expect(device.windDirection.service.characteristics[0].value).to.equal("Test Wind Direction Name");
      expect(device.windSpeed.service.characteristics[0].value).to.equal("Test Wind Speed Name");
      expect(device.windGust.service.characteristics[0].value).to.equal("Test Wind Gust Speed Name");
      expect(device.maxDailyGust.service.characteristics[0].value).to.equal("Test Wind Max Daily Speed Name");
      done();
    });

    it('Services are not created when hidden with general override', (done) => {
      platform.config.hidden["temperature"] = true;
      platform.config.hidden["humidity"] = true;
      platform.config.hidden["solarRadiation"] = true;
      platform.config.hidden["uvIndex"] = true;
      platform.config.hidden["windDirection"] = true;
      platform.config.hidden["windSpeed"] = true;
      platform.config.hidden["windGustSpeed"] = true;
      platform.config.hidden["windMaxDailySpeed"] = true;

      device = new WS80(platform, accessory);

      expect(device.temperature).to.be.undefined;
      expect(device.humidity).to.be.undefined;
      expect(device.solarRadiation).to.be.undefined;
      expect(device.uvIndex).to.be.undefined;
      expect(device.windDirection).to.be.undefined;
      expect(device.windSpeed).to.be.undefined;
      expect(device.windGust).to.be.undefined;
      expect(device.maxDailyGust).to.be.undefined;
      done();
    });

    it('Services are not created when hidden with device-specific override', (done) => {
      platform.config.hidden["WS80:temperature"] = true;
      platform.config.hidden["WS80:humidity"] = true;
      platform.config.hidden["WS80:solarRadiation"] = true;
      platform.config.hidden["WS80:uvIndex"] = true;
      platform.config.hidden["WS80:windDirection"] = true;
      platform.config.hidden["WS80:windSpeed"] = true;
      platform.config.hidden["WS80:windGustSpeed"] = true;
      platform.config.hidden["WS80:windMaxDailySpeed"] = true;

      device = new WS80(platform, accessory);

      expect(device.temperature).to.be.undefined;
      expect(device.humidity).to.be.undefined;
      expect(device.solarRadiation).to.be.undefined;
      expect(device.uvIndex).to.be.undefined;
      expect(device.windDirection).to.be.undefined;
      expect(device.windSpeed).to.be.undefined;
      expect(device.windGust).to.be.undefined;
      expect(device.maxDailyGust).to.be.undefined;
      done();
    });
  });
});
