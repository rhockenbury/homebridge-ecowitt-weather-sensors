import { expect } from 'chai';
import { LightningSensor } from './../../../src/sensors/LightningSensor';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let sensor = null;

describe('Lightning Sensor Service should be configured for Lightning Events', () => {
  before('Initialize service', () => {
    platform = createPlatform();
    accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03")
    sensor = new LightningSensor(platform, accessory, "SensorID", "Lightning Events");
  });

  it('Characteristics are created and initialized', (done) => {
    expect(sensor.service.characteristics.length).to.equal(6);
    expect(sensor.service.characteristics[0].value).to.equal("Lightning Events");
    expect(sensor.service.characteristics[1].value).to.equal(false);
    expect(sensor.service.characteristics[2].value).to.equal("Lightning Events");
    expect(sensor.service.characteristics[3].value).to.equal(null);
    expect(sensor.service.characteristics[4].value).to.equal(null);
    expect(sensor.service.characteristics[5].value).to.equal(false);  // StatusActive
    done();
  });

  it('Characteristics are updated', (done) => {
    sensor.updateLightningEvent(23, 25, "2024-05-14 19:44:29");
    expect(sensor.service.characteristics[0].value).to.equal("Lightning Events 23 strikes");
    expect(sensor.service.characteristics[1].value).to.equal(false);
    expect(sensor.service.characteristics[2].value).to.equal("Lightning Events 23 strikes");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("23 strikes");
    expect(sensor.service.characteristics[5].value).to.equal(true);  // StatusActive
    done();
  });

  it('Motion detected when threshold greater than events', (done) => {
    sensor.updateLightningEvent(25, 23, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Lightning Events 25 strikes");;
    expect(sensor.service.characteristics[1].value).to.equal(true)
    done();
  });

  it('Characteristics are not updated on bad events value', (done) => {
    sensor.updateLightningEvent(undefined, 23, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Lightning Events 25 strikes");
    expect(sensor.service.characteristics[1].value).to.equal(true)
    expect(sensor.service.characteristics[2].value).to.equal("Lightning Events 25 strikes");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("25 strikes");
    expect(sensor.service.characteristics[5].value).to.equal(false); // StatusActive
    done();
  });

  it('Characteristics are not updated on bad threshold value', (done) => {
    sensor.updateLightningEvent(25, undefined, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Lightning Events 25 strikes");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Lightning Events 25 strikes");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("25 strikes");
    expect(sensor.service.characteristics[5].value).to.equal(true); // StatusActive
    done();
  });
});

describe('Lightning Sensor Service should be configured for Lightning Distance', () => {
  before('Initialize service', () => {
    platform = createPlatform();
    accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03")
    sensor = new LightningSensor(platform, accessory, "SensorID", "Lightning Distance");
  });

  it('Characteristics are created and initialized', (done) => {
    expect(sensor.service.characteristics.length).to.equal(6);
    expect(sensor.service.characteristics[0].value).to.equal("Lightning Distance");
    expect(sensor.service.characteristics[1].value).to.equal(false);
    expect(sensor.service.characteristics[2].value).to.equal("Lightning Distance");
    expect(sensor.service.characteristics[3].value).to.equal(null);
    expect(sensor.service.characteristics[4].value).to.equal(null);
    expect(sensor.service.characteristics[5].value).to.equal(false);  // StatusActive
    done();
  });

  it('Characteristics are updated', (done) => {
    sensor.updateLightningDistance(5, 2, "2024-05-14 19:44:29");
    expect(sensor.service.characteristics[0].value).to.equal("Lightning Distance 3.1 mi");
    expect(sensor.service.characteristics[1].value).to.equal(false);
    expect(sensor.service.characteristics[2].value).to.equal("Lightning Distance 3.1 mi");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("3.1 mi");
    expect(sensor.service.characteristics[5].value).to.equal(true);  // StatusActive
    done();
  });

  it('Motion detected when threshold less than distance', (done) => {
    sensor.updateLightningDistance(5, 10, "2024-05-14 19:44:29");
    expect(sensor.service.characteristics[0].value).to.equal("Lightning Distance 3.1 mi");;
    expect(sensor.service.characteristics[1].value).to.equal(true)
    done();
  });

  it('Characteristics are not updated on bad distance value', (done) => {
    sensor.updateLightningDistance(undefined, 10, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Lightning Distance 3.1 mi");
    expect(sensor.service.characteristics[1].value).to.equal(true)
    expect(sensor.service.characteristics[2].value).to.equal("Lightning Distance 3.1 mi");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("3.1 mi");
    expect(sensor.service.characteristics[5].value).to.equal(false); // StatusActive
    done();
  });

  it('Characteristics are not updated on bad threshold value', (done) => {
    sensor.updateLightningDistance(5, undefined, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Lightning Distance 3.1 mi");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Lightning Distance 3.1 mi");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("3.1 mi");
    expect(sensor.service.characteristics[5].value).to.equal(true); // StatusActive
    done();
  });
});

describe('Lightning Sensor Service should be configured for Lightning Time', () => {
  before('Initialize service', () => {
    platform = createPlatform();
    accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03")
    sensor = new LightningSensor(platform, accessory, "SensorID", "Lightning Time");
  });

  it('Characteristics are created and initialized', (done) => {
    expect(sensor.service.characteristics.length).to.equal(6);
    expect(sensor.service.characteristics[0].value).to.equal("Lightning Time");
    expect(sensor.service.characteristics[1].value).to.equal(false);
    expect(sensor.service.characteristics[2].value).to.equal("Lightning Time");
    expect(sensor.service.characteristics[3].value).to.equal(null);
    expect(sensor.service.characteristics[4].value).to.equal(null);
    expect(sensor.service.characteristics[5].value).to.equal(false);  // StatusActive
    done();
  });

  it('Characteristics are updated', (done) => {
    sensor.updateLightningTime(84600, 0, "2024-05-14 19:44:29");
    expect(sensor.service.characteristics[0].value).to.equal("Lightning Time 1 minute ago");
    expect(sensor.service.characteristics[1].value).to.equal(false);
    expect(sensor.service.characteristics[2].value).to.equal("Lightning Time 1 minute ago");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("1 minute ago");
    expect(sensor.service.characteristics[5].value).to.equal(true);  // StatusActive
    done();
  });

  it('Characteristics are updated', (done) => {
    sensor.updateLightningTime(7889238000, 0, "2024-05-14 19:44:29");
    expect(sensor.service.characteristics[0].value).to.equal("Lightning Time last quarter");
    expect(sensor.service.characteristics[1].value).to.equal(false);
    expect(sensor.service.characteristics[2].value).to.equal("Lightning Time last quarter");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("last quarter");
    expect(sensor.service.characteristics[5].value).to.equal(true);  // StatusActive
    done();
  });

  it('Motion detected when threshold less than time', (done) => {
    sensor.updateLightningTime(84600, 90, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Lightning Time 1 minute ago");;
    expect(sensor.service.characteristics[1].value).to.equal(true)
    done();
  });

  it('Characteristics are not updated on bad time value', (done) => {
    sensor.updateLightningTime(undefined, 90, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Lightning Time 1 minute ago");
    expect(sensor.service.characteristics[1].value).to.equal(true)
    expect(sensor.service.characteristics[2].value).to.equal("Lightning Time 1 minute ago");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("1 minute ago");
    expect(sensor.service.characteristics[5].value).to.equal(false); // StatusActive
    done();
  });

  it('Characteristics are not updated on bad threshold value', (done) => {
    sensor.updateLightningTime(84600, undefined, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Lightning Time 1 minute ago");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Lightning Time 1 minute ago");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("1 minute ago");
    expect(sensor.service.characteristics[5].value).to.equal(true); // StatusActive
    done();
  });
});
