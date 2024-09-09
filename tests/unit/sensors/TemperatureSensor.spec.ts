import { expect } from 'chai';
import { TemperatureSensor } from './../../../src/sensors/TemperatureSensor';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let sensor = null;

describe('Temperature Sensor Service should be configured for Temperature', () => {
  before('Initialize service', () => {
    platform = createPlatform();
    accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03")
    sensor = new TemperatureSensor(platform, accessory, "SensorID", "Temperature");
  });

  it('Characteristics are created and initialized', (done) => {
    expect(sensor.service.characteristics.length).to.equal(4);
    expect(sensor.service.characteristics[0].value).to.equal("Temperature");
    expect(sensor.service.characteristics[1].value).to.equal(0);
    expect(sensor.service.characteristics[2].value).to.equal("Temperature");
    expect(sensor.service.characteristics[3].value).to.equal(null);
    done();
  });

  it('Characteristics are updated', (done) => {
    sensor.update(50, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Temperature 50.0°F");
    expect(sensor.service.characteristics[1].value).to.equal(10);
    expect(sensor.service.characteristics[2].value).to.equal("Temperature 50.0°F");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    done();
  });

  it('Characteristics are not updated on bad temperature value', (done) => {
    sensor.update(undefined, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Temperature 50.0°F");
    expect(sensor.service.characteristics[1].value).to.equal(10);
    expect(sensor.service.characteristics[2].value).to.equal("Temperature 50.0°F");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    done();
  });
});
