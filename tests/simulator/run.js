const request = require('superagent');
const fs = require('fs');
const path = require('path')
//const definitions = require('./definitions');

// load the simulation track
let simTracks = {};
const trackFiles = fs.readdirSync('tests/synthetic/data/').filter(file => path.extname(file) === '.json');
trackFiles.forEach(file => {
  const fileData = fs.readFileSync(path.join('tests/synthetic/data/', file));
  simTracks[file.split('.')[0]] = JSON.parse(fileData.toString());
});

const simTrackName = process.argv[2] || '';
const simTrackCandidates = Object.keys(simTracks).filter(t => t.includes(simTrackName));

// select a sim track
let simTrack = {};
if (simTrackCandidates.length > 0) {
  const index = Math.floor(Math.random() * (simTrackCandidates.length + 1));
  simTrack = simTracks[simTrackCandidates[index]];
  console.log(`Selected Track ${simTrackCandidates[index]}`);
} else {
  console.log("No Track Candidates Found");
  process.exit();
}

// console.log(simTrackCandidates);

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
    await timer(interval*1000); // then the created Promise can be awaited
  }
}

runSim();
