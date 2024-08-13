import { expect } from 'chai';
import { createPlatform, api } from './../driver';

//------------------------------------------------------------------------------

let testData = null;
let platform = null;

// NOTE: sensors not tested are WH25, WH40, WH41, WN34
describe('Platform should be configured with accessories', () => {
  it('1_gw2000b_ws85_wh51 sensors are created', (done) => {
    testData = require('./data/1_gw2000b_ws85_wh51.json');
    platform = createPlatform();
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(3);
    expect(platform.baseStationInfo.sensors[0].type).to.equal("GW2000");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WS85");
    expect(platform.baseStationInfo.sensors[2].type).to.equal("WH51")
    done();
  });

  it('2_gw1100a_wh51 sensors are created', (done) => {
    testData = require('./data/2_gw1100a_wh51.json');
    platform = createPlatform();
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(2);
    expect(platform.baseStationInfo.sensors[0].type).to.equal("GW1100");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WH51");
    done();
  });

  it('3_gw1100c_ws65_wh51 sensors are created', (done) => {
    testData = require('./data/3_gw1100c_ws65_wh51.json');
    platform = createPlatform();
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(3);
    expect(platform.baseStationInfo.sensors[0].type).to.equal("GW1100");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WH65");
    expect(platform.baseStationInfo.sensors[2].type).to.equal("WH51");
    done();
  });

  it('4_gw2000b_wh51multi sensors are created', (done) => {
    testData = require('./data/4_gw2000b_wh51multi.json');
    platform = createPlatform();
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(4);
    expect(platform.baseStationInfo.sensors[0].type).to.equal("GW2000");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WH51");
    expect(platform.baseStationInfo.sensors[2].type).to.equal("WH51");
    expect(platform.baseStationInfo.sensors[3].type).to.equal("WH51");
    done();
  });

  // NOTE: WH26 is currently not supported
  it('5_gw1000b_wh31multi_wh26 sensors are created', (done) => {
    testData = require('./data/5_gw1000b_wh31multi_wh26.json');
    platform = createPlatform();
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(5)
    expect(platform.baseStationInfo.sensors[0].type).to.equal("GW1000");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WH31");
    expect(platform.baseStationInfo.sensors[2].type).to.equal("WH31");
    expect(platform.baseStationInfo.sensors[3].type).to.equal("WH31");
    expect(platform.baseStationInfo.sensors[4].type).to.equal("WH31");
    done();
  });

  it('6_gw1000_ws65_wh51multi_wh31multi_wh55_wh57 sensors are created', (done) => {
    testData = require('./data/6_gw1000_ws65_wh51multi_wh31multi_wh55_wh57.json');
    platform = createPlatform();
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(9);
    expect(platform.baseStationInfo.sensors[0].type).to.equal("GW1000");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WH65");
    expect(platform.baseStationInfo.sensors[2].type).to.equal("WH31");
    expect(platform.baseStationInfo.sensors[3].type).to.equal("WH31");
    expect(platform.baseStationInfo.sensors[4].type).to.equal("WH31");
    expect(platform.baseStationInfo.sensors[5].type).to.equal("WH51");
    expect(platform.baseStationInfo.sensors[6].type).to.equal("WH51");
    expect(platform.baseStationInfo.sensors[7].type).to.equal("WH55");
    expect(platform.baseStationInfo.sensors[8].type).to.equal("WH57");
    done();
  });

  // NOTE: Clearly some weather station based on data, but not batt info
  it('7_ws2350 sensors are created', (done) => {
    testData = require('./data/7_ws2350.json');
    platform = createPlatform();
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(0);
    done();
  });

  // NOTE: This one has internal temp, humid, pressure?
  it('8_ws2900_ws65 sensors are created', (done) => {
    testData = require('./data/8_ws2900_ws65.json');
    platform = createPlatform();
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(1);
    expect(platform.baseStationInfo.sensors[0].type).to.equal("WH65");
    done();
  });

  // NOTE: WH26 is currently not supported
  it('9_gw1000_wh26_wh31multi_wh51 sensors are created', (done) => {
    testData = require('./data/9_gw1000_wh26_wh31multi_wh51.json');
    platform = createPlatform();
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(5);
    expect(platform.baseStationInfo.sensors[0].type).to.equal("GW1000");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WH31");
    expect(platform.baseStationInfo.sensors[2].type).to.equal("WH31");
    expect(platform.baseStationInfo.sensors[3].type).to.equal("WH31");
    expect(platform.baseStationInfo.sensors[4].type).to.equal("WH51");
    done();
  });
});
