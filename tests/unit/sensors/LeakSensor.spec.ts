import { expect } from 'chai';
import { LeakSensor } from './../../../src/sensors/LeakSensor';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let sensor = null;

describe('LeakSensor Service should be configured for Leak', () => {
  before('Initialize service', () => {
    platform = createPlatform();
    accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03")
    sensor = new LeakSensor(platform, accessory, "SensorID", "Leak");
  });

  it('Characteristics are created and initialized', (done) => {
    expect(sensor.service.characteristics.length).to.equal(4);
    expect(sensor.service.characteristics[0].value).to.equal("Leak");
    expect(sensor.service.characteristics[1].value).to.equal(0);
    expect(sensor.service.characteristics[2].value).to.equal("Leak");
    expect(sensor.service.characteristics[3].value).to.equal(null);
    done();
  });

  it('Characteristics are updated on leak', (done) => {
    sensor.update(1, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Leak Detected");
    expect(sensor.service.characteristics[1].value).to.equal(1)
    expect(sensor.service.characteristics[2].value).to.equal("Leak Detected");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    done();
  });

  it('Characteristics are updated on no leak', (done) => {
    sensor.update(0, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Leak Not Detected");
    expect(sensor.service.characteristics[1].value).to.equal(0)
    expect(sensor.service.characteristics[2].value).to.equal("Leak Not Detected");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    done();
  });

  it('Characteristics are not updated on bad leak value', (done) => {
    sensor.update(undefined, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Leak Not Detected");
    expect(sensor.service.characteristics[1].value).to.equal(0)
    expect(sensor.service.characteristics[2].value).to.equal("Leak Not Detected");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    done();
  });
});
