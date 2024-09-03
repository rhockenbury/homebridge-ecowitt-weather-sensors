import { expect } from 'chai';
import { RainSensor } from './../../../src/sensors/RainSensor';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let sensor = null;

describe('Rain Sensor Service should be configured for Rain Rate', () => {
  before('Initialize service', () => {
    platform = createPlatform();
    accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03")
    sensor = new RainSensor(platform, accessory, "SensorID", "Rain Rate");
  });

  it('Characteristics are created and initialized', (done) => {
    expect(sensor.service.characteristics.length).to.equal(6);
    expect(sensor.service.characteristics[0].value).to.equal("Rain Rate");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Rain Rate");
    expect(sensor.service.characteristics[3].value).to.equal(null);
    expect(sensor.service.characteristics[4].value).to.equal(null);
    expect(sensor.service.characteristics[5].value).to.equal(null);
    done();
  });

  it('Characteristics are updated (in)', (done) => {
    platform.config.units.rain = "in";
    sensor.updateRate(3, 5, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Rain Rate 3.0 in/hour");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Rain Rate 3.0 in/hour");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("3.0 in/hour");
    expect(sensor.service.characteristics[5].value).to.equal("Violent");
    done();
  });

  it('Motion detected when threshold greater than rate (in)', (done) => {
    sensor.updateRate(5, 3, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Rain Rate 5.0 in/hour");
    expect(sensor.service.characteristics[1].value).to.equal(true)
    done();
  });

  it('Characteristics are not updated on bad rate value', (done) => {
    sensor.updateRate(undefined, 3, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Rain Rate 5.0 in/hour");
    expect(sensor.service.characteristics[1].value).to.equal(true)
    expect(sensor.service.characteristics[2].value).to.equal("Rain Rate 5.0 in/hour");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("5.0 in/hour");
    expect(sensor.service.characteristics[5].value).to.equal("Violent");
    done();
  });

  it('Characteristics are not updated on bad threshold value', (done) => {
    sensor.updateRate(3, undefined, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Rain Rate 3.0 in/hour");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Rain Rate 3.0 in/hour");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("3.0 in/hour");
    expect(sensor.service.characteristics[5].value).to.equal("Violent");
    done();
  });

  it('Characteristics are updated (mm)', (done) => {
    platform.config.units.rain = "mm";
    sensor.updateRate(1, 30, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Rain Rate 25.4 mm/hour");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Rain Rate 25.4 mm/hour");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("25.4 mm/hour");
    expect(sensor.service.characteristics[5].value).to.equal("Heavy");
    done();
  });

  it('Motion detected when threshold greater than rate (mm)', (done) => {
    sensor.updateRate(1, 24, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Rain Rate 25.4 mm/hour");
    expect(sensor.service.characteristics[1].value).to.equal(true)
    done();
  });
});

//------------------------------------------------------------------------------

describe('Rain Sensor Service should be configured for Rain Total', () => {
  before('Initialize service', () => {
    platform = createPlatform();
    accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03")
    sensor = new RainSensor(platform, accessory, "SensorID", "Rain Total");
  });

  it('Characteristics are created and initialized', (done) => {
    expect(sensor.service.characteristics.length).to.equal(5);
    expect(sensor.service.characteristics[0].value).to.equal("Rain Total");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Rain Total");
    expect(sensor.service.characteristics[3].value).to.equal(null);
    expect(sensor.service.characteristics[4].value).to.equal(null);
    done();
  });

  it('Characteristics are updated (in)', (done) => {
    platform.config.units.rain = "in";
    sensor.updateTotal(3, 5, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Rain Total 3.0 in");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Rain Total 3.0 in");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("3.0 in");
    done();
  });

  it('Motion detected when threshold greater than total (in)', (done) => {
    sensor.updateTotal(5, 3, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Rain Total 5.0 in");
    expect(sensor.service.characteristics[1].value).to.equal(true)
    done();
  });

  it('Characteristics are not updated on bad total value', (done) => {
    sensor.updateTotal(undefined, 3, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Rain Total 5.0 in");
    expect(sensor.service.characteristics[1].value).to.equal(true)
    expect(sensor.service.characteristics[2].value).to.equal("Rain Total 5.0 in");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("5.0 in");
    done();
  });

  it('Characteristics are not updated on bad threshold value', (done) => {
    sensor.updateTotal(3, undefined, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Rain Total 3.0 in");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Rain Total 3.0 in");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("3.0 in");
    done();
  });

  it('Characteristics are updated (mm)', (done) => {
    platform.config.units.rain = "mm";
    sensor.updateTotal(1, 30, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Rain Total 25.4 mm");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Rain Total 25.4 mm");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("25.4 mm");
    done();
  });

  it('Motion detected when threshold greater than rate (mm)', (done) => {
    platform.config.units.rain = "mm";
    sensor.updateTotal(1, 24, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Rain Total 25.4 mm");
    expect(sensor.service.characteristics[1].value).to.equal(true)
    done();
  });
});
