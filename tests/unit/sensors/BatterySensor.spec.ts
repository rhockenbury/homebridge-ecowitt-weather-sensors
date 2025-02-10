import { expect } from 'chai';
import { BatterySensor } from './../../../src/sensors/BatterySensor';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let sensor = null;

describe('Battery Sensor Service should be configured for Battery', () => {
  before('Initialize service', () => {
    platform = createPlatform();
    accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03")
    sensor = new BatterySensor(platform, accessory, "SensorID", "Battery");
  });

  it('Characteristics are created and initialized', (done) => {
    expect(sensor.service.characteristics.length).to.equal(4);
    expect(sensor.service.characteristics[0].value).to.equal("Battery");
    expect(sensor.service.characteristics[1].value).to.equal(0);
    expect(sensor.service.characteristics[2].value).to.equal("Battery");
    expect(sensor.service.characteristics[3].value).to.equal(null);
    done();
  });

  it('Characteristics are updated on level change', (done) => {
    sensor.updateLevel(48, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Battery 48 %");
    expect(sensor.service.characteristics[1].value).to.equal(0)
    expect(sensor.service.characteristics[2].value).to.equal("Battery 48 %");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal(48);
    done();
  });

  it('Characteristics are updated on status low change', (done) => {
    sensor.updateStatusLow(true, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Battery 48 %");
    expect(sensor.service.characteristics[1].value).to.equal(1)
    expect(sensor.service.characteristics[2].value).to.equal("Battery 48 %");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal(48);
    done();
  });

  it('Characteristics are not updated on charging state change', (done) => {
    sensor.updateChargingState(true, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Battery 48 %");
    expect(sensor.service.characteristics[1].value).to.equal(1)
    expect(sensor.service.characteristics[2].value).to.equal("Battery 48 %");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal(48);
    expect(sensor.service.characteristics[5].value).to.equal(1);
    done();
  });
});
