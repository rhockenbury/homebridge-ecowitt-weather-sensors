import { expect } from 'chai';
import { WH46 } from './../../../src/devices/WH46';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let sensor = null;

const dataReport = {
  "dateutc": "2024-07-24 19:04:22",
  "tf_co2": "70.52",
  "humi_co2": "65",
  "pm1_co2": "10.8",
  "pm1_24h_co2": "15.8",
  "pm4_co2": "11.6",
  "pm4_24h_co2": "17.1",
  "pm25_co2": "1.7",
  "pm25_24h_co2": "2.0",
  "pm10_co2": "1.7",
  "pm10_24h_co2": "2.4",
  "co2": "596",
  "co2_24h": "603",
  "co2_batt": "6",
};

const configs = ["v1Default", "v1Full", "v2Default", "v2Full"];

configs.forEach(config => {
  describe(`WH46 device should be configured ${config}`, () => {
    before('Initialize device', () => {
      platform = createPlatform(config);
      accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03")
    });

    beforeEach('Reset config', () => {
      platform.baseStationInfo.protocol = "Ecowitt";
      platform.config.nameOverrides = [];
      platform.config.hidden = {};
    });

    it('Services are created', (done) => {
      device = new WH46(platform, accessory);

      expect(device.battery).to.not.be.undefined;
      expect(device.temperature).to.not.be.undefined;
      expect(device.humidity).to.not.be.undefined;
      expect(device.airQualityPM25).to.not.be.undefined;
      expect(device.airQualityPM25Avg).to.not.be.undefined;
      expect(device.airQualityPM10).to.not.be.undefined;
      expect(device.airQualityPM10Avg).to.not.be.undefined;
      expect(device.carbonDioxide).to.not.be.undefined;
      expect(device.carbonDioxideAvg).to.not.be.undefined;

      expect(device.battery.service.displayName).to.equal('Battery');
      expect(device.temperature.service.displayName).to.equal("Temperature");
      expect(device.humidity.service.displayName).to.equal("Humidity");
      expect(device.airQualityPM25.service.displayName).to.equal("PM2.5 Air Quality");
      expect(device.airQualityPM25Avg.service.displayName).to.equal("PM2.5 Air Quality 24h Avg");
      expect(device.airQualityPM10.service.displayName).to.equal("PM10 Air Quality");
      expect(device.airQualityPM10Avg.service.displayName).to.equal("PM10 Air Quality 24h Avg");
      expect(device.carbonDioxide.service.displayName).to.equal("CO₂ Level");
      expect(device.carbonDioxideAvg.service.displayName).to.equal("CO₂ Level 24h Avg");
      done();
    });

    it('Update is called successfully', (done) => {
      device = new WH46(platform, accessory);
      device.update(dataReport);

      expect(device.battery.service.characteristics[1].value).to.equal(0); // low batt
      expect(device.battery.service.characteristics[4].value).to.equal(100); // batt percentage
      expect(device.temperature.service.characteristics[0].value).to.equal("Temperature 70.70°F");
      expect(device.humidity.service.characteristics[0].value).to.equal("Humidity 65 %");
      expect(device.airQualityPM25.service.characteristics[0].value).to.equal("PM2.5 Air Quality 2 mcg/m³");
      expect(device.airQualityPM25Avg.service.characteristics[0].value).to.equal("PM2.5 Air Quality 24h Avg 2 mcg/m³");
      expect(device.airQualityPM10.service.characteristics[0].value).to.equal("PM10 Air Quality 2 mcg/m³");
      expect(device.airQualityPM10Avg.service.characteristics[0].value).to.equal("PM10 Air Quality 24h Avg 2 mcg/m³");
      expect(device.carbonDioxide.service.characteristics[0].value).to.equal("CO₂ Level 596ppm");
      expect(device.carbonDioxideAvg.service.characteristics[0].value).to.equal("CO₂ Level 24h Avg 603ppm");
      done();
    });

    it('Services are created with name overrides', (done) => {
      platform.config.nameOverrides[0] = {"key": "WH46:temperature", "value": "Test Temperature Name"};
      platform.config.nameOverrides[1] = {"key": "WH46:humidity", "value": "Test Humidity Name"};
      platform.config.nameOverrides[2] = {"key": "WH46:airQualityPM25", "value": "Test PM2.5 Air Quality Name"};
      platform.config.nameOverrides[3] = {"key": "WH46:airQualityPM25Avg", "value": "Test PM2.5 Air Quality 24h Avg Name"};
      platform.config.nameOverrides[4] = {"key": "WH46:airQualityPM10", "value": "Test PM10 Air Quality Name"};
      platform.config.nameOverrides[5] = {"key": "WH46:airQualityPM10Avg", "value": "Test PM10 Air Quality 24h Avg Name"};
      platform.config.nameOverrides[6] = {"key": "WH46:carbonDioxide", "value": "Test CO₂ Level Name"};
      platform.config.nameOverrides[7] = {"key": "WH46:carbonDioxideAvg", "value": "Test CO₂ Level 24h Avg Name"};

      device = new WH46(platform, accessory);

      expect(device.temperature.service.characteristics[0].value).to.equal("Test Temperature Name");
      expect(device.humidity.service.characteristics[0].value).to.equal("Test Humidity Name");
      expect(device.airQualityPM25.service.characteristics[0].value).to.equal("Test PM2.5 Air Quality Name");
      expect(device.airQualityPM25Avg.service.characteristics[0].value).to.equal("Test PM2.5 Air Quality 24h Avg Name");
      expect(device.airQualityPM10.service.characteristics[0].value).to.equal("Test PM10 Air Quality Name");
      expect(device.airQualityPM10Avg.service.characteristics[0].value).to.equal("Test PM10 Air Quality 24h Avg Name");
      expect(device.carbonDioxide.service.characteristics[0].value).to.equal("Test CO₂ Level Name");
      expect(device.carbonDioxideAvg.service.characteristics[0].value).to.equal("Test CO₂ Level 24h Avg Name");
      done();
    });

    it('Services are not created when hidden with general override', (done) => {
      platform.config.hidden["temperature"] = true;
      platform.config.hidden["humidity"] = true;
      platform.config.hidden["airQualityPM25"] = true;
      platform.config.hidden["airQualityPM25Avg"] = true;
      platform.config.hidden["airQualityPM10"] = true;
      platform.config.hidden["airQualityPM10Avg"] = true;
      platform.config.hidden["carbonDioxide"] = true;
      platform.config.hidden["carbonDioxideAvg"] = true;

      device = new WH46(platform, accessory);

      expect(device.temperature).to.be.undefined
      expect(device.humidity).to.be.undefined
      expect(device.airQualityPM25).to.be.undefined
      expect(device.airQualityPM25Avg).to.be.undefined
      expect(device.airQualityPM10).to.be.undefined
      expect(device.airQualityPM10Avg).to.be.undefined
      expect(device.carbonDioxide).to.be.undefined
      expect(device.carbonDioxideAvg).to.be.undefined
      done();
    });

    it('Services are not created when hidden with device-specific override', (done) => {
      platform.config.hidden["WH46:temperature"] = true;
      platform.config.hidden["WH46:humidity"] = true;
      platform.config.hidden["WH46:airQualityPM25"] = true;
      platform.config.hidden["WH46:airQualityPM25Avg"] = true;
      platform.config.hidden["WH46:airQualityPM10"] = true;
      platform.config.hidden["WH46:airQualityPM10Avg"] = true;
      platform.config.hidden["WH46:carbonDioxide"] = true;
      platform.config.hidden["WH46:carbonDioxideAvg"] = true;

      device = new WH46(platform, accessory);

      expect(device.temperature).to.be.undefined
      expect(device.humidity).to.be.undefined
      expect(device.airQualityPM25).to.be.undefined
      expect(device.airQualityPM25Avg).to.be.undefined
      expect(device.airQualityPM10).to.be.undefined
      expect(device.airQualityPM10Avg).to.be.undefined
      expect(device.carbonDioxide).to.be.undefined
      expect(device.carbonDioxideAvg).to.be.undefined
      done();
    });
  });
});
