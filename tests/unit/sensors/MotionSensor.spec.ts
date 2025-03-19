import { expect } from 'chai';
import { MotionSensor } from './../../../src/sensors/MotionSensor';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let sensor = null;

describe('Motion Sensor Service should be configured for Motion', () => {
  before('Initialize service', () => {
    platform = createPlatform();
    accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03")
    sensor = new MotionSensor(platform, accessory, "SensorID", "Motion");
    sensor.setName("Motion");
    sensor.setStatusActive(false);
  });

  it('Characteristics are created and initialized', (done) => {
    expect(sensor.service.characteristics.length).to.equal(6);
    expect(sensor.service.characteristics[0].value).to.equal("Motion");
    expect(sensor.service.characteristics[1].value).to.equal(false);
    expect(sensor.service.characteristics[2].value).to.equal("Motion");
    expect(sensor.service.characteristics[3].value).to.equal(null);
    expect(sensor.service.characteristics[4].value).to.equal(null);
    expect(sensor.service.characteristics[5].value).to.equal(false);
    done();
  });

  it('Default trigger mode toZero behavior', (done) => {
    platform.config.additional.triggerMode = "toZero";
    expect(sensor.defaultTrigger(5, 5)).to.equal(false);
    expect(sensor.defaultTrigger(4, 5)).to.equal(false);
    expect(sensor.defaultTrigger(6, 4)).to.equal(false);
    expect(sensor.defaultTrigger(0, 6)).to.equal(true);
    expect(sensor.defaultTrigger(3, 0)).to.equal(false);
    done();
  });

  it('Default trigger mode fromZero behavior', (done) => {
    platform.config.additional.triggerMode = "fromZero";
    expect(sensor.defaultTrigger(5, 5)).to.equal(false);
    expect(sensor.defaultTrigger(4, 5)).to.equal(false);
    expect(sensor.defaultTrigger(6, 4)).to.equal(false);
    expect(sensor.defaultTrigger(0, 6)).to.equal(false);
    expect(sensor.defaultTrigger(3, 0)).to.equal(true);
    done();
  });

  it('Default trigger mode tofromZero behavior', (done) => {
    platform.config.additional.triggerMode = "tofromZero";
    expect(sensor.defaultTrigger(5, 5)).to.equal(false);
    expect(sensor.defaultTrigger(4, 5)).to.equal(false);
    expect(sensor.defaultTrigger(6, 4)).to.equal(false);
    expect(sensor.defaultTrigger(0, 6)).to.equal(true);
    expect(sensor.defaultTrigger(3, 0)).to.equal(true);
    done();
  });

  it('Default trigger mode all behavior', (done) => {
    platform.config.additional.triggerMode = "all";
    expect(sensor.defaultTrigger(5, 5)).to.equal(false);
    expect(sensor.defaultTrigger(4, 5)).to.equal(true);
    expect(sensor.defaultTrigger(6, 4)).to.equal(true);
    expect(sensor.defaultTrigger(0, 6)).to.equal(true);
    expect(sensor.defaultTrigger(3, 0)).to.equal(true);
    done();
  });

  it('Custom trigger behavior', (done) => {
    expect(sensor.customTrigger(2, 3, 'gt')).to.equal(false);
    expect(sensor.customTrigger(2, 3, 'lt')).to.equal(true);
    expect(sensor.customTrigger(3, 3, 'gt')).to.equal(true);
    expect(sensor.customTrigger(3, 3, 'lt')).to.equal(false);
    expect(sensor.customTrigger(4, 3, 'gt')).to.equal(true);
    expect(sensor.customTrigger(4, 3, 'lt')).to.equal(false);
    done();
  });
});
