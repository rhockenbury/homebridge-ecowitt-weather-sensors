import * as hap from 'hap-nodejs';
import * as winston from 'winston';
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

// homebridge platform generator
export function createPlatform(configName) {
  const logger = winston.createLogger({
    level: 'warn',
    format: winston.format.simple(),
    transports: [new winston.transports.Console()],
  });
  const config = typeof configName === 'undefined' ? require('./configs/v2Default.json') : require(`./configs/${configName}.json`)
  return new EcowittPlatform(logger, config, api);
}
