
const driver = require('./driver');
const expect = require('chai').expect;

const testData = require('./data/1_gw2000b_ws85_wh51.json');
const test2Data = require('./data/2_gw1100a_wh51.json');
const test3Data = require('./data/3_gw1100c_ws65_wh51.json');
const test4Data = require('./data/4_gw2000b_wh51multi.json');
const test5Data = require('./data/5_gw1000b_wh31multi_wh26.json');
const test6Data = require('./data/6_gw1000_ws65_wh51multi_wh31multi_wh55_wh57.json');
const test7Data = require('./data/7_ws2350.json');
const test8Data = require('./data/8_ws2900_ws65.json');
const test9Data = require('./data/9_gw1000_wh26_wh31multi_wh51.json');
const test10Data = require('./data/10_gw1000a_wh26_wh51multi.json');

let platform = null;

describe('1_gw2000b_ws85_wh51', () => {
  before('Initializing platform', () => {
    platform = driver();
    platform.onDataReport(testData);
  });

  it('All sensors are created', (done) => {
    expect(platform.baseStationInfo.sensors.length).to.equal(3);
    done();
  });

  it('Base station is GW2000', (done) => {
    expect(platform.baseStationInfo.sensors[0].type).to.equal("GW2000");
    done();
  });

  it('Base station has humidity sensor', (done) => {
    expect(platform.baseStationInfo.sensors[0].accessory.humiditySensor).to.not.be.undefined;
    done();
  });

  it('Base station has temperature sensor', (done) => {
    expect(platform.baseStationInfo.sensors[0].accessory.temperatureSensor).to.not.be.undefined;
    done();
  });

  it('Weather station is WS85', (done) => {
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WS85");
    done();
  });

  it('Weather station has wind speed sensor', (done) => {
    expect(platform.baseStationInfo.sensors[1].accessory.windSpeed).to.not.be.undefined;
    done();
  });

  it('Weather station has wind gust sensor', (done) => {
    expect(platform.baseStationInfo.sensors[1].accessory.windGust).to.not.be.undefined;
    done();
  });

  it('Weather station has max daily wind gust sensor', (done) => {
    expect(platform.baseStationInfo.sensors[1].accessory.maxDailyGust).to.not.be.undefined;
    done();
  });

});
