import { expect } from 'chai';
import { createPlatform, api } from './../driver';

//------------------------------------------------------------------------------

let testData = null;
let platform = null;

describe('Platform should be configured with accessories', () => {

  it('gw1000_wh51_wn31multi_wh26 sensors are created', (done) => {
    testData = require('./data/gw1000_wh51_wn31multi_wh26.json');
    platform = createPlatform("synthetic");
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(6);
    expect(platform.baseStationInfo.sensors[0].type).to.equal("GW1000");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WH51");
    expect(platform.baseStationInfo.sensors[2].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[3].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[4].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[5].type).to.equal("WH26");
    expect(platform.unconsumedReportData.length).to.equal(0);
    done();
  });

  it('gw1000_wh65_wh57_wh55_wh51multi_wn31multi sensors are created', (done) => {
    testData = require('./data/gw1000_wh65_wh57_wh55_wh51multi_wn31multi.json');
    platform = createPlatform("synthetic");
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(9);
    expect(platform.baseStationInfo.sensors[0].type).to.equal("GW1000");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WH65");
    expect(platform.baseStationInfo.sensors[2].type).to.equal("WH57");
    expect(platform.baseStationInfo.sensors[3].type).to.equal("WH55");
    expect(platform.baseStationInfo.sensors[4].type).to.equal("WH51");
    expect(platform.baseStationInfo.sensors[5].type).to.equal("WH51");
    expect(platform.baseStationInfo.sensors[6].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[7].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[8].type).to.equal("WN31");
    expect(platform.unconsumedReportData.length).to.equal(0);
    done();
  });

  it('gw1000_wn31multi_wh26 sensors are created', (done) => {
    testData = require('./data/gw1000_wn31multi_wh26.json');
    platform = createPlatform("synthetic");
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(6)
    expect(platform.baseStationInfo.sensors[0].type).to.equal("GW1000");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[2].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[3].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[4].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[5].type).to.equal("WH26");
    expect(platform.unconsumedReportData.length).to.equal(0);
    done();
  });

  it('gw1000_ws68_wh65_wh26 sensors are created', (done) => {
    testData = require('./data/gw1000_ws68_wh65_wh26.json');
    platform = createPlatform("synthetic");
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(4)
    expect(platform.baseStationInfo.sensors[0].type).to.equal("GW1000");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WS68");
    expect(platform.baseStationInfo.sensors[2].type).to.equal("WH65");
    expect(platform.baseStationInfo.sensors[3].type).to.equal("WH26");
    expect(platform.unconsumedReportData.length).to.equal(0);
    done();
  });

  it('gw1000 are created', (done) => {
    testData = require('./data/gw1000.json');
    platform = createPlatform("synthetic");
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(1);
    expect(platform.baseStationInfo.sensors[0].type).to.equal("GW1000");
    expect(platform.unconsumedReportData.length).to.equal(0);
    done();
  });

  it('gw1100_wh51 sensors are created', (done) => {
    testData = require('./data/gw1100_wh51.json');
    platform = createPlatform("synthetic");
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(2);
    expect(platform.baseStationInfo.sensors[0].type).to.equal("GW1100");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WH51");
    expect(platform.unconsumedReportData.length).to.equal(0);
    done();
  });

  it('gw1100_wh65_wh51 sensors are created', (done) => {
    testData = require('./data/gw1100_wh65_wh51.json');
    platform = createPlatform("synthetic");
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(3);
    expect(platform.baseStationInfo.sensors[0].type).to.equal("GW1100");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WH65");
    expect(platform.baseStationInfo.sensors[2].type).to.equal("WH51");
    expect(platform.unconsumedReportData.length).to.equal(0);
    done();
  });

  it('gw1100_wn30multi sensors are created', (done) => {
    testData = require('./data/gw1100_wn30multi.json');
    platform = createPlatform("synthetic");
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(3)
    expect(platform.baseStationInfo.sensors[0].type).to.equal("GW1100");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WN30");
    expect(platform.baseStationInfo.sensors[2].type).to.equal("WN30");
    expect(platform.unconsumedReportData.length).to.equal(0);
    done();
  });

  it('gw1200_wh46 sensors are created', (done) => {
    testData = require('./data/gw1200_wh46.json');
    platform = createPlatform("synthetic");
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(2);
    expect(platform.baseStationInfo.sensors[0].type).to.equal("GW1200");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WH46");
    expect(platform.unconsumedReportData.length).to.equal(0);
    done();
  });

  it('gw2000_wh51multi sensors are created', (done) => {
    testData = require('./data/gw2000_wh51multi.json');
    platform = createPlatform("synthetic");
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(4);
    expect(platform.baseStationInfo.sensors[0].type).to.equal("GW2000");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WH51");
    expect(platform.baseStationInfo.sensors[2].type).to.equal("WH51");
    expect(platform.baseStationInfo.sensors[3].type).to.equal("WH51");
    expect(platform.unconsumedReportData.length).to.equal(0);
    done();
  });

  it('gw2000_ws85_wh51 sensors are created', (done) => {
    testData = require('./data/gw2000_ws85_wh51.json');
    platform = createPlatform("synthetic");
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(3);
    expect(platform.baseStationInfo.sensors[0].type).to.equal("GW2000");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WS85");
    expect(platform.baseStationInfo.sensors[2].type).to.equal("WH51");
    expect(platform.unconsumedReportData.length).to.equal(0);
    done();
  });

  it('gw2000_ws90_wh65_wh51 sensors are created', (done) => {
    testData = require('./data/gw2000_ws90_wh65_wh51.json');
    platform = createPlatform("synthetic");
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(4);
    expect(platform.baseStationInfo.sensors[0].type).to.equal("GW2000");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WS90");
    expect(platform.baseStationInfo.sensors[2].type).to.equal("WH65");
    expect(platform.baseStationInfo.sensors[3].type).to.equal("WH51");
    expect(platform.unconsumedReportData.length).to.equal(0);
    done();
  });

  it('gw2000_ws90_wh65_wh57_wh51multi_wh45_wh41_wn35_wn34_wn31multi_wh26 sensors are created', (done) => {
    testData = require('./data/gw2000_ws90_wh65_wh57_wh51multi_wh45_wh41_wn35_wn34_wn31multi_wh26.json');
    platform = createPlatform("synthetic");
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(24);
    expect(platform.baseStationInfo.sensors[0].type).to.equal("GW2000");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WS90");
    expect(platform.baseStationInfo.sensors[2].type).to.equal("WH65");
    expect(platform.baseStationInfo.sensors[3].type).to.equal("WH57");
    expect(platform.baseStationInfo.sensors[4].type).to.equal("WH51");
    expect(platform.baseStationInfo.sensors[5].type).to.equal("WH51");
    expect(platform.baseStationInfo.sensors[6].type).to.equal("WH51");
    expect(platform.baseStationInfo.sensors[7].type).to.equal("WH51");
    expect(platform.baseStationInfo.sensors[8].type).to.equal("WH51");
    expect(platform.baseStationInfo.sensors[9].type).to.equal("WH51");
    expect(platform.baseStationInfo.sensors[10].type).to.equal("WH45");
    expect(platform.baseStationInfo.sensors[11].type).to.equal("WH41");
    expect(platform.baseStationInfo.sensors[12].type).to.equal("WN35");
    expect(platform.baseStationInfo.sensors[13].type).to.equal("WN34");
    expect(platform.baseStationInfo.sensors[14].type).to.equal("WN34");
    expect(platform.baseStationInfo.sensors[15].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[16].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[17].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[18].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[19].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[20].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[21].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[22].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[23].type).to.equal("WH26");
    expect(platform.unconsumedReportData.length).to.equal(0);
    done();
  });

  it('gw2000_ws90 sensors are created', (done) => {
    testData = require('./data/gw2000_ws90.json');
    platform = createPlatform("synthetic");
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(2);
    expect(platform.baseStationInfo.sensors[0].type).to.equal("GW2000");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WS90");
    expect(platform.unconsumedReportData.length).to.equal(0);
    done();
  });

  it('hp2550_wh65_wh51multi_wh41_wn31multi_wh25 sensors are created', (done) => {
    testData = require('./data/hp2550_wh65_wh51multi_wh41_wn31multi_wh25.json');
    platform = createPlatform("synthetic");
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(8);
    expect(platform.baseStationInfo.sensors[0].type).to.equal("WH65");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WH51");
    expect(platform.baseStationInfo.sensors[2].type).to.equal("WH51");
    expect(platform.baseStationInfo.sensors[3].type).to.equal("WH41");
    expect(platform.baseStationInfo.sensors[4].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[5].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[6].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[7].type).to.equal("WH25");
    expect(platform.unconsumedReportData.length).to.equal(2);  // 'winddir_avg10m', 'windspdmph_avg10m'
    done();
  });

  it('hp2560_wh65_wn31multi sensors are created', (done) => {
    testData = require('./data/hp2561_wh65_wn31multi.json');
    platform = createPlatform("synthetic");
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(6);
    expect(platform.baseStationInfo.sensors[0].type).to.equal("HP2561");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WH65");
    expect(platform.baseStationInfo.sensors[2].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[3].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[4].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[5].type).to.equal("WN31");
    expect(platform.unconsumedReportData.length).to.equal(0);
    done();
  });

  it('hp2564_ws90 sensors are created', (done) => {
    testData = require('./data/hp2564_ws90.json');
    platform = createPlatform("synthetic");
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(2);
    expect(platform.baseStationInfo.sensors[0].type).to.equal("HP2564");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WS90");
    expect(platform.unconsumedReportData.length).to.equal(5); // 'gain10_piezo', 'gain20_piezo', 'gain30_piezo', 'gain40_piezo', 'gain50_piezo'
    done();
  });

  // NOTE: WS2350 not supported
  it('ws2350 sensors are created', (done) => {
    testData = require('./data/ws2350.json');
    platform = createPlatform("synthetic");
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(0);
    expect(platform.unconsumedReportData.length).to.equal(0);
    done();
  });

  // NOTE: WS2900 not supported
  it('ws2900_wh65 sensors are created', (done) => {
    testData = require('./data/ws2900_wh65.json');
    platform = createPlatform("synthetic");
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(1);
    expect(platform.baseStationInfo.sensors[0].type).to.equal("WH65");
    expect(platform.unconsumedReportData.length).to.equal(4); // 'tempinf', 'humidityin', 'baromrelin', 'baromabsin'
    done();
  });

  // NOTE: WS3800 not supported
  it('ws3800_ws85_ws80_wh65_wh57_wh55_wh51multi_wh45_wh41multi_wn35_wn34multi_wn31multi_wn30_wh26_wh25 sensors are created', (done) => {
    testData = require('./data/ws3800_ws85_ws80_wh65_wh57_wh55_wh51multi_wh45_wh41multi_wn35_wn34multi_wn31multi_wn30_wh26_wh25.json');
    platform = createPlatform("synthetic");
    platform.onDataReport(testData);
    expect(platform.baseStationInfo.sensors.length).to.equal(26);
    expect(platform.baseStationInfo.sensors[0].type).to.equal("WS85");
    expect(platform.baseStationInfo.sensors[1].type).to.equal("WS80");
    expect(platform.baseStationInfo.sensors[2].type).to.equal("WH65");
    expect(platform.baseStationInfo.sensors[3].type).to.equal("WH57");
    expect(platform.baseStationInfo.sensors[4].type).to.equal("WH55");
    expect(platform.baseStationInfo.sensors[5].type).to.equal("WH51");
    expect(platform.baseStationInfo.sensors[6].type).to.equal("WH51");
    expect(platform.baseStationInfo.sensors[7].type).to.equal("WH51");
    expect(platform.baseStationInfo.sensors[8].type).to.equal("WH51");
    expect(platform.baseStationInfo.sensors[9].type).to.equal("WH51");
    expect(platform.baseStationInfo.sensors[10].type).to.equal("WH51");
    expect(platform.baseStationInfo.sensors[11].type).to.equal("WH45");
    expect(platform.baseStationInfo.sensors[12].type).to.equal("WH41");
    expect(platform.baseStationInfo.sensors[13].type).to.equal("WH41");
    expect(platform.baseStationInfo.sensors[14].type).to.equal("WN35");
    expect(platform.baseStationInfo.sensors[15].type).to.equal("WN34");
    expect(platform.baseStationInfo.sensors[16].type).to.equal("WN34");
    expect(platform.baseStationInfo.sensors[17].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[18].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[19].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[20].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[21].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[22].type).to.equal("WN31");
    expect(platform.baseStationInfo.sensors[23].type).to.equal("WN30");
    expect(platform.baseStationInfo.sensors[24].type).to.equal("WH26");
    expect(platform.baseStationInfo.sensors[25].type).to.equal("WH25");
    expect(platform.unconsumedReportData.length).to.equal(1); // 'console_batt'
    done();
  });
});
