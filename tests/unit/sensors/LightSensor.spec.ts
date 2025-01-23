import { expect } from 'chai';
import { LightSensor } from './../../../src/sensors/LightSensor';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let sensor = null;

describe('Light Sensor Service should be configured for Light', () => {
  before('Initialize service', () => {
    platform = createPlatform();
    accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03")
    sensor = new LightSensor(platform, accessory, "SensorID", "Light");
  });

  it('Characteristics are created and initialized', (done) => {
    expect(sensor.service.characteristics.length).to.equal(5);
    expect(sensor.service.characteristics[0].value).to.equal("Light");
    expect(sensor.service.characteristics[1].value).to.equal(0.0001);
    expect(sensor.service.characteristics[2].value).to.equal("Light");
    expect(sensor.service.characteristics[3].value).to.equal(null);
    expect(sensor.service.characteristics[4].value).to.equal(false);
    done();
  });

  it('Characteristics are updated on Light', (done) => {
    sensor.update(100, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Light 12670lx");
    expect(sensor.service.characteristics[1].value).to.equal(12670)
    expect(sensor.service.characteristics[2].value).to.equal("Light 12670lx");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal(true);
    done();
  });

  it('Characteristics are not updated on bad Light value', (done) => {
    sensor.update(undefined, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Light 12670lx");
    expect(sensor.service.characteristics[1].value).to.equal(12670)
    expect(sensor.service.characteristics[2].value).to.equal("Light 12670lx");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal(false);
    done();
  });
});
