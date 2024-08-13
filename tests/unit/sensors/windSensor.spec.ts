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
    sensor = new WindSensor(platform, accessory, "Wind Direction");
  });

  it('Characteristics are created and initialized', (done) => {
    expect(sensor.service.characteristics.length).to.equal(5);
    expect(sensor.service.characteristics[0].value).to.equal("Wind Direction");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Wind Direction");
    expect(sensor.service.characteristics[3].value).to.equal(null);
    expect(sensor.service.characteristics[4].value).to.equal(null);
    done();
  });

  it('Characteristics are updated', (done) => {
    platform.config.ws.rain.units = "in";
    sensor.updateDirection(30, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Wind Direction 30 deg (NNE)");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Wind Direction 30 deg (NNE)");
    expect(sensor.service.characteristics[3].value).to.equal("30 deg (NNE)");
    expect(sensor.service.characteristics[4].value).to.equal("2024-05-14 19:44:29 UTC");
    done();
  });

  it('Characteristics are updated on bad direction value', (done) => {
    sensor.updateDirection(undefined, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Wind Direction");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Wind Direction");
    expect(sensor.service.characteristics[3].value).to.equal("NaN");
    expect(sensor.service.characteristics[4].value).to.equal("2024-05-14 19:44:29 UTC");
    done();
  });
});

//------------------------------------------------------------------------------

describe('Wind Sensor Service should be configured for Wind Speed', () => {
  before('Initialize service', () => {
    platform = createPlatform();
    accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03")
    sensor = new WindSensor(platform, accessory, "Wind Speed");
  });

  it('Characteristics are created and initialized', (done) => {
    expect(sensor.service.characteristics.length).to.equal(6);
    expect(sensor.service.characteristics[0].value).to.equal("Wind Speed");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Wind Speed");
    expect(sensor.service.characteristics[3].value).to.equal(null);
    expect(sensor.service.characteristics[4].value).to.equal(null);
    expect(sensor.service.characteristics[5].value).to.equal(null);
    done();
  });

  it('Characteristics are updated', (done) => {
    platform.config.ws.wind.units = "mph";
    sensor.updateSpeed(18, 22, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Wind Speed 18.0 mph");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Wind Speed 18.0 mph");
    expect(sensor.service.characteristics[3].value).to.equal("18.0 mph");
    expect(sensor.service.characteristics[4].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[5].value).to.equal("Moderate Breeze");
    done();
  });

  it('Motion detected when threshold greater than speed (mph)', (done) => {
    sensor.updateSpeed(25, 22, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Wind Speed 25.0 mph");
    expect(sensor.service.characteristics[1].value).to.equal(true)
    done();
  });

  it('Characteristics are updated on bad speed value', (done) => {
    sensor.updateSpeed(undefined, 22, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Wind Speed");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Wind Speed");
    expect(sensor.service.characteristics[3].value).to.equal("NaN");
    expect(sensor.service.characteristics[4].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[5].value).to.equal("None");
    done();
  });

  it('Characteristics are updated on bad threshold value', (done) => {
    sensor.updateSpeed(25, undefined, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Wind Speed 25.0 mph");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Wind Speed 25.0 mph");
    expect(sensor.service.characteristics[3].value).to.equal("25.0 mph");
    expect(sensor.service.characteristics[4].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[5].value).to.equal("Strong Breeze");
    done();
  });

  it('Characteristics are updated (kts)', (done) => {
    platform.config.ws.wind.units = "kts";
    sensor.updateSpeed(1, 22, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Wind Speed 0.9 kts");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Wind Speed 0.9 kts");
    expect(sensor.service.characteristics[3].value).to.equal("0.9 kts");
    expect(sensor.service.characteristics[4].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[5].value).to.equal("Calm");
    done();
  });

  it('Motion detected when threshold greater than rate (kts)', (done) => {
    platform.config.ws.wind.units = "kts";
    sensor.updateSpeed(1, 0.5, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Wind Speed 0.9 kts");
    expect(sensor.service.characteristics[1].value).to.equal(true)
    done();
  });

  it('Characteristics are updated (kmh)', (done) => {
    platform.config.ws.wind.units = "kmh";
    sensor.updateSpeed(1, 22, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Wind Speed 1.6 kmh");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Wind Speed 1.6 kmh");
    expect(sensor.service.characteristics[3].value).to.equal("1.6 kmh");
    expect(sensor.service.characteristics[4].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[5].value).to.equal("Calm");
    done();
  });

  it('Motion detected when threshold greater than rate (kmh)', (done) => {
    platform.config.ws.wind.units = "kmh";
    sensor.updateSpeed(1, 0.5, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Wind Speed 1.6 kmh");
    expect(sensor.service.characteristics[1].value).to.equal(true)
    done();
  });

  it('Characteristics are updated (mps)', (done) => {
    platform.config.ws.wind.units = "mps";
    sensor.updateSpeed(1, 22, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Wind Speed 0.4 mps");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Wind Speed 0.4 mps");
    expect(sensor.service.characteristics[3].value).to.equal("0.4 mps");
    expect(sensor.service.characteristics[4].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[5].value).to.equal("Calm");
    done();
  });

  it('Motion detected when threshold greater than rate (mps)', (done) => {
    platform.config.ws.wind.units = "mps";
    sensor.updateSpeed(1, 0.2, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Wind Speed 0.4 mps");
    expect(sensor.service.characteristics[1].value).to.equal(true)
    done();
  });
});
