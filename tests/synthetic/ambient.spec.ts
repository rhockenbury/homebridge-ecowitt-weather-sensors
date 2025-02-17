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
    platform.baseStationInfo.vendor = "Ambient";
    platform.onDataReport(testData);

    expect(platform.baseStationInfo.sensors.length).to.equal(2)
    expect(platform.baseStationInfo.sensors[0].type).to.equal("WN1920");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WN67");
    expect(platform.unconsumedReportData.length).to.equal(1); // 'winddir_avg10m'
    done();
  });
});
