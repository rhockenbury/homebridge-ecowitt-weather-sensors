import * as hap from 'hap-nodejs';
import * as winston from 'winston';
import Transport from 'winston-transport';
import { EcowittPlatform } from './../src/EcowittPlatform';

//------------------------------------------------------------------------------

// mock api object
export const api = {
  "hap": hap,
  "user": { "storagePath": function noop(){} },
  "on": function noop(){},
  "platformAccessory": hap.Accessory,
  "registerPlatformAccessories": function noop(){}
};

// custom logger for log introspection
class LocalTransport extends Transport {
  public logs: String

  constructor(opts) {
    super(opts);
    this.logs = [];
  }

  log(info, callback) {
    this.logs.push(info);
    callback();
  }
};

// homebridge platform generator
export function createPlatform(configName) {
  const logger = winston.createLogger({
    level: 'warn',
    format: winston.format.simple(),
    transports: [new winston.transports.Console(), new LocalTransport()],
  });

  const config = typeof configName === 'undefined' ? require('./configs/v2Default.json') : require(`./configs/${configName}.json`)
  return new EcowittPlatform(logger, config, api);
}
