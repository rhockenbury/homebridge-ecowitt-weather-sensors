import { expect } from 'chai';
import { WH55 } from './../../../src/devices/WH55';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let sensor = null;

const dataReport = {
  "dateutc": "2024-07-24 19:04:22",
  "leak_ch1": "0",
  "leakbatt1": "4"
};

const configs = ["v1Default", "v1Full", "v2Default", "v2Full"];

configs.forEach(config => {
  describe(`WH55 device should be configured ${config}`, () => {
    before('Initialize device', () => {
      platform = createPlatform(config);
      accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03");

      platform.config.nameOverrides = [];
      platform.config.hidden = {};

      device = new WH55(platform, accessory, 1);
    });

    beforeEach('Reset config', () => {
      platform.config.nameOverrides = [];
      platform.config.hidden = {};
    });

    it('Services are created', (done) => {
      expect(device.battery).to.not.be.undefined;
      expect(device.leak).to.not.be.undefined;
      expect(device.battery.service.displayName).to.equal('Battery');
      expect(device.leak.service.characteristics[0].value).to.equal("Water Leak");
      done();
    });

    it('Update is called successfully', (done) => {
      device.update(dataReport);

      expect(device.battery.service.characteristics[1].value).to.equal(0); // low batt
      expect(device.battery.service.characteristics[4].value).to.equal(80); // batt percentage
      expect(device.leak.service.characteristics[0].value).to.equal("Water Leak Not Detected")
      done();
    });

    it('Services are created with name overrides', (done) => {
      platform.config.nameOverrides[0] = {"key": "WH55CH1:waterleak", "value": "Test Leak Name"};

      device = new WH55(platform, accessory, 1);

      expect(device.leak).to.not.be.undefined;
      expect(device.leak.service.characteristics[0].value).to.equal("Test Leak Name");
      done();
    });

    it('Services are not created when hidden with general override', (done) => {
      platform.config.hidden["waterleak"] = true;

      device = new WH55(platform, accessory, 1);

      expect(device.leak).to.be.undefined;
      done();
    });

    it('Services are not created when hidden with device-specific override', (done) => {
      platform.config.hidden["WH55CH1:waterleak"] = true;

      device = new WH55(platform, accessory, 1);

      expect(device.leak).to.be.undefined;
      done();
    });
  });
});
