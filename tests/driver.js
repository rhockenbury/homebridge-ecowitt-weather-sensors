"use strict";

const hap = require("hap-nodejs");
const platform = require('./../dist/EcowittPlatform');
const platformConfig = require('./configs/config.json')

// mock api object
const api = {
  "hap": hap,
  "user": { "storagePath": function noop(){} },
  "on": function noop(){},
  "platformAccessory": hap.Accessory,
  "registerPlatformAccessories": function noop(){}
};

module.exports = function() {
  return new platform.EcowittPlatform(console, platformConfig, api);
}
