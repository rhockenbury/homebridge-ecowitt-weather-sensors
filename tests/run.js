// require {
//   API,
//   DynamicPlatformPlugin,
//   Logger,
//   PlatformAccessory,
//   PlatformConfig,
//   Service,
//   Characteristic,
// } from 'homebridge';

//require { PLATFORM_NAME } from './../src/settings';
const homebridge = require('homebridge')
const platform = require('./../dist/EcowittPlatform');;


//EcowittPlatform

console.log(homebridge.APIEvent);

const engine = new platform.EcowittPlatform();

console.log(platform);


//Logger, PlatformConfig, API);
