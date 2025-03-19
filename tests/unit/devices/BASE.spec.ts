import { expect } from 'chai';
import { BASE } from './../../../src/devices/BASE';
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
  describe(`BASE device should be configured ${config}`, () => {
    before('Initialize platform', () => {
      platform = createPlatform(config);
      accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03")
      platform.baseStationInfo.protocol = "Ecowitt";
      platform.config.nameOverrides = [];
      platform.config.hidden = {};

      device = new BASE(platform, accessory, "GW1000");
    });

    beforeEach('Reset config', () => {
      platform.config.nameOverrides = [];
      platform.config.hidden = {};
    });

    it('Services are created', (done) => {
      expect(device.indoorTemperature).to.not.be.undefined;
      expect(device.indoorHumidity).to.not.be.undefined;
      expect(device.indoorTemperature.service.displayName).to.equal("Temperature");
      expect(device.indoorHumidity.service.displayName).to.equal("Humidity");
      done();
    });

    it('Update is called successfully', (done) => {
      device.update(dataReport);

      expect(device.indoorHumidity.service.characteristics[0].value).to.equal("Humidity 49 %")
      expect(device.indoorTemperature.service.characteristics[0].value).to.equal("Temperature 80.60°F")
      done();
    });

    it('Services are created with name overrides', (done) => {
      platform.config.nameOverrides[0] = {"key": "BASE:indoorTemperature", "value": "Test Temperature Name"};
      platform.config.nameOverrides[1] = {"key": "BASE:indoorHumidity", "value": "Test Humidity Name"};

      device = new BASE(platform, accessory, "GW1000");

      expect(device.indoorTemperature).to.not.be.undefined;
      expect(device.indoorHumidity).to.not.be.undefined;
      expect(device.indoorTemperature.service.characteristics[0].value).to.equal("Test Temperature Name");
      expect(device.indoorHumidity.service.characteristics[0].value).to.equal("Test Humidity Name");
      done();
    });

    it('Services are not created when hidden with general override', (done) => {
      platform.config.hidden["indoorTemperature"] = true;
      platform.config.hidden["indoorHumidity"] = true;

      device = new BASE(platform, accessory, "GW1000");

      expect(device.indoorTemperature).to.be.undefined;
      expect(device.indoorHumidity).to.be.undefined;
      done();
    });

    it('Services are not created when hidden with device-specific override', (done) => {
      platform.config.hidden["BASE:indoorTemperature"] = true;
      platform.config.hidden["BASE:indoorHumidity"] = true;

      device = new BASE(platform, accessory, "GW1000");

      expect(device.indoorTemperature).to.be.undefined;
      expect(device.indoorHumidity).to.be.undefined;
      done();
    });
  });
});
