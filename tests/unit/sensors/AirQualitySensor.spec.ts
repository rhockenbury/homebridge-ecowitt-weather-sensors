import { expect } from 'chai';
import { AirQualitySensor } from './../../../src/sensors/AirQualitySensor';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let sensor = null;

describe('Air Quality Sensor Service should be configured for PM2.5', () => {
  before('Initialize service', () => {
    platform = createPlatform();
    accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03")
    sensor = new AirQualitySensor(platform, accessory, "SensorID", "PM2.5 Air Quality");
  });

  it('Characteristics are created and initialized', (done) => {
    expect(sensor.service.characteristics.length).to.equal(5);
    expect(sensor.service.characteristics[0].value).to.equal("PM2.5 Air Quality");
    expect(sensor.service.characteristics[1].value).to.equal(0);
    expect(sensor.service.characteristics[2].value).to.equal("PM2.5 Air Quality");
    expect(sensor.service.characteristics[3].value).to.equal(null);
    expect(sensor.service.characteristics[4].value).to.equal(false);  // StatusActive
    done();
  });

  it('Characteristics are updated', (done) => {
    sensor.updatePM25(11, "2024-05-14 19:44:29");
    expect(sensor.service.characteristics[0].value).to.equal("PM2.5 Air Quality 11 mcg/m³");
    expect(sensor.service.characteristics[1].value).to.equal(2)
    expect(sensor.service.characteristics[2].value).to.equal("PM2.5 Air Quality 11 mcg/m³");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal(true); // StatusActive
    expect(sensor.service.characteristics[5].value).to.equal(11); // PM2_5Density
    done();
  });

  it('Characteristics are not updated on bad PM2.5 value', (done) => {
    sensor.updatePM25(undefined, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("PM2.5 Air Quality 11 mcg/m³");
    expect(sensor.service.characteristics[1].value).to.equal(2)
    expect(sensor.service.characteristics[2].value).to.equal("PM2.5 Air Quality 11 mcg/m³");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal(false); // StatusActive
    expect(sensor.service.characteristics[5].value).to.equal(11); // PM2_5Density
    done();
  });
});

describe('Air Quality Sensor Service should be configured for PM10', () => {
  before('Initialize service', () => {
    platform = createPlatform();
    accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03")
    sensor = new AirQualitySensor(platform, accessory, "SensorID", "PM10 Air Quality");
  });

  it('Characteristics are created and initialized', (done) => {
    expect(sensor.service.characteristics.length).to.equal(5);
    expect(sensor.service.characteristics[0].value).to.equal("PM10 Air Quality");
    expect(sensor.service.characteristics[1].value).to.equal(0);
    expect(sensor.service.characteristics[2].value).to.equal("PM10 Air Quality");
    expect(sensor.service.characteristics[3].value).to.equal(null);
    expect(sensor.service.characteristics[4].value).to.equal(false);  // StatusActive
    done();
  });

  it('Characteristics are updated', (done) => {
    sensor.updatePM10(11, "2024-05-14 19:44:29");
    expect(sensor.service.characteristics[0].value).to.equal("PM10 Air Quality 11 mcg/m³");
    expect(sensor.service.characteristics[1].value).to.equal(1)
    expect(sensor.service.characteristics[2].value).to.equal("PM10 Air Quality 11 mcg/m³");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal(true); // StatusActive
    expect(sensor.service.characteristics[5].value).to.equal(11); // PM2_5Density
    done();
  });

  it('Characteristics are not updated on bad PM25 value', (done) => {
    sensor.updatePM10(undefined, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("PM10 Air Quality 11 mcg/m³");
    expect(sensor.service.characteristics[1].value).to.equal(1)
    expect(sensor.service.characteristics[2].value).to.equal("PM10 Air Quality 11 mcg/m³");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal(false); // StatusActive
    expect(sensor.service.characteristics[5].value).to.equal(11); // PM2_5Density
    done();
  });
});
