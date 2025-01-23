const request = require('superagent');
const fs = require('fs');
const path = require('path')
const definitions = require('./definitions');

// load the simulation track
let simTracks = {};
const trackFiles = fs.readdirSync('tests/synthetic/data/').filter(file => path.extname(file) === '.json');
trackFiles.forEach(file => {
  const fileData = fs.readFileSync(path.join('tests/synthetic/data/', file));
  simTracks[file.split('.')[0]] = JSON.parse(fileData.toString());
});

const simTrackName = process.argv[2] || 'gw2000';
const simTrackCandidates = Object.keys(simTracks).filter(t => t.includes(simTrackName));

// select a sim track at random from candidates
let simTrack = {};
if (simTrackCandidates.length > 0) {
  const index = Math.floor(Math.random() * simTrackCandidates.length);
  simTrack = simTracks[simTrackCandidates[index]];
  console.log(`Selected Track ${simTrackCandidates[index]}`);
} else {
  console.log("No Track Candidates Found");
  process.exit();
}

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

    if (key.includes("batt")) { // skip updating battery fields
      continue;
    }

    let minimum = undefined;
    let maximum = undefined;
    let lowerIncrement = parseFloat(value) * 0.05;
    let upperIncrement = parseFloat(value) * 0.20;

    for (const [defKey, defValue] of Object.entries(definitions)) {
      if (key.includes(defKey)) {
        lowerIncrement = defValue.minIncrement;
        upperIncrement = defValue.maxIncrement;
        minimum = defValue.min;
        maximum = defValue.max;
        break;
      }
    }

    if (minimum === undefined || maximum === undefined) {
      console.log(`No definition for ${key}`);''
    }

    let change = Math.random() * (upperIncrement - lowerIncrement) + lowerIncrement;

    // decide if change should be increase or decrease
    if (Math.random() < 0.5) {
      change = change * -1.0;
    }

    let newValue = parseFloat(value) + change;

    // check bounds
    if (minimum !== undefined && newValue < minimum) {
      newValue = minimum;
    }

    if (maximum !== undefined && newValue > maximum) {
      newValue = maximum;
    }

    newValue = +newValue.toFixed(4);
    dataReport[key] = String(newValue);

    //console.log(`${key}: ${value} -> ${key}: ${newValue}`);
  }

  const dateUTC = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
  dataReport.dateutc = dateUTC;

  return dataReport;
}


const interval = 10; // how often to post data
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

    await timer(interval*1000);
  }
}

runSim();
