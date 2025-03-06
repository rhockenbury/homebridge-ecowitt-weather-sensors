import { expect } from 'chai';
import { WH41 } from './../../../src/devices/WH41';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let sensor = null;

const dataReport = {
  "dateutc": "2024-07-24 19:04:22",
  "pm25_ch1": "14.0",
  "pm25_avg_24h_ch1": "3.3",
  "pm25batt1": "1.2"
};

const configs = ["v1Default", "v1Full", "v2Default", "v2Full"];

configs.forEach(config => {
  describe(`WH41 device should be configured ${config}`, () => {
    before('Initialize device', () => {
      platform = createPlatform(config);
      accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03");
    });

    beforeEach('Reset config', () => {
      platform.baseStationInfo.protocol = "Ecowitt";
      platform.config.nameOverrides = [];
      platform.config.hidden = {};
    });

    it('Services are created', (done) => {
      device = new WH41(platform, accessory, 1);

      expect(device.battery).to.not.be.undefined;
      expect(device.airQualityPM25).to.not.be.undefined;
      expect(device.airQualityPM25Avg).to.not.be.undefined;

      expect(device.battery.service.displayName).to.equal('Battery');
      expect(device.airQualityPM25.service.displayName).to.equal("PM2.5 Air Quality");
      expect(device.airQualityPM25Avg.service.displayName).to.equal("PM2.5 Air Quality 24h Avg");
      done();
    });

    it('Update is called successfully', (done) => {
      device = new WH41(platform, accessory, 1);
      device.update(dataReport);

      expect(device.battery.service.characteristics[1].value).to.equal(0); // low batt
      expect(device.battery.service.characteristics[4].value).to.equal(24); // batt percentage
      expect(device.airQualityPM25.service.characteristics[0].value).to.equal("PM2.5 Air Quality 14 mcg/m³");
      expect(device.airQualityPM25Avg.service.characteristics[0].value).to.equal("PM2.5 Air Quality 24h Avg 3 mcg/m³");
      done();
    });

    it('Services are created with name overrides', (done) => {
      platform.config.nameOverrides[0] = {"key": "WH41CH1:airQualityPM25", "value": "Test PM2.5 Air Quality Name"};
      platform.config.nameOverrides[1] = {"key": "WH41CH1:airQualityPM25Avg", "value": "Test PM2.5 Air Quality 24h Avg Name"};

      device = new WH41(platform, accessory, 1);

      expect(device.airQualityPM25.service.characteristics[0].value).to.equal("Test PM2.5 Air Quality Name");
      expect(device.airQualityPM25Avg.service.characteristics[0].value).to.equal("Test PM2.5 Air Quality 24h Avg Name");
      done();
    });

    it('Services are not created when hidden with general override', (done) => {
      platform.config.hidden["airQualityPM25"] = true;
      platform.config.hidden["airQualityPM25Avg"] = true;

      device = new WH41(platform, accessory, 1);

      expect(device.airQualityPM25).to.be.undefined;
      expect(device.airQualityPM25Avg).to.be.undefined;
      done();
    });

    it('Services are not created when hidden with device-specific override', (done) => {
      platform.config.hidden["WH41CH1:airQualityPM25"] = true;
      platform.config.hidden["WH41CH1:airQualityPM25Avg"] = true;

      device = new WH41(platform, accessory, 1);

      expect(device.temperature).to.be.undefined;
      expect(device.airQualityPM25).to.be.undefined;
      expect(device.airQualityPM25Avg).to.be.undefined;
      done();
    });
  });
});
