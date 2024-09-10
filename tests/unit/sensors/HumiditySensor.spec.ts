import { expect } from 'chai';
import { HumiditySensor } from './../../../src/sensors/HumiditySensor';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let sensor = null;

describe('Humdity Sensor Service should be configured for Humidity', () => {
  before('Initialize service', () => {
    platform = createPlatform();
    accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03")
    sensor = new HumiditySensor(platform, accessory, "SensorID", "Humidity");
  });

  it('Characteristics are created and initialized', (done) => {
    expect(sensor.service.characteristics.length).to.equal(4);
    expect(sensor.service.characteristics[0].value).to.equal("Humidity");
    expect(sensor.service.characteristics[1].value).to.equal(0);
    expect(sensor.service.characteristics[2].value).to.equal("Humidity");
    expect(sensor.service.characteristics[3].value).to.equal(null);
    done();
  });

  it('Characteristics are updated', (done) => {
    sensor.update(50, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Humidity 50 %");
    expect(sensor.service.characteristics[1].value).to.equal(50)
    expect(sensor.service.characteristics[2].value).to.equal("Humidity 50 %");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    done();
  });

  it('Characteristics are not updated on bad humidity value', (done) => {
    sensor.update(undefined, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Humidity 50 %");
    expect(sensor.service.characteristics[1].value).to.equal(50)
    expect(sensor.service.characteristics[2].value).to.equal("Humidity 50 %");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    done();
  });
});
