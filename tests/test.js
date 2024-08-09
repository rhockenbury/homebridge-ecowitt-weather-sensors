
const driver = require('./driver');
const expect = require('chai').expect;

const test1Data = require('./data/1_gw2000b_ws85_wh51.json');
const test2Data = require('./data/2_gw1100a_wh51.json');

let platform = null;

describe('1_gw2000b_ws85_wh51', () => {
  before('Initializing platform', () => {
    platform = driver();
    platform.onDataReport(test1Data);
  });

  it('All sensors are created', (done) => {
    expect(platform.baseStationInfo.sensors.length).to.equal(3);
    done();
  });

  it('Base station is GW2000', (done) => {
    expect(platform.baseStationInfo.sensors[0].accessory.accessory.displayName).to.equal("GW2000");
    done();
  });

  it('Base station has humidity sensor', (done) => {
    expect(platform.baseStationInfo.sensors[0].accessory.humiditySensor).to.not.equal(undefined);
    done();
  });

  it('Base station has temperature sensor', (done) => {
    expect(platform.baseStationInfo.sensors[0].accessory.temperatureSensor).to.not.equal(undefined);
    done();
  });

  it('Weather station is WS85', (done) => {
    expect(platform.baseStationInfo.sensors[1].accessory.accessory.displayName).to.equal("WS85");
    done();
  });

  it('Weather station has wind speed sensor', (done) => {
    expect(platform.baseStationInfo.sensors[1].accessory.windSpeed).to.not.equal(undefined);
    done();
  });

  it('Weather station has wind gust sensor', (done) => {
    expect(platform.baseStationInfo.sensors[1].accessory.windGust).to.not.equal(undefined);
    done();
  });

  it('Weather station has max daily wind gust sensor', (done) => {
    expect(platform.baseStationInfo.sensors[1].accessory.maxDailyGust).to.not.equal(undefined);
    done();
  });

});
