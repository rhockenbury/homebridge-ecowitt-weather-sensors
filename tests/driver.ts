import * as hap from 'hap-nodejs';
import * as winston from 'winston';
import { EcowittPlatform } from './../dist/EcowittPlatform';
import * as platformConfig from './configs/default.json';

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
export function createPlatform() {
  const logger = winston.createLogger({
    level: 'warn',
    format: winston.format.simple(),
    transports: [new winston.transports.Console()],
  });
  return new EcowittPlatform(logger, platformConfig, api);
}
