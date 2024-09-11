import { expect } from 'chai';
import { CarbonDioxideSensor } from './../../../src/sensors/CarbonDioxideSensor';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let sensor = null;

describe('Carbon Dioxide Service should be configured for Carbon Dioxide', () => {
  before('Initialize service', () => {
    platform = createPlatform();
    accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03")
    sensor = new CarbonDioxideSensor(platform, accessory, "SensorID", "Carbon Dioxide");
  });

  it('Characteristics are created and initialized', (done) => {
    expect(sensor.service.characteristics.length).to.equal(5);
    expect(sensor.service.characteristics[0].value).to.equal("Carbon Dioxide");
    expect(sensor.service.characteristics[1].value).to.equal(0);
    expect(sensor.service.characteristics[2].value).to.equal("Carbon Dioxide");
    expect(sensor.service.characteristics[3].value).to.equal(null);
    expect(sensor.service.characteristics[4].value).to.equal(false);
    done();
  });

  it('Characteristics are updated', (done) => {
    sensor.update(1100, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Carbon Dioxide 1100ppm");
    expect(sensor.service.characteristics[1].value).to.equal(1);
    expect(sensor.service.characteristics[2].value).to.equal("Carbon Dioxide 1100ppm");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal(true);
    expect(sensor.service.characteristics[5].value).to.equal(1100);
    done();
  });

  it('Characteristics are not updated on bad carbon dioxide value', (done) => {
    sensor.update(undefined, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Carbon Dioxide 1100ppm");
    expect(sensor.service.characteristics[1].value).to.equal(1);
    expect(sensor.service.characteristics[2].value).to.equal("Carbon Dioxide 1100ppm");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal(false);
    expect(sensor.service.characteristics[5].value).to.equal(1100);
    done();
  });
});
