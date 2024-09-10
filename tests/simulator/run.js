const request = require('superagent');
//const definitions = require('./definitions');

// load the simulation track
const simTrackName = process.argv[2] || 'gw2000_ws85_wh51';
const simTrack = require(`../synthetic/data/${simTrackName}.json`);

const SKIP_FIELDS = ['PASSKEY', 'stationtype', 'dateutc', 'model', 'freq', 'runtime', 'heap', 'interval'];

// send the data to the plugin endpoint
function postData(dataReport) {
  request.post('http://localhost:8085/data/report')
    .send(dataReport)
    .then((response) => {
      console.log(response.text);
    })
    .catch((error) => {
      console.error(error);
    });
}

// modify data report values according to definitions
function modifyData(dataReport) {
  for (const [key, value] of Object.entries(dataReport)) {
    if (SKIP_FIELDS.includes(key)) {
      continue;
    }

    //console.log(`old ${value}`);

    // lower bound
    const lowerIncrement = parseFloat(value) * 0.05;
    const upperIncrement = parseFloat(value) * 0.20;

    const decrease = Math.random() < 0.5;

    let change = Math.random() * (upperIncrement - lowerIncrement) + lowerIncrement;

    if (decrease) {
      change = change * -1.0;
    }

    //console.log(`change ${change}`)

    let newValue = parseFloat(value) + change;
    newValue = +newValue.toFixed(2);

    //console.log(`new ${newValue}`);

    dataReport[key] = String(newValue);

    // if (definitions[key]) {
    //   // decide whether to increase or decrease
    //
    //   // decide the amount of change
    //
    //
    // } else {
    //   // definition not defined for key
    //
    //
    // }

    //console.log(`${key}: ${value}`);
  }

  const dateUTC = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
  dataReport.dateutc = dateUTC;

  return dataReport;
}


const interval = 5; // how often to post data
const iterations = 300; // number of times to post data

let dataReport = simTrack;

const timer = ms => new Promise(res => setTimeout(res, ms))

async function runSim() {
  for (let i = 1; i <= iterations; i++) {
    dataReport = modifyData(dataReport);
    dataReport.interval = String(interval);
    postData(dataReport);
    console.log(i);
    console.log(dataReport);
    await timer(interval*1000); // then the created Promise can be awaited
  }
}

runSim();
