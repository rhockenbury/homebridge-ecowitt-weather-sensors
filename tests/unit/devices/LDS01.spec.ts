import { expect } from 'chai';
import { LDS01 } from './../../../src/devices/LDS01';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let sensor = null;

// total depth set
const dataReport1 = {
  "dateutc": "2024-07-24 19:04:22",
  "air_ch1": "2284",
  "depth_ch1": "2716",
  "thi_ch1": "5000",
  "ldsbatt1": "3.04"
};

// total depth unset
const dataReport2 = {
  "dateutc": "2024-07-24 19:04:22",
  "air_ch1": "2284",
  "thi_ch1": "0",
  "ldsbatt1": "3.04"
};

const configs = ["v1Default", "v1Full", "v2Default", "v2Full"];

configs.forEach(config => {
  describe(`LDS01 device should be configured ${config}`, () => {
    before('Initialize device', () => {
      platform = createPlatform(config);
      accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03");
      platform.baseStationInfo.protocol = "Ecowitt";
      platform.config.nameOverrides = [];
      platform.config.hidden = {};

      device = new LDS01(platform, accessory, 1);
    });

    beforeEach('Reset config', () => {
      platform.config.nameOverrides = [];
      platform.config.hidden = {};
    });

    it('Services are created', (done) => {
      expect(device.battery).to.not.be.undefined;
      expect(device.currentDepth).to.not.be.undefined;
      expect(device.totalDepth).to.not.be.undefined;
      expect(device.airGap).to.not.be.undefined;
      expect(device.battery.service.displayName).to.equal('Battery');
      expect(device.currentDepth.service.characteristics[0].value).to.equal("Current Depth");
      expect(device.totalDepth.service.characteristics[0].value).to.equal("Total Depth");
      expect(device.airGap.service.characteristics[0].value).to.equal("Air Gap");
      done();
    });

    it('Update is called successfully', (done) => {
      device.update(dataReport1);

      expect(device.battery.service.characteristics[1].value).to.equal(0); // low batt
      expect(device.battery.service.characteristics[4].value).to.equal(92); // batt percentage
      expect(device.currentDepth.service.characteristics[0].value).to.equal("Current Depth 106.9 in");
      expect(device.totalDepth.service.characteristics[0].value).to.equal("Total Depth 196.9 in");
      expect(device.airGap.service.characteristics[0].value).to.equal("Air Gap 89.9 in");
      done();
    });

    it('Update is called successfully with no optional data', (done) => {
      device.update(dataReport2);

      expect(device.battery.service.characteristics[1].value).to.equal(0); // low batt
      expect(device.battery.service.characteristics[4].value).to.equal(92); // batt percentage
      expect(device.airGap.service.characteristics[0].value).to.equal("Air Gap 89.9 in");

      // optional
      expect(device.currentDepth).to.be.undefined;
      expect(device.totalDepth).to.be.undefined;
      done();
    });

    it('Services are created with name overrides', (done) => {
      platform.config.nameOverrides[0] = {"key": "LDS01CH1:currentDepth", "value": "Test Current Depth Name"};
      platform.config.nameOverrides[1] = {"key": "LDS01CH1:totalDepth", "value": "Test Total Depth Name"};
      platform.config.nameOverrides[2] = {"key": "LDS01CH1:airGap", "value": "Test Air Gap Name"};

      device = new LDS01(platform, accessory, 1);

      expect(device.currentDepth).to.not.be.undefined;
      expect(device.totalDepth).to.not.be.undefined;
      expect(device.airGap).to.not.be.undefined;
      expect(device.currentDepth.service.characteristics[0].value).to.equal("Test Current Depth Name");
      expect(device.totalDepth.service.characteristics[0].value).to.equal("Test Total Depth Name");
      expect(device.airGap.service.characteristics[0].value).to.equal("Test Air Gap Name");
      done();
    });

    it('Services are not created when hidden with general override', (done) => {
      platform.config.hidden["currentDepth"] = true;
      platform.config.hidden["totalDepth"] = true;
      platform.config.hidden["airGap"] = true;

      device = new LDS01(platform, accessory, 1);

      expect(device.currentDepth).to.be.undefined;
      expect(device.totalDepth).to.be.undefined;
      expect(device.airGap).to.be.undefined;
      done();
    });

    it('Services are not created when hidden with device-specific override', (done) => {
      platform.config.hidden["LDS01CH1:currentDepth"] = true;
      platform.config.hidden["LDS01CH1:totalDepth"] = true;
      platform.config.hidden["LDS01CH1:airGap"] = true;

      device = new LDS01(platform, accessory, 1);

      expect(device.currentDepth).to.be.undefined;
      expect(device.totalDepth).to.be.undefined;
      expect(device.airGap).to.be.undefined;
      done();
    });
  });
});
