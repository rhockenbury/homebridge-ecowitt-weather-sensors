import { expect } from 'chai';
import { WN30 } from './../../../src/devices/WN30';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let sensor = null;

const dataReport = {
  "dateutc": "2024-07-24 19:04:22",
  "temp1f": "80.78",
  "batt1": "1"
};

const configs = ["v1Default", "v1Full", "v2Default", "v2Full"];

configs.forEach(config => {
  describe(`WN30 device should be configured ${config}`, () => {
    before('Initialize device', () => {
      platform = createPlatform(config);
      accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03")
      device = new WN30(platform, accessory, 1);
    });

    beforeEach('Reset config', () => {
      platform.config.nameOverrides = [];
      platform.config.hidden = {};
    });

    it('Services are created', (done) => {
      expect(device.battery).to.not.be.undefined;
      expect(device.temperature).to.not.be.undefined;
      expect(device.battery.displayName).to.equal('');
      expect(device.temperature.service.displayName).to.equal("Temperature");
      done();
    });

    it('Update is called successfully', (done) => {
      device.update(dataReport);

      expect(device.battery.characteristics[0].value).to.equal(1); // low batt
      expect(device.temperature.service.characteristics[0].value).to.equal("Temperature 80.60°F")
      done();
    });

    it('Services are created with name overrides', (done) => {
      platform.config.nameOverrides[0] = {"key": "WN30CH1:temperature", "value": "Test Temperature Name"};

      device = new WN30(platform, accessory, 1);

      expect(device.temperature).to.not.be.undefined;
      expect(device.temperature.service.characteristics[0].value).to.equal("Test Temperature Name");
      done();
    });

    it('Services are not created when hidden with general override', (done) => {
      platform.config.hidden["temperature"] = true;

      device = new WN30(platform, accessory, 1);

      expect(device.temperature).to.be.undefined;
      done();
    });

    it('Services are not created when hidden with device-specific override', (done) => {
      platform.config.hidden["WN30CH1:temperature"] = true;

      device = new WN30(platform, accessory, 1);

      expect(device.temperature).to.be.undefined;
      done();
    });
  });
});