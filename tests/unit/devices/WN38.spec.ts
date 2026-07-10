import { expect } from 'chai';
import { WN38 } from './../../../src/devices/WN38';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let device = null;

const dataReport = {
  'dateutc': '2026-07-04 15:05:09',
  'bgt': '71.78',
  'wbgt': '79.34',
  'bgtbatt': '1.64',
};

const configs = ['v1Default', 'v1Full', 'v2Default', 'v2Full'];

configs.forEach(config => {
  describe(`WN38 device should be configured ${config}`, () => {
    before('Initialize device', () => {
      platform = createPlatform(config);
      accessory = new api.platformAccessory('Accessory', '5746853e-4fee-4e47-97dd-53065ef1de03');
      platform.baseStationInfo.protocol = 'Ecowitt';
      platform.config.nameOverrides = [];
      platform.config.hidden = {};

      device = new WN38(platform, accessory);
    });

    beforeEach('Reset config', () => {
      platform.config.nameOverrides = [];
      platform.config.hidden = {};
    });

    it('Services are created', (done) => {
      expect(device.battery).to.not.be.undefined;
      expect(device.blackGlobeTemperature).to.not.be.undefined;
      expect(device.wetBulbGlobeTemperature).to.not.be.undefined;
      expect(device.battery.service.displayName).to.equal('Battery');
      expect(device.blackGlobeTemperature.service.displayName).to.equal('Black Globe Temperature');
      expect(device.wetBulbGlobeTemperature.service.displayName).to.equal('Wet Bulb Globe Temperature');
      done();
    });

    it('Update is called successfully', (done) => {
      device.update(dataReport);

      expect(device.battery.service.characteristics[1].value).to.equal(0); // low batt
      expect(device.battery.service.characteristics[4].value).to.equal(100); // batt percentage
      expect(device.blackGlobeTemperature.service.characteristics[0].value).to.equal('Black Globe Temperature 71.60°F');
      expect(device.wetBulbGlobeTemperature.service.characteristics[0].value).to.equal('Wet Bulb Globe Temperature 79.70°F');
      done();
    });

    it('Services are created with name overrides', (done) => {
      platform.config.nameOverrides[0] = {'key': 'WN38:blackGlobeTemperature', 'value': 'Test BGT'};

      device = new WN38(platform, accessory);

      expect(device.blackGlobeTemperature).to.not.be.undefined;
      expect(device.blackGlobeTemperature.service.characteristics[0].value).to.equal('Test BGT');
      done();
    });

    it('Services are not created when hidden with general override', (done) => {
      platform.config.hidden['blackGlobeTemperature'] = true;
      platform.config.hidden['wetBulbGlobeTemperature'] = true;

      device = new WN38(platform, accessory);

      expect(device.blackGlobeTemperature).to.be.undefined;
      expect(device.wetBulbGlobeTemperature).to.be.undefined;
      done();
    });

    it('Services are not created when hidden with device-specific override', (done) => {
      platform.config.hidden['WN38:blackGlobeTemperature'] = true;
      platform.config.hidden['WN38:wetBulbGlobeTemperature'] = true;

      device = new WN38(platform, accessory);

      expect(device.blackGlobeTemperature).to.be.undefined;
      expect(device.wetBulbGlobeTemperature).to.be.undefined;
      done();
    });
  });
});
