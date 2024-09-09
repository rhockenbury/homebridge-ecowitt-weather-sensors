import { expect } from 'chai';
import { GW1000 } from './../../../src/devices/GW1000';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let device = null;

const dataReport = {
  "dateutc": "2024-07-24 19:04:22",
  "tempinf": "80.78",
  "humidityin": "49"
};

const configs = ["v1Default", "v1Full", "v2Default", "v2Full"];

configs.forEach(config => {
  describe(`GW1000 device should be configured ${config}`, () => {
    before('Initialize platform', () => {
      platform = createPlatform(config);
      accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03")
      device = new GW1000(platform, accessory, "GW1000");
    });

    beforeEach('Reset config', () => {
      platform.config.nameOverrides = [];
      platform.config.hidden = {};
    });

    it('Services are created', (done) => {
      expect(device.temperature).to.not.be.undefined;
      expect(device.humidity).to.not.be.undefined;
      expect(device.temperature.service.displayName).to.equal("Temperature");
      expect(device.humidity.service.displayName).to.equal("Humidity");
      done();
    });

    it('Update is called successfully', (done) => {
      device.update(dataReport);

      expect(device.humidity.service.characteristics[0].value).to.equal("Humidity 49%")
      expect(device.temperature.service.characteristics[0].value).to.equal("Temperature 80.8°F")
      done();
    });

    it('Services are created with name overrides', (done) => {
      platform.config.nameOverrides[0] = {"key": "GW1000:indoorTemperature", "value": "Test Temperature Name"};
      platform.config.nameOverrides[1] = {"key": "GW1000:indoorHumidity", "value": "Test Humidity Name"};

      device = new GW1000(platform, accessory, "GW1000");

      expect(device.temperature).to.not.be.undefined;
      expect(device.humidity).to.not.be.undefined;
      expect(device.temperature.service.characteristics[0].value).to.equal("Test Temperature Name");
      expect(device.humidity.service.characteristics[0].value).to.equal("Test Humidity Name");
      done();
    });

    it('Services are not created when hidden with general override', (done) => {
      platform.config.hidden["indoorTemperature"] = true;
      platform.config.hidden["indoorHumidity"] = true;

      device = new GW1000(platform, accessory, "GW1000");

      expect(device.temperature).to.be.undefined;
      expect(device.humidity).to.be.undefined;
      done();
    });

    it('Services are not created when hidden with device-specific override', (done) => {
      platform.config.hidden["GW1000:indoorTemperature"] = true;
      platform.config.hidden["GW1000:indoorHumidity"] = true;

      device = new GW1000(platform, accessory, "GW1000");

      expect(device.temperature).to.be.undefined;
      expect(device.humidity).to.be.undefined;
      done();
    });
  });
});