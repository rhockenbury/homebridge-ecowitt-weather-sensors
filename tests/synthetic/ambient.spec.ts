import { expect } from 'chai';
import { createPlatform, api } from './../driver';

//------------------------------------------------------------------------------

let testData = null;
let platform = null;

describe('Platform should be configured with accessories', () => {

  // ws1965 is WN1920 and WN67
  it('ws1965_wn67 sensors are created', (done) => {
    testData = require('./data/ambient/ws1965_wn67.json');
    platform = createPlatform("synthetic");
    platform.baseStationInfo.protocol = "Ambient";
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(2)
    expect(platform.baseStationInfo.sensors[0].type).to.equal("WN1920");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WN67");
    expect(platform.unconsumedReportData.length).to.equal(1); // 'winddir_avg10m'
    expect(platform.log._readableState.pipes[1].logs.filter(log => log.level === 'warn').length).to.equal(0);
    done();
  });

  // WS2000 is HP2550 and WH65
  it('ws2000_wh25 sensors are created', (done) => {
    testData = require('./data/ambient/ws2000_wh25.json');
    platform = createPlatform("synthetic");
    platform.baseStationInfo.protocol = "Ambient";
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(1)
    expect(platform.baseStationInfo.sensors[0].type).to.equal("WH25");
    expect(platform.unconsumedReportData.length).to.equal(1); // 'eventrainin'
    expect(platform.log._readableState.pipes[1].logs.filter(log => log.level === 'warn').length).to.equal(0);
    done();
  });

  // WS2000 is HP2550 and WH65
  it('ws2000_wh65_wh51_wn35 sensors are created', (done) => {
    testData = require('./data/ambient/ws2000_wh65_wh51_wn35.json');
    platform = createPlatform("synthetic");
    platform.baseStationInfo.protocol = "Ambient";
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(3)
    expect(platform.baseStationInfo.sensors[0].type).to.equal("WH65");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WH51");
    expect(platform.baseStationInfo.sensors[2].type).to.equal("WN35");
    expect(platform.unconsumedReportData.length).to.equal(1); // 'winddir_avg10m'
    expect(platform.log._readableState.pipes[1].logs.filter(log => log.level === 'warn').length).to.equal(1); // base station not created
    done();
  });

  // WS2000 is HP2550 and WH65
  it('ws2000_wh65_wh45_wn31multi sensors are created', (done) => {
    testData = require('./data/ambient/ws2000_wh65_wh45_wn31multi.json');
    platform = createPlatform("synthetic");
    platform.baseStationInfo.protocol = "Ambient";
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(5)
    expect(platform.baseStationInfo.sensors[0].type).to.equal("WH65");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WH45");
    expect(platform.baseStationInfo.sensors[2].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[3].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[4].type).to.equal("WH25");
    expect(platform.unconsumedReportData.length).to.equal(3); // 'winddir_avg10m', 'aqi_pm25_24h_aqin', 'aqi_pm25_aqin'
    expect(platform.log._readableState.pipes[1].logs.filter(log => log.level === 'warn').length).to.equal(1); // base station not created
    done();
  });

  // ws2902 is WS2900 and WH65
  it('ws2902_wh65_wn31 sensors are created', (done) => {
    testData = require('./data/ambient/ws2902_wh65_wn31.json');
    platform = createPlatform("synthetic");
    platform.baseStationInfo.protocol = "Ambient";
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(3);
    expect(platform.baseStationInfo.sensors[0].type).to.equal("WS2900");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WH65");
    expect(platform.baseStationInfo.sensors[2].type).to.equal("WN31");
    expect(platform.unconsumedReportData.length).to.equal(0);
    expect(platform.log._readableState.pipes[1].logs.filter(log => log.level === 'warn').length).to.equal(0);
    done();
  });

  // ws5000 is HP2550/Observer and WS80, WH57, and WH25
  it('ws5000_ws80_wh57_wh40_wh25 sensors are created', (done) => {
    testData = require('./data/ambient/ws5000_ws80_wh57_wh40_wh25.json');
    platform = createPlatform("synthetic");
    platform.baseStationInfo.protocol = "Ambient";
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(4)
    expect(platform.baseStationInfo.sensors[0].type).to.equal("WS80");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WH57");
    expect(platform.baseStationInfo.sensors[2].type).to.equal("WH40");
    expect(platform.baseStationInfo.sensors[3].type).to.equal("WH25");
    expect(platform.unconsumedReportData.length).to.equal(1); // 'winddir_avg10m'
    expect(platform.log._readableState.pipes[1].logs.filter(log => log.level === 'warn').length).to.equal(1); // solar radiation value
    done();
  });
});
