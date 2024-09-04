import {
  API,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
  Characteristic,
} from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';

import { GW1000 } from './devices/GW1000';
import { GW2000 } from './devices/GW2000';
import { HP2560} from './devices/HP2560';
import { WH25 } from './devices/WH25';
import { WH31 } from './devices/WH31';
import { WH40 } from './devices/WH40';
//import { WH41 } from './devices/WH41';
import { WH51 } from './devices/WH51';
import { WH55 } from './devices/WH55';
//import { WH57 } from './devices/WH57';
//import { WH65 } from './devices/WH65';
import { WH34 } from './devices/WH34';
import { WS85 } from './devices/WS85';

import * as utils from './Utils';
import * as bodyParser from 'body-parser';
import * as crypto from 'crypto';

import express, { Express, Request, Response } from "express";

interface BaseStationInfo {
  model: string;
  deviceName: string;
  serialNumber: string;
  shortSerial: string;
  hardwareRevision: string;
  softwareRevision: string;
  firmwareRevision: string;
  frequency: string;
  PASSKEY: string;
  sensors: any[];
}

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class EcowittPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];

  public dataReportServer: express.Application;

  public lastDataReport = null;
  public consumedReportData: string[] = [];
  public requiredReportData: string[] = ["PASSKEY", "stationtype", "dateutc", "model", "freq"];

  public baseStationInfo: BaseStationInfo = {
    model: '',
    deviceName: '',
    serialNumber: '',
    shortSerial: '',
    hardwareRevision: '',
    softwareRevision: '',
    firmwareRevision: '',
    frequency: '',
    PASSKEY: '',
    sensors: [],
  };

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    let mac = this.config?.baseStation?.mac || this.config?.mac;

    if (typeof mac === 'undefined') {
      if (typeof this.config?.additional === 'undefined') {
        this.config.additional = {};
      }
      this.config.additional.validateMac = false;
      mac = '00:00:00:00:00:00'
      this.log.warn(`Disabling MAC validation because MAC address was not provided. Provide a valid MAC address to have MAC validation enabled`)
    }

    this.baseStationInfo.serialNumber = mac;
    this.baseStationInfo.shortSerial = mac.replaceAll(':','').slice(8);
    this.baseStationInfo.PASSKEY = crypto.createHash('md5').update(mac).digest('hex').toUpperCase()

    if (utils.v1ConfigTest(this.config)) {
      const v2Config = utils.v1ConfigRemapper(this.config, this.baseStationInfo.shortSerial);
      this.log.warn(`Plugin configuration currently has v1 properties and needs to be migrated to v2. A migrated v2-compatible version of your plugin configuration has been generated below, see ${utils.MIGRATION_GUIDE_LINK} for the migration guide \n ${JSON.stringify(v2Config, undefined, 2)}`);
      this.config = v2Config;
      this.log.debug(`Plugin config has been auto-migrated to v2 \n ${JSON.stringify(this.config, undefined, 2)}`);
    } else {
      this.log.debug(`Plugin config \n ${JSON.stringify(this.config, undefined, 2)}`);
    }

    let encodedPath = encodeURI(this.config?.baseStation?.path || '/data/report');
    let port = this.config?.baseStation?.port || 8080;

    this.log.debug(`Creating data report service on ${port} ${encodedPath}`);

    this.dataReportServer = express()
    this.dataReportServer.use(bodyParser.json());

    this.dataReportServer.post(encodedPath, (req, res, next) => {
      this.log.debug(`Received request for ${req.method} ${req.path} from ${req.socket.remoteAddress}`);
      this.onDataReport(req.body);
      res.send();
    });

    this.dataReportServer.all('*', (req, res, next) => {
      if (utils.falsy(this.config?.additional?.acceptAnyPath)) {
        this.log.warn(`Received request for ${req.method} ${req.path} from ${req.socket.remoteAddress}. Configure the Ecowitt base station to send data reports to POST ${encodedPath}`);
      } else {
        this.log.debug(`Received request for ${req.method} ${req.path} from ${req.socket.remoteAddress}`);
        this.onDataReport(req.body);
      }
      res.send();
    });

    this.dataReportServer.use((err, req, res, next) => {
      this.log.warn(`An issue occured while processing a data report. Review the error message below and file a bug report at ${utils.BUG_REPORT_LINK} \n ${err.stack}`);
      res.status(500).send('Error processing data report')
    });

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.
    this.api.on('didFinishLaunching', () => {
      this.dataReportServer.listen(port, () => {
          this.log.info(`Listening for data reports on ${port} ${encodedPath}`);
          this.log.debug(`Finished initializing plugin`);
      }).on("error", (err: any) => {
        if (err instanceof Error) {
          if (err["code"] === 'EADDRINUSE') {
            this.log.error(`Unable to start data report service on ${port} ${encodedPath} because port ${port} is in use. Try setting the port to ${port + 1} and restart Homebridge`);
          } else {
            this.log.error(`Unable to start data report service on ${port} ${encodedPath}. Verify plugin configuration with docs at ${utils.GATEWAY_SETUP_LINK}, update plugin configuration, and restart homebridge \n ${err.stack}`);
          }
        }
      });
    });
  }

  //----------------------------------------------------------------------------

  public serviceUuid(name: string) {
    return this.api.hap.uuid.generate(name);
  }

  //----------------------------------------------------------------------------

  public serviceId(name: string, channel: number | undefined) {
    const serviceId = this.baseStationInfo.shortSerial;
    if (typeof channel !== 'undefined') {
       return `${serviceId}:${name}CH${channel}`;
    } else {
       return `${serviceId}:${name}`;
    }
  }

  //----------------------------------------------------------------------------

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */

  configureAccessory(accessory: PlatformAccessory) {
    this.log.debug(`Loading accessory from cache ${accessory.displayName}`);

    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.accessories.push(accessory);
  }

  //----------------------------------------------------------------------------

  public onDataReport(dataReport) {
    if (typeof dataReport !== 'object') {
      this.log.warn(`Received empty data report. Verify configuration with docs at ${utils.GATEWAY_SETUP_LINK}`);
      return;
    }

    if (!utils.includesAll(Object.keys(dataReport), this.requiredReportData)) {
      this.log.warn(`Received incomplete data report. Missing one of ${this.requiredReportData}. Verify plugin configuration with docs at ${utils.GATEWAY_SETUP_LINK}`);
      return;
    }

    if (dataReport.PASSKEY !== this.baseStationInfo.PASSKEY) {
      if (utils.truthy(this.config?.additional?.validateMac)) {
        this.log.warn(`Ignoring data report from unknown MAC address. Verify MAC address is set properly, or disable MAC validation in advanced settings`)
        return;
      } else {
        this.log.debug(`Processing data report from unknown MAC address. MAC validation is disabled`);
      }
    }

    this.log.debug(`Recieved data report, if you are submitting a bug report copy and paste the full data report object \n ${JSON.stringify(dataReport, undefined, 2)}`);

    if (!this.lastDataReport) { // on first data report after startup
      this.log.info('Registering accessories from data report');
      this.lastDataReport = dataReport;
      this.registerAccessories(dataReport);
    } else {
      this.lastDataReport = dataReport;
    }

    this.updateAccessories(dataReport);
  }

  //----------------------------------------------------------------------------

  addSensorType(add: boolean, type: string, channel: number | undefined = undefined) {
    if (add) {
      this.baseStationInfo.sensors.push({
        type: type,
        channel: channel,
      });

      if (typeof channel !== 'undefined') {
        this.log.debug(`Adding ${type} channel ${channel}`);
      } else {
        this.log.debug(`Adding ${type}`);
      }
    }
  }

  //----------------------------------------------------------------------------

  registerAccessories(dataReport) {
    const stationTypeInfo = dataReport?.stationtype.match(
      /(EasyWeather|GW[12][012]00(?:[ABC]?))_?(.*)/,
    );
    const modelInfo = dataReport?.model.match(
      /(HP[23]5[056][014]|GW[12][012]00)[ABC]?_?(.*)/,
    );

    this.baseStationInfo.model = dataReport.model;
    this.baseStationInfo.frequency = dataReport.freq;

    const hideConfig = this.config?.hidden || {};
    const hidden = Object.keys(hideConfig).filter(k => !!hideConfig[k]);

    if (Array.isArray(modelInfo)) {
      this.baseStationInfo.deviceName = `${this.baseStationInfo.shortSerial}:${modelInfo[1]}`

      switch (modelInfo[1]) {
        case 'GW1000':
        case 'GW1100':
        case 'GW1200':
        case 'GW2000':
          this.baseStationInfo.hardwareRevision = stationTypeInfo[0];
          this.baseStationInfo.firmwareRevision = stationTypeInfo[2];
          if (!utils.includesAll(hidden, [`${this.baseStationInfo.deviceName}`])) {
            this.addSensorType(true, modelInfo[1]);
          }
          break;

        case 'HP2560':
        case 'HP2561':
        case 'HP2564':
          this.baseStationInfo.softwareRevision = dataReport.stationtype;
          this.baseStationInfo.firmwareRevision = modelInfo[2];
          if (!utils.includesAll(hidden, [`${this.baseStationInfo.deviceName}`])) {
            this.addSensorType(true, modelInfo[1]);
          }
          break;

        case 'HP2550':
        case 'HP2551':
        case 'HP3500':
          this.baseStationInfo.softwareRevision = dataReport.stationtype;
          this.baseStationInfo.firmwareRevision = modelInfo[2];
          break;

        default:
          this.log.warn(`Base station was not detected. Please file a feature request for additional Ecowitt devices at ${utils.FEATURE_REQ_LINK}`);
      }
    } else {
       this.log.warn(`There may have been an issue with detecting the base station device from the data report. Please file a bug report at ${utils.BUG_REPORT_LINK} if base station was not detected`)
    }

    // if (!utils.includesAll(hidden, [`${this.baseStationInfo.shortSerial}:WH65`])) {
    //   this.addSensorType(dataReport.wh65batt !== undefined, 'WH65');
    // }

    if (!utils.includesAll(hidden, [`${this.baseStationInfo.shortSerial}:WS85`])) {
      // NOTE: Typo in WS-85 as it responds with wh85batt instead of expected ws85batt.
      this.addSensorType(
        dataReport.wh85batt !== undefined || dataReport.ws85batt !== undefined,
        'WS85',
      );
    }

    if (!utils.includesAll(hidden, [`${this.baseStationInfo.shortSerial}:WH25`])) {
      this.addSensorType(dataReport.wh25batt !== undefined, 'WH25');
    }

    if (!utils.includesAll(hidden, [`${this.baseStationInfo.shortSerial}:WH31`])) {
      for (let channel = 1; channel <= 8; channel++) {
        if (!utils.includesAll(hidden, [`${this.baseStationInfo.shortSerial}:WH31CH${channel}`])) {
          this.addSensorType(
            dataReport[`batt${channel}`] !== undefined,
            'WH31',
            channel,
          );
        }
      }
    }

    if (!utils.includesAll(hidden, [`${this.baseStationInfo.shortSerial}:WH40`])) {
      this.addSensorType(dataReport.wh40batt !== undefined, 'WH40');
    }

    // if (!utils.includesAll(hidden, [`${this.baseStationInfo.shortSerial}:WH41`])) {
    //   for (let channel = 1; channel <= 4; channel++) {
    //     if (!utils.includesAll(hidden, [`${this.baseStationInfo.shortSerial}:WH41CH${channel}`])) {
    //       this.addSensorType(
    //         dataReport[`pm25batt${channel}`] !== undefined,
    //         'WH41',
    //         channel,
    //       );
    //     }
    //   }
    // }

    if (!utils.includesAll(hidden, [`${this.baseStationInfo.shortSerial}:WH51`])) {
      for (let channel = 1; channel <= 8; channel++) {
        if (!utils.includesAll(hidden, [`${this.baseStationInfo.shortSerial}:WH51CH${channel}`])) {
          this.addSensorType(
            dataReport[`soilbatt${channel}`] !== undefined,
            'WH51',
            channel,
          );
        }
      }
    }

    if (!utils.includesAll(hidden, [`${this.baseStationInfo.shortSerial}:WH55`])) {
      for (let channel = 1; channel <= 4; channel++) {
        if (!utils.includesAll(hidden, [`${this.baseStationInfo.shortSerial}:WH55CH${channel}`])) {
          this.addSensorType(
            dataReport[`leakbatt${channel}`] !== undefined,
            'WH55',
            channel,
          );
        }
      }
    }

    // if (!utils.includesAll(hidden, [`${this.baseStationInfo.shortSerial}:WH57`])) {
    //   this.addSensorType(dataReport.wh57batt !== undefined, 'WH57');
    // }

    if (!utils.includesAll(hidden, [`${this.baseStationInfo.shortSerial}:WH34`])) {
      for (let channel = 1; channel <= 8; channel++) {
        if (!utils.includesAll(hidden, [`${this.baseStationInfo.shortSerial}:WH34CH${channel}`])) {
          this.addSensorType(
            dataReport[`tf_batt${channel}`] !== undefined,
            'WH34',
            channel,
          );
        }
      }
    }

    if (this.baseStationInfo.sensors.length === 0) {
      this.log.warn(`No devices discovered from data report. Verify plugin configuration with docs at ${utils.GATEWAY_SETUP_LINK}, and/or file a feature request for additional Ecowitt devices at ${utils.FEATURE_REQ_LINK}`);
      return;
    }

    this.log.debug(`StationInfo: ${JSON.stringify(this.baseStationInfo, undefined, 2)}`);

    for (const sensor of this.baseStationInfo.sensors) {
      const accessoryId = this.serviceId(sensor.type, sensor.channel);
      const accessoryUuid = this.serviceUuid(accessoryId);

      this.log.debug(`sensorId: ${accessoryId}, sensorUuid: ${accessoryUuid}`);

      const existingAccessory = this.accessories.find(acc => acc.UUID === accessoryUuid);

      if (existingAccessory) {
        // the accessory already exists
        this.log.info(`Restoring existing accessory from cache ${existingAccessory.displayName}`);
        this.createAccessory(sensor, existingAccessory);
      } else {
        // create a new sensor accessory
        const accessory = new this.api.platformAccessory(sensor.type, accessoryUuid);
        this.createAccessory(sensor, accessory);

        if (typeof sensor.channel !== 'undefined') {
          this.log.info(`Adding new accessory type: ${sensor.type} channel: ${sensor.channel}`);
        } else {
          this.log.info(`Adding new accessory type: ${sensor.type}`);
        }

        // link the sensor accessory to the platform
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
          accessory,
        ]);
      }
    }

    // determine which data from the data report were not used with any detected sensors
    let unconsumed = Object.keys(dataReport).filter(x => !this.consumedReportData.includes(x));
    unconsumed = unconsumed .filter(x => !this.requiredReportData.includes(x));

    if (unconsumed.length > 0 ) {
      this.log.debug(`Unused data from data report ${unconsumed}`)
    }

  }

  createAccessory(sensor, accessory) {
    switch (sensor.type) {
      case 'GW1000':
      case 'GW1100':
      case 'GW1200':
        sensor.accessory = new GW1000(this, accessory, sensor.type);
        this.consumedReportData.push(...sensor.accessory.requiredData);
        break;

      case 'GW2000':
        sensor.accessory = new GW2000(this, accessory, sensor.type);
        this.consumedReportData.push(...sensor.accessory.requiredData);
        break;

      case 'HP2560':
      case 'HP2561':
      case 'HP2564':
        sensor.accessory = new HP2560(this, accessory, sensor.type);
        this.consumedReportData.push(...sensor.accessory.requiredData);
        break;

      case 'WH25':
        sensor.accessory = new WH25(this, accessory);
        this.consumedReportData.push(...sensor.accessory.requiredData);
        break;

      case 'WH31':
        sensor.accessory = new WH31(this, accessory, sensor.channel);
        this.consumedReportData.push(...sensor.accessory.requiredData);
        break;

      case 'WH40':
        sensor.accessory = new WH40(this, accessory);
        this.consumedReportData.push(...sensor.accessory.requiredData);
        break;

      // case 'WH41':
      //   sensor.accessory = new WH41(this, accessory, sensor.channel);
      //     this.consumedReportData.push(...sensor.accessory.requiredData);
      //   break;

      case 'WH51':
        sensor.accessory = new WH51(this, accessory, sensor.channel);
        this.consumedReportData.push(...sensor.accessory.requiredData);
        break;

      case 'WH55':
        sensor.accessory = new WH55(this, accessory, sensor.channel);
        this.consumedReportData.push(...sensor.accessory.requiredData);
        break;

      // case 'WH57':
      //   sensor.accessory = new WH57(this, accessory);
      //   break;

      // case 'WH65':
      //   sensor.accessory = new WH65(this, accessory);
      //   break;

      case 'WH34':
        sensor.accessory = new WH34(this, accessory, sensor.channel);
        this.consumedReportData.push(...sensor.accessory.requiredData);
        break;

      case 'WS85':
        sensor.accessory = new WS85(this, accessory);
        this.consumedReportData.push(...sensor.accessory.requiredData);
        break;

      default:
        this.log.error(`Unsupported device type for ${sensor.type}. Please file a feature request for additional Ecowitt devices at ${utils.FEATURE_REQ_LINK}`);
        break;
    }
  }

  //----------------------------------------------------------------------------

  updateAccessories(dataReport) {
    const dataDate = new Date(dataReport.dateutc);
    const dateDiff = Math.abs(new Date().getTime() - dataDate.getTime());

    let threshold = dataReport?.interval || 30;
    threshold = parseInt(threshold) * 4;

    if (dateDiff >= threshold * 1000) {
      if (utils.truthy(this.config.additional?.validateTimestamp)) {
        this.log.error(`Received data report for ${dataReport.dateutc} UTC which appears to be old, discarding data report. To process old data reports, disable timestamp validation in advanced settings`);
        return;
      } else {
        this.log.info(`Received data report for ${dataReport.dateutc} UTC which appears to be old, this could indicate an issue if it occurs frequently`);
      }
    } else {
      this.log.debug(`Received new data report for ${dataReport.dateutc} UTC`);
    }

    for (const sensor of this.baseStationInfo.sensors) {
      if (typeof sensor.channel !== 'undefined') {
        this.log.debug(`Updating sensor: ${sensor.type} channel: ${sensor.channel}`);
      } else {
        this.log.debug(`Updating sensor: ${sensor.type}`);
      }

      try {
        sensor.accessory.update(dataReport);
      } catch(err) {
        let stack: string | undefined = undefined;
        if (err instanceof Error) {
          stack = err.stack;
        } else {
          stack = String(err);
        }

        this.log.warn(`An issue occured while updating sensor values for ${sensor.type}. Review the error message below and file a bug report if needed at ${utils.BUG_REPORT_LINK} \n ${stack}`);
      }
    }
  }

  //----------------------------------------------------------------------------
}
