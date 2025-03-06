import { expect } from 'chai';
import { WH25 } from './../../../src/devices/WH25';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let device = null;

const dataReport = {
  "dateutc": "2024-07-24 19:04:22",
  "tempinf": "80.78",
  "humidityin": "49",
  "wh25batt": "1"
};

const configs = ["v1Default", "v1Full", "v2Default", "v2Full"];

configs.forEach(config => {
  describe(`WH25 device should be configured ${config}`, () => {
    before('Initialize platform', () => {
      platform = createPlatform(config);
      accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03");
      platform.baseStationInfo.protocol = "Ecowitt";
      platform.config.nameOverrides = [];
      platform.config.hidden = {};

      device = new WH25(platform, accessory);
    });

    beforeEach('Reset config', () => {
      platform.config.nameOverrides = [];
      platform.config.hidden = {};
    });

    it('Services are created', (done) => {
      expect(device.battery).to.not.be.undefined;
      expect(device.temperature).to.not.be.undefined;
      expect(device.humidity).to.not.be.undefined;
      expect(device.battery.service.displayName).to.equal('Battery');
      expect(device.temperature.service.displayName).to.equal("Temperature");
      expect(device.humidity.service.displayName).to.equal("Humidity");
      done();
    });

    it('Update is called successfully', (done) => {
      device.update(dataReport);

      expect(device.battery.service.characteristics[1].value).to.equal(1); // low batt
      expect(device.humidity.service.characteristics[0].value).to.equal("Humidity 49 %")
      expect(device.temperature.service.characteristics[0].value).to.equal("Temperature 80.60°F")
      done();
    });

    it('Services are created with name overrides', (done) => {
      platform.config.nameOverrides[0] = {"key": "WH25:indoorTemperature", "value": "Test Temperature Name"};
      platform.config.nameOverrides[1] = {"key": "WH25:indoorHumidity", "value": "Test Humidity Name"};

      device = new WH25(platform, accessory);

      expect(device.temperature).to.not.be.undefined;
      expect(device.humidity).to.not.be.undefined;
      expect(device.temperature.service.characteristics[0].value).to.equal("Test Temperature Name");
      expect(device.humidity.service.characteristics[0].value).to.equal("Test Humidity Name");
      done();
    });

    it('Services are not created when hidden with general override', (done) => {
      platform.config.hidden["indoorTemperature"] = true;
      platform.config.hidden["indoorHumidity"] = true;

      device = new WH25(platform, accessory);

      expect(device.temperature).to.be.undefined;
      expect(device.humidity).to.be.undefined;
      done();
    });

    it('Services are not created when hidden with device-specific override', (done) => {
      platform.config.hidden["WH25:indoorTemperature"] = true;
      platform.config.hidden["WH25:indoorHumidity"] = true;

      device = new WH25(platform, accessory);

      expect(device.temperature).to.be.undefined;
      expect(device.humidity).to.be.undefined;
      done();
    });
  });
});
