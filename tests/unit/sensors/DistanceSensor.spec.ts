import { expect } from 'chai';
import { DistanceSensor } from './../../../src/sensors/DistanceSensor';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let sensor = null;

describe('Lightning Sensor Service should be configured for Lightning Events', () => {
  before('Initialize service', () => {
    platform = createPlatform();
    accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03")
    sensor = new DistanceSensor(platform, accessory, "SensorID", "Laser Distance");
  });

  it('Characteristics are created and initialized', (done) => {
    expect(sensor.service.characteristics.length).to.equal(6);
    expect(sensor.service.characteristics[0].value).to.equal("Laser Distance");
    expect(sensor.service.characteristics[1].value).to.equal(false);
    expect(sensor.service.characteristics[2].value).to.equal("Laser Distance");
    expect(sensor.service.characteristics[3].value).to.equal(null);
    expect(sensor.service.characteristics[4].value).to.equal(null);
    expect(sensor.service.characteristics[5].value).to.equal(false);  // StatusActive
    done();
  });

  it('Characteristics are updated (in)', (done) => {
    platform.config.units.laserDistance = "in";
    sensor.updateDepth(23, 1, "gt", "2024-05-14 19:44:29");
    expect(sensor.service.characteristics[0].value).to.equal("Laser Distance 0.9 in");
    expect(sensor.service.characteristics[1].value).to.equal(false);
    expect(sensor.service.characteristics[2].value).to.equal("Laser Distance 0.9 in");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("0.9 in");
    expect(sensor.service.characteristics[5].value).to.equal(true);  // StatusActive
    done();
  });

  it('Motion detected when threshold greater than events', (done) => {
    sensor.updateDepth(25, 0.5, "gt", "2024-05-14 19:44:29");
    expect(sensor.service.characteristics[0].value).to.equal("Laser Distance 1.0 in");;
    expect(sensor.service.characteristics[1].value).to.equal(true)
    done();
  });

  it('Characteristics are not updated on bad distance value', (done) => {
    sensor.updateDepth(undefined, 0.5, "gt", "2024-05-14 19:44:29");
    expect(sensor.service.characteristics[0].value).to.equal("Laser Distance 1.0 in");
    expect(sensor.service.characteristics[1].value).to.equal(true)
    expect(sensor.service.characteristics[2].value).to.equal("Laser Distance 1.0 in");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("1.0 in");
    expect(sensor.service.characteristics[5].value).to.equal(false); // StatusActive
    done();
  });

  it('Characteristics are not updated on bad threshold value', (done) => {
    sensor.updateDepth(25, undefined, "gt", "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Laser Distance 1.0 in");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Laser Distance 1.0 in");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("1.0 in");
    expect(sensor.service.characteristics[5].value).to.equal(true); // StatusActive
    done();
  });

  it('Characteristics are updated (mm)', (done) => {
    platform.config.units.laserDistance = "mm";
    sensor.updateDepth(25, 30, "gt", "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Laser Distance 25.0 mm");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Laser Distance 25.0 mm");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("25.0 mm");
    expect(sensor.service.characteristics[5].value).to.equal(true); // StatusActive
    done();
  });

  it('Motion detected when threshold greater than distance (mm)', (done) => {
    sensor.updateDepth(25, 24, "gt", "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Laser Distance 25.0 mm");
    expect(sensor.service.characteristics[1].value).to.equal(true)
    done();
  });

  it('Characteristics are updated (ft)', (done) => {
    platform.config.units.laserDistance = "ft";
    sensor.updateDepth(25, 1, "gt", "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Laser Distance 0.1 ft");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Laser Distance 0.1 ft");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("0.1 ft");
    expect(sensor.service.characteristics[5].value).to.equal(true); // StatusActive
    done();
  });

  it('Motion detected when threshold greater than distance (ft)', (done) => {
    sensor.updateDepth(50, 0.1, "gt", "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Laser Distance 0.2 ft");
    expect(sensor.service.characteristics[1].value).to.equal(true)
    done();
  });

  it('Characteristics are updated (mt)', (done) => {
    platform.config.units.laserDistance = "mt";
    sensor.updateDepth(2500, 3, "gt", "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Laser Distance 2.5 m");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Laser Distance 2.5 m");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("2.5 m");
    expect(sensor.service.characteristics[5].value).to.equal(true); // StatusActive
    done();
  });

  it('Motion detected when threshold greater than distance (mt)', (done) => {
    sensor.updateDepth(2500, 2, "gt", "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Laser Distance 2.5 m");
    expect(sensor.service.characteristics[1].value).to.equal(true)
    done();
  });
});
