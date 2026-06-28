import { expect } from 'chai';
import { WH52 } from './../../../src/devices/WH52';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let sensor = null;

const dataReport = {
  "dateutc": "2026-06-26 20:59:50",
  "soil_ec_hum1": "42",
  "soil_ec_temp1": "82.40",
  "soil_ec_batt1": "1.4"
};

const configs = ["v1Default", "v1Full", "v2Default", "v2Full"];

configs.forEach(config => {
  describe(`WH52 device should be configured ${config}`, () => {
    before('Initialize device', () => {
      platform = createPlatform(config);
      accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03");
      platform.baseStationInfo.protocol = "Ecowitt";
      platform.config.nameOverrides = [];
      platform.config.hidden = {};

      device = new WH52(platform, accessory, 1);
    });

    beforeEach('Reset config', () => {
      platform.config.nameOverrides = [];
      platform.config.hidden = {};
    });

    it('Services are created', (done) => {
      expect(device.battery).to.not.be.undefined;
      expect(device.soilMoisture).to.not.be.undefined;
      expect(device.soilTemperature).to.not.be.undefined;
      expect(device.battery.service.displayName).to.equal('Battery');
      expect(device.soilMoisture.service.displayName).to.equal("Soil Moisture");
      expect(device.soilTemperature.service.displayName).to.equal("Soil Temperature");
      done();
    });

    it('Update is called successfully', (done) => {
      device.update(dataReport);

      expect(device.battery.service.characteristics[1].value).to.equal(0); // low batt
      expect(device.battery.service.characteristics[4].value).to.equal(87); // batt percentage
      expect(device.soilMoisture.service.characteristics[0].value).to.equal("Soil Moisture 42 %");
      expect(device.soilTemperature.service.characteristics[0].value).to.equal("Soil Temperature 82.40°F");
      done();
    });

    it('Services are created with name overrides', (done) => {
      platform.config.nameOverrides[0] = {"key": "WH52CH1:soilmoisture", "value": "Test Soil Moisture Name"};
      platform.config.nameOverrides[1] = {"key": "WH52CH1:soiltemperature", "value": "Test Soil Temperature Name"};

      device = new WH52(platform, accessory, 1);

      expect(device.soilMoisture).to.not.be.undefined;
      expect(device.soilTemperature).to.not.be.undefined;
      expect(device.soilMoisture.service.characteristics[0].value).to.equal("Test Soil Moisture Name");
      expect(device.soilTemperature.service.characteristics[0].value).to.equal("Test Soil Temperature Name");
      done();
    });

    it('Services are not created when hidden with general override', (done) => {
      platform.config.hidden["soilmoisture"] = true;
      platform.config.hidden["soiltemperature"] = true;

      device = new WH52(platform, accessory, 1);

      expect(device.soilMoisture).to.be.undefined;
      expect(device.soilTemperature).to.be.undefined;
      done();
    });

    it('Services are not created when hidden with device-specific override', (done) => {
      platform.config.hidden["WH52CH1:soilmoisture"] = true;
      platform.config.hidden["WH52CH1:soiltemperature"] = true;

      device = new WH52(platform, accessory, 1);

      expect(device.soilMoisture).to.be.undefined;
      expect(device.soilTemperature).to.be.undefined;
      done();
    });
  });
});
