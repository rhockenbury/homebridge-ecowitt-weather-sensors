import { expect } from 'chai';
import { ConductivitySensor } from './../../../src/sensors/ConductivitySensor';
import { createPlatform, api } from './../../driver';

//------------------------------------------------------------------------------

let platform = null;
let accessory = null;
let sensor = null;

describe('Conductivity Sensor Service should be configured for Soil Conductivity', () => {
  before('Initialize service', () => {
    platform = createPlatform();
    accessory = new api.platformAccessory('Accessory', "5746853e-4fee-4e47-97dd-53065ef1de03")
    sensor = new ConductivitySensor(platform, accessory, "SensorID", "Soil Conductivity");
  });

  it('Characteristics are created and initialized', (done) => {
    expect(sensor.service.characteristics.length).to.equal(6);
    expect(sensor.service.characteristics[0].value).to.equal("Soil Conductivity");
    expect(sensor.service.characteristics[1].value).to.equal(false);
    expect(sensor.service.characteristics[2].value).to.equal("Soil Conductivity");
    expect(sensor.service.characteristics[3].value).to.equal(null);
    expect(sensor.service.characteristics[4].value).to.equal(null);
    expect(sensor.service.characteristics[5].value).to.equal(false);  // StatusActive
    done();
  });

  it('Characteristics are updated (microspm)', (done) => {
    platform.config.units.soilConductivity = "microspcm";
    sensor.update(500, 1000, "2024-05-14 19:44:29");
    expect(sensor.service.characteristics[0].value).to.equal("Soil Conductivity 500 μS/cm");
    expect(sensor.service.characteristics[1].value).to.equal(false);
    expect(sensor.service.characteristics[2].value).to.equal("Soil Conductivity 500 μS/cm");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("500 μS/cm");
    expect(sensor.service.characteristics[5].value).to.equal(true);  // StatusActive
    done();
  });

  it('Motion detected when threshold greater than conductivity', (done) => {
    sensor.update(500, 25, "2024-05-14 19:44:29");
    expect(sensor.service.characteristics[0].value).to.equal("Soil Conductivity 500 μS/cm");;
    expect(sensor.service.characteristics[1].value).to.equal(true)
    done();
  });

  it('Characteristics are not updated on bad conductivity value', (done) => {
    sensor.update(undefined, 25, "2024-05-14 19:44:29");
    expect(sensor.service.characteristics[0].value).to.equal("Soil Conductivity 500 μS/cm");
    expect(sensor.service.characteristics[1].value).to.equal(true)
    expect(sensor.service.characteristics[2].value).to.equal("Soil Conductivity 500 μS/cm");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("500 μS/cm");
    expect(sensor.service.characteristics[5].value).to.equal(false); // StatusActive
    done();
  });

  it('Characteristics are not updated on bad threshold value', (done) => {
    sensor.update(25, undefined, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Soil Conductivity 25 μS/cm");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Soil Conductivity 25 μS/cm");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("25 μS/cm");
    expect(sensor.service.characteristics[5].value).to.equal(true); // StatusActive
    done();
  });

  it('Characteristics are updated (millispcm)', (done) => {
    platform.config.units.soilConductivity = "millispcm";
    sensor.update(25, 0.5, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Soil Conductivity 0.025 mS/cm");
    expect(sensor.service.characteristics[1].value).to.equal(false)
    expect(sensor.service.characteristics[2].value).to.equal("Soil Conductivity 0.025 mS/cm");
    expect(sensor.service.characteristics[3].value).to.equal("2024-05-14 19:44:29 UTC");
    expect(sensor.service.characteristics[4].value).to.equal("0.025 mS/cm");
    expect(sensor.service.characteristics[5].value).to.equal(true); // StatusActive
    done();
  });

  it('Motion detected when threshold greater than conductivity (millispcm)', (done) => {
    sensor.update(25, 0.01, "2024-05-14 19:44:29")
    expect(sensor.service.characteristics[0].value).to.equal("Soil Conductivity 0.025 mS/cm");
    expect(sensor.service.characteristics[1].value).to.equal(true)
    done();
  });
});
