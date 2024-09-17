import { expect } from 'chai';
import { WN35 } from './../../../src/devices/WN35';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let sensor = null;

const dataReport = {
  "dateutc": "2024-07-24 19:04:22",
  "leafwetness_ch1": "4",
  "leaf_batt1": "1.72",
};

const configs = ["v1Default", "v1Full", "v2Default", "v2Full"];

configs.forEach(config => {
  describe(`WN35 device should be configured ${config}`, () => {
    before('Initialize device', () => {
      platform = createPlatform(config);
      accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03")
      device = new WN35(platform, accessory, 1);
    });

    beforeEach('Reset config', () => {
      platform.config.nameOverrides = [];
      platform.config.hidden = {};
    });

    it('Services are created', (done) => {
      expect(device.battery).to.not.be.undefined;
      expect(device.leafWetness).to.not.be.undefined;
      expect(device.battery.displayName).to.equal('');
      expect(device.leafWetness.service.displayName).to.equal("Leaf Wetness");
      done();
    });

    it('Update is called successfully', (done) => {
      device.update(dataReport);

      expect(device.battery.characteristics[0].value).to.equal(0); // low batt
      expect(device.battery.characteristics[3].value).to.equal(100); // batt percentage
      expect(device.leafWetness.service.characteristics[0].value).to.equal("Leaf Wetness 4 %")
      done();
    });

    it('Services are created with name overrides', (done) => {
      platform.config.nameOverrides[0] = {"key": "WN35CH1:leafwetness", "value": "Test Leaf Wetness Name"};

      device = new WN35(platform, accessory, 1);

      expect(device.leafWetness).to.not.be.undefined;
      expect(device.leafWetness.service.characteristics[0].value).to.equal("Test Leaf Wetness Name");
      done();
    });

    it('Services are not created when hidden with general override', (done) => {
      platform.config.hidden["leafwetness"] = true;

      device = new WN35(platform, accessory, 1);

      expect(device.leafWetness).to.be.undefined;
      done();
    });

    it('Services are not created when hidden with device-specific override', (done) => {
      platform.config.hidden["WN35CH1:leafwetness"] = true;

      device = new WN35(platform, accessory, 1);

      expect(device.leafWetness).to.be.undefined;
      done();
    });
  });
});
