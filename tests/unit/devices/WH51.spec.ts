import { expect } from 'chai';
import { WH51 } from './../../../src/devices/WH51';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let sensor = null;

const dataReport = {
  "dateutc": "2024-07-24 19:04:22",
  "soilmoisture1": "49",
  "soilbatt1": "1.2"
};

const configs = ["v1Default", "v1Full", "v2Default", "v2Full"];

configs.forEach(config => {
  describe(`WH51 device should be configured ${config}`, () => {
    before('Initialize device', () => {
      platform = createPlatform(config);
      accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03")
      device = new WH51(platform, accessory, 1);
    });

    beforeEach('Reset config', () => {
      platform.config.nameOverrides = [];
      platform.config.hidden = {};
    });

    it('Services are created', (done) => {
      expect(device.battery).to.not.be.undefined;
      expect(device.soilMoisture).to.not.be.undefined;
      expect(device.battery.displayName).to.equal('');
      expect(device.soilMoisture.service.displayName).to.equal("Soil Moisture");
      done();
    });

    it('Update is called successfully', (done) => {
      device.update(dataReport);

      expect(device.battery.characteristics[0].value).to.equal(0); // low batt
      expect(device.battery.characteristics[3].value).to.equal(75); // batt percentage
      expect(device.soilMoisture.service.characteristics[0].value).to.equal("Soil Moisture 49 %")
      done();
    });

    it('Services are created with name overrides', (done) => {
      platform.config.nameOverrides[0] = {"key": "WH51CH1:soilmoisture", "value": "Test Soil Moisture Name"};

      device = new WH51(platform, accessory, 1);

      expect(device.soilMoisture).to.not.be.undefined;
      expect(device.soilMoisture.service.characteristics[0].value).to.equal("Test Soil Moisture Name");
      done();
    });

    it('Services are not created when hidden with general override', (done) => {
      platform.config.hidden["soilmoisture"] = true;

      device = new WH51(platform, accessory, 1);

      expect(device.soilMoisture).to.be.undefined;
      done();
    });

    it('Services are not created when hidden with device-specific override', (done) => {
      platform.config.hidden["WH51CH1:soilmoisture"] = true;

      device = new WH51(platform, accessory, 1);

      expect(device.soilMoisture).to.be.undefined;
      done();
    });
  });
});
