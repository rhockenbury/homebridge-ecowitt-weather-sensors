import { expect } from 'chai';
import { UltravioletSensor } from './../../../src/sensors/UltravioletSensor';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let sensor = null;

describe('Ultraviolet Sensor Service should be configured for Ultraviolet', () => {
  before('Initialize service', () => {
    platform = createPlatform();
    accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03")
    sensor = new UltravioletSensor(platform, accessory, "SensorID", "UV Index");
  });

  it('Characteristics are created and initialized', (done) => {
    expect(sensor.service.characteristics.length).to.equal(7);
    expect(sensor.service.characteristics[0].value).to.equal("UV Index");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("UV Index");
    expect(sensor.service.characteristics[3].value).to.equal(null);
    expect(sensor.service.characteristics[4].value).to.equal(null);
    expect(sensor.service.characteristics[5].value).to.equal(null);
    expect(sensor.service.characteristics[6].value).to.equal(false);
    done();
  });

  it('Characteristics are updated', (done) => {
    sensor.update(3, 5, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("UV Index 3");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("UV Index 3");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("3");
    expect(sensor.service.characteristics[5].value).to.equal("Moderate");
    expect(sensor.service.characteristics[6].value).to.equal(true);
    done();
  });

  it('Motion detected when threshold greater than UV', (done) => {
    sensor.update(8, 5, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("UV Index 8");
    expect(sensor.service.characteristics[1].value).to.equal(true)
    done();
  });

  it('Characteristics are not updated on bad UV value', (done) => {
    sensor.update(undefined, 5, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("UV Index 8");
    expect(sensor.service.characteristics[1].value).to.equal(true)
    expect(sensor.service.characteristics[2].value).to.equal("UV Index 8");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("8");
    expect(sensor.service.characteristics[5].value).to.equal("Very High");
    expect(sensor.service.characteristics[6].value).to.equal(false);
    done();
  });

  it('Characteristics are not updated on bad threshold value', (done) => {
    sensor.update(8, undefined, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("UV Index 8");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("UV Index 8");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("8");
    expect(sensor.service.characteristics[5].value).to.equal("Very High");
    expect(sensor.service.characteristics[6].value).to.equal(true);
    done();
  });
});
