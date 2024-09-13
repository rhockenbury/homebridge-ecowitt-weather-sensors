import { expect } from 'chai';
import { WH57 } from './../../../src/devices/WH57';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let sensor = null;

const dataReport = {
  "dateutc": "2024-07-24 19:04:22",
  "lightning_num": "3",
  "lightning": "37",
  "lightning_time": "1662632990",
  "wh57batt": "5"
};

const configs = ["v1Default", "v1Full", "v2Default", "v2Full"];

configs.forEach(config => {
  describe(`WH57 device should be configured ${config}`, () => {
    before('Initialize device', () => {
      platform = createPlatform(config);
      accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03")
      device = new WH57(platform, accessory);
    });

    beforeEach('Reset config', () => {
      platform.config.nameOverrides = [];
      platform.config.hidden = {};
    });

    it('Services are created', (done) => {
      expect(device.battery).to.not.be.undefined;
      expect(device.lightningEvents).to.not.be.undefined;
      expect(device.lightningDistance).to.not.be.undefined;
      expect(device.lightningTime).to.not.be.undefined;


      expect(device.battery.displayName).to.equal('');
      expect(device.lightningEvents.service.displayName).to.equal("Strike Events");
      expect(device.lightningDistance.service.displayName).to.equal("Last Strike Distance");
      expect(device.lightningTime.service.displayName).to.equal("Last Strike Time");
      done();
    });

    it('Update is called successfully', (done) => {
      device.update(dataReport);

      expect(device.battery.characteristics[0].value).to.equal(0); // low batt
      expect(device.battery.characteristics[3].value).to.equal(100); // batt percentage
      expect(device.lightningEvents.service.characteristics[0].value).to.equal("Strike Events 3 strikes");
      expect(device.lightningDistance.service.characteristics[0].value).to.equal("Last Strike Distance 23.0 mi");
      expect(device.lightningTime.service.characteristics[0].value).to.equal("Last Strike Time 3 weeks ago");
      done();
    });

    it('Services are created with name overrides', (done) => {
      platform.config.nameOverrides[0] = {"key": "WH57:lightningEvents", "value": "Test Lightning Events Name"};
      platform.config.nameOverrides[1] = {"key": "WH57:lightningDistance", "value": "Test Lightning Distance Name"};
      platform.config.nameOverrides[2] = {"key": "WH57:lightningTime", "value": "Test Lightning Time Name"};

      device = new WH57(platform, accessory);

      expect(device.lightningEvents).to.not.be.undefined;
      expect(device.lightningDistance).to.not.be.undefined;
      expect(device.lightningTime).to.not.be.undefined;
      expect(device.lightningEvents.service.characteristics[0].value).to.equal("Test Lightning Events Name")
      expect(device.lightningDistance.service.characteristics[0].value).to.equal("Test Lightning Distance Name")
      expect(device.lightningTime.service.characteristics[0].value).to.equal("Test Lightning Time Name")
      done();
    });

    it('Services are not created when hidden with general override', (done) => {
      platform.config.hidden["lightningEvents"] = true;
      platform.config.hidden["lightningDistance"] = true;
      platform.config.hidden["lightningTime"] = true;

      device = new WH57(platform, accessory);

      expect(device.lightningEvents).to.be.undefined;
      expect(device.lightningDistance).to.be.undefined;
      expect(device.lightningTime).to.be.undefined;
      done();
    });

    it('Services are not created when hidden with device-specific override', (done) => {
      platform.config.hidden["WH57:lightningEvents"] = true;
      platform.config.hidden["WH57:lightningDistance"] = true;
      platform.config.hidden["WH57:lightningTime"] = true;

      device = new WH57(platform, accessory);

      expect(device.lightningEvents).to.be.undefined;
      expect(device.lightningDistance).to.be.undefined;
      expect(device.lightningTime).to.be.undefined;
      done();
    });
  });
});
