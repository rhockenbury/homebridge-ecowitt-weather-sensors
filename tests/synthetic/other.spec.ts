import { expect } from 'chai';
import { createPlatform, api } from './../driver';

//------------------------------------------------------------------------------

let testData = null;
let platform = null;

describe('Platform should be configured with accessories', () => {

  // ws1965 is WN1920 and WN67
  it('elv_ws980 sensors are created', (done) => {
    testData = require('./data/other/elv_ws980.json');
    platform = createPlatform("synthetic");
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(2)
    expect(platform.baseStationInfo.sensors[0].type).to.equal("WS2350");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WH65");
    expect(platform.unconsumedReportData.length).to.equal(0);
    expect(platform.log._readableState.pipes[1].logs.filter(log => log.level === 'warn').length).to.equal(1); // unable to update WH65
    done();
  });

  it('froggit_hp1000 sensors are created', (done) => {
    testData = require('./data/other/froggit_hp1000.json');
    platform = createPlatform("synthetic");
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(5);
    expect(platform.baseStationInfo.sensors[0].type).to.equal("WS68");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WH65");
    expect(platform.baseStationInfo.sensors[2].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[3].type).to.equal("WH26");
    expect(platform.baseStationInfo.sensors[4].type).to.equal("WH25");
    expect(platform.unconsumedReportData.length).to.equal(2); // 'winddir_avg10m', 'windspdmph_avg10m'
    expect(platform.log._readableState.pipes[1].logs.filter(log => log.level === 'warn').length).to.equal(0);
    done();
  });

  it('gogen_me3900 sensors are created', (done) => {
    testData = require('./data/other/gogen_me3900.json');
    platform = createPlatform("synthetic");
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(2);
    expect(platform.baseStationInfo.sensors[0].type).to.equal("WS2900");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WH65");
    expect(platform.unconsumedReportData.length).to.equal(0);
    expect(platform.log._readableState.pipes[1].logs.filter(log => log.level === 'warn').length).to.equal(0);
    done();
  });

  it('sainlogic_ws3500 sensors are created', (done) => {
    testData = require('./data/other/sainlogic_ws3500.json');
    platform = createPlatform("synthetic");
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(2);
    expect(platform.baseStationInfo.sensors[0].type).to.equal("WS2900");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WH65");
    expect(platform.unconsumedReportData.length).to.equal(0);
    expect(platform.log._readableState.pipes[1].logs.filter(log => log.level === 'warn').length).to.equal(0);
    done();
  });
});
