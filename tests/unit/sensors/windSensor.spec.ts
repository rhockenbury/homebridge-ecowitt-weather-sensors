import { expect } from 'chai';
import { WindSensor } from './../../../src/sensors/WindSensor';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let sensor = null;

describe('Wind Sensor Service should be configured for Wind Direction', () => {
  before('Initialize service', () => {
    platform = createPlatform();
    accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03")
    sensor = new WindSensor(platform, accessory, "SensorID", "Wind Direction");
  });

  it('Characteristics are created and initialized', (done) => {
    expect(sensor.service.characteristics.length).to.equal(6);
    expect(sensor.service.characteristics[0].value).to.equal("Wind Direction");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Wind Direction");
    expect(sensor.service.characteristics[3].value).to.equal(null);
    expect(sensor.service.characteristics[4].value).to.equal(null);
    expect(sensor.service.characteristics[5].value).to.equal(false);
    done();
  });

  it('Characteristics are updated', (done) => {
    sensor.updateDirection(30, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Wind Direction 30° (NNE)");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Wind Direction 30° (NNE)");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("30° (NNE)");
    expect(sensor.service.characteristics[5].value).to.equal(true);
    done();
  });

  it('Characteristics are not updated on bad direction value', (done) => {
    sensor.updateDirection(undefined, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Wind Direction 30° (NNE)");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Wind Direction 30° (NNE)");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("30° (NNE)");
    expect(sensor.service.characteristics[5].value).to.equal(false);
    done();
  });
});

//------------------------------------------------------------------------------

describe('Wind Sensor Service should be configured for Wind Speed', () => {
  before('Initialize service', () => {
    platform = createPlatform();
    accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03")
    sensor = new WindSensor(platform, accessory, "SensorID", "Wind Speed");
  });

  it('Characteristics are created and initialized', (done) => {
    expect(sensor.service.characteristics.length).to.equal(7);
    expect(sensor.service.characteristics[0].value).to.equal("Wind Speed");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Wind Speed");
    expect(sensor.service.characteristics[3].value).to.equal(null);
    expect(sensor.service.characteristics[4].value).to.equal(null);
    expect(sensor.service.characteristics[5].value).to.equal(null);
    expect(sensor.service.characteristics[6].value).to.equal(false);
    done();
  });

  it('Characteristics are updated', (done) => {
    platform.config.units.wind = "mph";
    sensor.updateSpeed(18, 22, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Wind Speed 18.0 mph");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Wind Speed 18.0 mph");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("18.0 mph");
    expect(sensor.service.characteristics[5].value).to.equal("Moderate Breeze");
    expect(sensor.service.characteristics[6].value).to.equal(true);
    done();
  });

  it('Motion detected when threshold greater than speed (mph)', (done) => {
    sensor.updateSpeed(25, 22, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Wind Speed 25.0 mph");
    expect(sensor.service.characteristics[1].value).to.equal(true)
    done();
  });

  it('Characteristics are not updated on bad speed value', (done) => {
    sensor.updateSpeed(undefined, 22, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Wind Speed 25.0 mph");
    expect(sensor.service.characteristics[1].value).to.equal(true)
    expect(sensor.service.characteristics[2].value).to.equal("Wind Speed 25.0 mph");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("25.0 mph");
    expect(sensor.service.characteristics[5].value).to.equal("Strong Breeze");
    expect(sensor.service.characteristics[6].value).to.equal(false);
    done();
  });

  it('Characteristics are not updated on bad threshold value', (done) => {
    sensor.updateSpeed(25, undefined, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Wind Speed 25.0 mph");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Wind Speed 25.0 mph");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("25.0 mph");
    expect(sensor.service.characteristics[5].value).to.equal("Strong Breeze");
    expect(sensor.service.characteristics[6].value).to.equal(true);
    done();
  });

  it('Characteristics are updated (kts)', (done) => {
    platform.config.units.wind = "kts";
    sensor.updateSpeed(1, 22, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Wind Speed 0.9 kts");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Wind Speed 0.9 kts");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("0.9 kts");
    expect(sensor.service.characteristics[5].value).to.equal("Calm");
    expect(sensor.service.characteristics[6].value).to.equal(true);
    done();
  });

  it('Motion detected when threshold greater than rate (kts)', (done) => {
    platform.config.units.wind = "kts";
    sensor.updateSpeed(1, 0.5, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Wind Speed 0.9 kts");
    expect(sensor.service.characteristics[1].value).to.equal(true)
    done();
  });

  it('Characteristics are updated (kph)', (done) => {
    platform.config.units.wind = "kph";
    sensor.updateSpeed(1, 22, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Wind Speed 1.6 kph");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Wind Speed 1.6 kph");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("1.6 kph");
    expect(sensor.service.characteristics[5].value).to.equal("Calm");
    expect(sensor.service.characteristics[6].value).to.equal(true);
    done();
  });

  it('Motion detected when threshold greater than rate (kph)', (done) => {
    platform.config.units.wind = "kph";
    sensor.updateSpeed(1, 0.5, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Wind Speed 1.6 kph");
    expect(sensor.service.characteristics[1].value).to.equal(true)
    done();
  });

  it('Characteristics are updated (mps)', (done) => {
    platform.config.units.wind = "mps";
    sensor.updateSpeed(1, 22, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Wind Speed 0.4 mps");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Wind Speed 0.4 mps");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("0.4 mps");
    expect(sensor.service.characteristics[5].value).to.equal("Calm");
    expect(sensor.service.characteristics[6].value).to.equal(true);
    done();
  });

  it('Motion detected when threshold greater than rate (mps)', (done) => {
    platform.config.units.wind = "mps";
    sensor.updateSpeed(1, 0.2, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Wind Speed 0.4 mps");
    expect(sensor.service.characteristics[1].value).to.equal(true)
    done();
  });
});
