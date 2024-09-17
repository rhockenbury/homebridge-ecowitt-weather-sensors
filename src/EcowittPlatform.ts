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
import { WH26 } from './devices/WH26';
import { WN30 } from './devices/WN30';
import { WN31 } from './devices/WN31';
import { WN34 } from './devices/WN34';
import { WN35 } from './devices/WN35';
import { WH40 } from './devices/WH40';
import { WH41 } from './devices/WH41';
import { WH45 } from './devices/WH45';
import { WH46 } from './devices/WH46';
import { WH51 } from './devices/WH51';
import { WH55 } from './devices/WH55';
import { WH57 } from './devices/WH57';
import { WH65 } from './devices/WH65';
import { WS68 } from './devices/WS68';
import { WS80 } from './devices/WS80';
import { WS85 } from './devices/WS85';
import { WS90 } from './devices/WS90';


import * as utils from './Utils';
import * as bodyParser from 'body-parser';
import * as crypto from 'crypto';

import { EcowittAccessory } from './EcowittAccessory';

import express, { Request, Response, Next } from 'express';

interface SensorType {
  type: string;
  channel: number | undefined;
  accessory: EcowittAccessory | undefined;
  id: string | undefined;
  uuid: string | undefined;
}

interface BaseStationInfoType {
  model: string;
  deviceName: string;
  serialNumber: string;
  shortSerial: string;
  hardwareRevision: string;
  softwareRevision: string;
  firmwareRevision: string;
  frequency: string;
  PASSKEY: string;
  sensors: SensorType[];
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
  public registeredProperties: string[] = [];
  public consumedReportData: string[] = [];
  public unconsumedReportData: string[] = [];
  public requiredReportData: string[] = ['PASSKEY', 'stationtype', 'dateutc', 'model', 'freq'];
  public ignoreableReportData: string[] = ['runtime', 'heap', 'interval'];

  public baseStationInfo: BaseStationInfoType = {
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
      mac = '00:00:00:00:00:00';
      this.log.warn('Disabling MAC validation because MAC address was not provided. '
        + 'Provide a valid MAC address to have MAC validation enabled');
    }

    this.baseStationInfo.serialNumber = mac;
    this.baseStationInfo.shortSerial = mac.replaceAll(':', '').slice(8);
    this.baseStationInfo.PASSKEY = crypto.createHash('md5').update(mac).digest('hex').toUpperCase();

    if (utils.v1ConfigTest(this.config)) {
      const v2Config = utils.v1ConfigRemapper(this.config);
      this.log.warn('Plugin configuration currently has v1 properties and needs to be migrated to v2. '
        + 'A migrated v2-compatible version of your plugin configuration has been generated below, '
        + `see ${utils.MIGRATION_GUIDE_LINK} for the migration guide \n ${JSON.stringify(v2Config, undefined, 2)}`);
      this.config = v2Config;
      this.log.debug(`Plugin config has been auto-migrated to v2 \n ${JSON.stringify(this.config, undefined, 2)}`);
    } else {
      this.log.debug(`Plugin config \n ${JSON.stringify(this.config, undefined, 2)}`);
    }

    const encodedPath = encodeURI(this.config?.baseStation?.path || '/data/report');
    const port = this.config?.baseStation?.port || 8080;

    this.log.debug(`Creating data report service on ${port} ${encodedPath}`);

    this.dataReportServer = express();
    this.dataReportServer.use(bodyParser.json());
    this.dataReportServer.use(bodyParser.urlencoded({ extended: true }));

    this.dataReportServer.post(encodedPath, (req: Request, res: Response, next: Next) => {
      this.log.debug(`Received request for ${req.method} ${req.path} from ${req.socket.remoteAddress}`);
      try {
        this.onDataReport(req.body);
      } catch (err) {
        next(err);
      }
      res.send();
    });

    this.dataReportServer.all('*', (req: Request, res: Response, next: Next) => {
      if (utils.falsy(this.config?.additional?.acceptAnyPath)) {
        this.log.warn(`Received request for ${req.method} ${req.path} from ${req.socket.remoteAddress}. `
          + `Configure the Ecowitt base station to send data reports to POST ${encodedPath}`);
      } else {
        this.log.debug(`Received request for ${req.method} ${req.path} from ${req.socket.remoteAddress}`);
        try {
          this.onDataReport(req.body);
        } catch (err) {
          next(err);
        }
      }
      res.send();
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.dataReportServer.use((err, req: Request, res: Response, next: Next) => {
      this.log.warn('An issue occured while processing a data report. '
        + `Review the error message below and file a bug report at ${utils.BUG_REPORT_LINK} \n ${err.stack}`);
      res.status(500).send('Error processing data report');
    });

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.
    this.api.on('didFinishLaunching', () => {
      this.dataReportServer.listen(port, () => {
        this.log.info(`Listening for data reports on ${port} ${encodedPath}`);
        this.log.debug('Finished initializing plugin');
      }).on('error', (err) => {
        if (err instanceof Error) {
          if (err['code'] === 'EADDRINUSE') {
            this.log.error(`Unable to start data report service on ${port} ${encodedPath} because port ${port} is in use. `
              + `Try setting the port to ${port + 1} and restart Homebridge`);
          } else {
            this.log.error(`Unable to start data report service on ${port} ${encodedPath}. `
              + `Verify plugin configuration with docs at ${utils.GATEWAY_SETUP_LINK}, update plugin configuration, `
              + `and restart homebridge \n ${err.stack}`);
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

  public shortServiceId(name: string, channel: number | undefined) {
    if (typeof channel !== 'undefined') {
      return `${name}CH${channel}`;
    } else {
      return `${name}`;
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

    if (Object.keys(dataReport).length === 0) {
      this.log.warn(`Received empty data report. Verify configuration with docs at ${utils.GATEWAY_SETUP_LINK}`);
      return;
    }

    this.log.debug('Recieved data report, if you are submitting a bug report copy and paste the full data '
      + `report object \n ${JSON.stringify(dataReport, undefined, 2)}`);

    if (!utils.includesAll(Object.keys(dataReport), this.requiredReportData)) {
      this.log.warn(`Received incomplete data report. Missing one of ${this.requiredReportData}. `
        + `Verify plugin configuration with docs at ${utils.GATEWAY_SETUP_LINK}`);
      return;
    }

    if (dataReport.PASSKEY !== this.baseStationInfo.PASSKEY) {
      if (utils.truthy(this.config?.additional?.validateMac)) {
        this.log.warn('Ignoring data report from unknown MAC address. Verify MAC address is set properly, ' +
          'or disable MAC validation in advanced settings');
        return;
      } else {
        this.log.debug('Processing data report from unknown MAC address. MAC validation is disabled');
      }
    }

    if (!this.lastDataReport) { // on first data report after startup
      this.log.info('Registering accessories from data report');
      this.lastDataReport = dataReport;
      this.registeredProperties = Object.keys(dataReport);
      this.registerAccessories(dataReport);
    } else {
      const intersection = this.registeredProperties.filter(x => Object.keys(dataReport).includes(x));
      if (intersection.length !== this.registeredProperties.length) {
        this.log.warn('The weather data properties from the current data report are different ' +
          'from the properties of the data report used to register your accessories. Try restarting ' +
          'Homebridge so that the plugin re-registers devices from the data report');
      }
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
        accessory: undefined,
        id: undefined,
        uuid: undefined,
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

    if (Array.isArray(modelInfo) && modelInfo.length === 3) {
      this.baseStationInfo.deviceName = modelInfo[1];

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
          this.log.warn('Base station was not detected from data report. Please file a feature request to add support for '
            + `device ${modelInfo[1]} at ${utils.FEATURE_REQ_LINK}`);
      }
    } else {
      this.log.warn(`Base station was not detected from the data report. Please file a bug report at ${utils.BUG_REPORT_LINK}`);
    }

    if (!utils.includesAny(hidden, ['WS90']) && !utils.includesAll(hidden, WS90.properties)) {
      this.addSensorType(dataReport.wh90batt !== undefined, 'WS90');
    }

    if (!utils.includesAny(hidden, ['WS85']) && !utils.includesAll(hidden, WS85.properties)) {
      this.addSensorType(dataReport.wh85batt !== undefined, 'WS85');
    }

    if (!utils.includesAny(hidden, ['WS80']) && !utils.includesAll(hidden, WS80.properties)) {
      this.addSensorType(dataReport.wh80batt !== undefined, 'WS80');
    }

    if (!utils.includesAny(hidden, ['WS68']) && !utils.includesAll(hidden, WS68.properties)) {
      this.addSensorType(dataReport.wh68batt !== undefined, 'WS68');
    }

    if (!utils.includesAny(hidden, ['WH65']) && !utils.includesAll(hidden, WH65.properties)) {
      this.addSensorType(dataReport.wh65batt !== undefined, 'WH65');
    }

    if (!utils.includesAny(hidden, ['WH57']) && !utils.includesAll(hidden, WH57.properties)) {
      this.addSensorType(dataReport.wh57batt !== undefined, 'WH57');
    }

    if (!utils.includesAny(hidden, ['WH55']) && !utils.includesAll(hidden, WH55.properties)) {
      for (let channel = 1; channel <= 4; channel++) {
        if (!utils.includesAny(hidden, [`WH55CH${channel}`])) {
          this.addSensorType(
            dataReport[`leakbatt${channel}`] !== undefined,
            'WH55',
            channel,
          );
        }
      }
    }

    if (!utils.includesAny(hidden, ['WH51']) && !utils.includesAll(hidden, WH51.properties)) {
      for (let channel = 1; channel <= 8; channel++) {
        if (!utils.includesAny(hidden, [`WH51CH${channel}`])) {
          this.addSensorType(
            dataReport[`soilbatt${channel}`] !== undefined,
            'WH51',
            channel,
          );
        }
      }
    }

    // WH45 and WH46 are the same sensor type, except WH45 does not have PM1.0 and PM4.0
    if (!utils.includesAny(hidden, ['WH46']) && !utils.includesAll(hidden, WH46.properties)) {
      this.addSensorType(dataReport.co2_batt !== undefined && dataReport.pm1_co2 !== undefined, 'WH46');
    }

    if (!utils.includesAny(hidden, ['WH45']) && !utils.includesAll(hidden, WH45.properties)) {
      this.addSensorType(dataReport.co2_batt !== undefined && dataReport.pm1_co2 === undefined, 'WH45');
    }

    if (!utils.includesAny(hidden, ['WH41']) && !utils.includesAll(hidden, WH41.properties)) {
      for (let channel = 1; channel <= 4; channel++) {
        if (!utils.includesAny(hidden, [`WH41CH${channel}`])) {
          this.addSensorType(
            dataReport[`pm25batt${channel}`] !== undefined,
            'WH41',
            channel,
          );
        }
      }
    }

    if (!utils.includesAny(hidden, ['WH40']) && !utils.includesAll(hidden, WH40.properties)) {
      this.addSensorType(dataReport.wh40batt !== undefined, 'WH40');
    }

    if (!utils.includesAny(hidden, ['WN35']) && !utils.includesAll(hidden, WN35.properties)) {
      for (let channel = 1; channel <= 8; channel++) {
        if (!utils.includesAny(hidden, [`WN35CH${channel}`])) {
          this.addSensorType(
            dataReport[`leaf_batt${channel}`] !== undefined,
            'WN35',
            channel,
          );
        }
      }
    }

    if (!utils.includesAny(hidden, ['WN34']) && !utils.includesAll(hidden, WN34.properties)) {
      for (let channel = 1; channel <= 8; channel++) {
        if (!utils.includesAny(hidden, [`WN34CH${channel}`])) {
          this.addSensorType(
            dataReport[`tf_batt${channel}`] !== undefined,
            'WN34',
            channel,
          );
        }
      }
    }

    // WN31 and WN30 are the same sensor type, except WN30 does not have humidity
    if (!utils.includesAny(hidden, ['WN31']) && !utils.includesAll(hidden, WN31.properties)) {
      for (let channel = 1; channel <= 8; channel++) {
        if (!utils.includesAny(hidden, [`WN31CH${channel}`])) {
          this.addSensorType(
            dataReport[`batt${channel}`] !== undefined && dataReport[`humidity${channel}`] !== undefined,
            'WN31',
            channel,
          );
        }
      }
    }

    if (!utils.includesAny(hidden, ['WN30']) && !utils.includesAll(hidden, WN30.properties)) {
      for (let channel = 1; channel <= 8; channel++) {
        if (!utils.includesAny(hidden, [`WN30CH${channel}`])) {
          this.addSensorType(
            dataReport[`batt${channel}`] !== undefined && dataReport[`humidity${channel}`] === undefined,
            'WN30',
            channel,
          );
        }
      }
    }

    if (!utils.includesAny(hidden, ['WH26']) && !utils.includesAll(hidden, WH26.properties)) {
      this.addSensorType(dataReport.wh26batt !== undefined, 'WH26');
    }

    if (!utils.includesAny(hidden, ['WH25']) && !utils.includesAll(hidden, WH25.properties)) {
      this.addSensorType(dataReport.wh25batt !== undefined, 'WH25');
    }

    if (this.baseStationInfo.sensors.length === 0) {
      this.log.warn('No devices discovered from data report. Verify plugin configuration with docs '
        + `at ${utils.GATEWAY_SETUP_LINK}, and/or file a feature request to support your Ecowitt devices at ${utils.FEATURE_REQ_LINK}`);
      return;
    }

    this.log.debug(`StationInfo: ${JSON.stringify(this.baseStationInfo, undefined, 2)}`);

    for (const sensor of this.baseStationInfo.sensors) {
      const accessoryId = this.serviceId(sensor.type, sensor.channel);
      const accessoryUuid = this.serviceUuid(accessoryId);

      sensor.id = accessoryId;
      sensor.uuid = accessoryUuid;

      const existingAccessory = this.accessories.find(acc => acc.UUID === accessoryUuid);

      if (existingAccessory) {
        // the accessory already exists
        this.log.info(`Restoring existing accessory from cache - type: ${existingAccessory.displayName}, uuid: ${existingAccessory.UUID}`);
        this.createAccessory(sensor, existingAccessory);
      } else {
        // create a new sensor accessory
        const accessory = new this.api.platformAccessory(sensor.type, accessoryUuid);
        this.createAccessory(sensor, accessory);

        if (typeof sensor.channel !== 'undefined') {
          this.log.info(`Adding new accessory - type: ${sensor.type}, channel: ${sensor.channel}, uuid: ${sensor.uuid}`);
        } else {
          this.log.info(`Adding new accessory - type: ${sensor.type}, uuid: ${sensor.uuid}`);
        }

        // link the sensor accessory to the platform
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
          accessory,
        ]);
      }

      if (typeof sensor.accessory !== 'undefined' && sensor.accessory.unusedData.length > 0) {
        this.log.info(`Note that accessory ${sensor.type} does not currently display the following ` +
          `data: ${sensor.accessory.unusedData}`);
      }

      if (typeof sensor.accessory !== 'undefined') {
        this.consumedReportData.push(...sensor.accessory.requiredData);
        this.consumedReportData.push(...sensor.accessory.optionalData);
        this.consumedReportData.push(...sensor.accessory.unusedData);
      }
    }

    // remove any accessory that was previously cached but is no longer present in data report
    const sensorUuids = this.baseStationInfo.sensors.map(s => s.uuid);
    const accessoryUuids = this.accessories.map(acc => acc.UUID);

    const accessoriesToRemove = accessoryUuids.filter(x => !sensorUuids.includes(x));
    for (const accessoryUuid of accessoriesToRemove) {
      const accessory = this.accessories.find(acc => acc.UUID === accessoryUuid);
      if (typeof accessory === 'undefined') {
        continue;
      }

      if (utils.truthy(this.config.additional?.removeStaleDevices)) {
        this.api.unregisterPlatformAccessories(
          PLUGIN_NAME,
          PLATFORM_NAME,
          [accessory],
        );
        this.log.info(`Removing existing accessory from cache - type: ${accessory.displayName}, uuid: ${accessory.UUID}`);
      } else {
        this.log.warn(`Existing accessory was detected as stale but was not removed - type: ${accessory.displayName}, ` +
          `uuid: ${accessory.UUID}. Remove manually through Homebridge, or enable Stale Device Removal in ` +
          'advanced settings to auto-remove');
      }
    }

    // determine which data from the data report were not used with any detected sensors
    let unconsumed = Object.keys(dataReport).filter(x => !this.consumedReportData.includes(x));
    unconsumed = unconsumed.filter(x => !this.requiredReportData.includes(x));
    unconsumed = unconsumed.filter(x => !this.ignoreableReportData.includes(x));
    this.unconsumedReportData = unconsumed;

    if (unconsumed.length > 0 && Object.keys(this.config?.hidden || {}).length === 0) {
      this.log.info(`There was unused data from data report ${unconsumed}. This indicates that a sensor may not ` +
        'have been successfully discovered. Try restarting Homebridge so that the plugin re-registers ' +
        'devices from the data report');
    } else {
      this.log.debug('All data from data report was consummable');
    }

    // validate data report interval
    if (typeof dataReport?.interval !== 'undefined') {
      if (parseInt(dataReport.interval) < 10) {
        this.log.warn('The lowest recommended data report interval is 10s, please reconfigure your Ecowitt base ' +
          'station to publish data reports no more than once every 10 seconds');
      }
    }
  }

  createAccessory(sensor, accessory) {
    switch (sensor.type) {
      case 'GW1000':
      case 'GW1100':
      case 'GW1200':
        sensor.accessory = new GW1000(this, accessory, sensor.type);
        break;

      case 'GW2000':
        sensor.accessory = new GW2000(this, accessory, sensor.type);
        break;

      case 'HP2560':
      case 'HP2561':
      case 'HP2564':
        sensor.accessory = new HP2560(this, accessory, sensor.type);
        break;

      case 'WH25':
        sensor.accessory = new WH25(this, accessory);
        break;

      case 'WH26':
        sensor.accessory = new WH26(this, accessory);
        break;

      case 'WN30':
        sensor.accessory = new WN30(this, accessory, sensor.channel);
        break;

      case 'WN31':
        sensor.accessory = new WN31(this, accessory, sensor.channel);
        break;

      case 'WN34':
        sensor.accessory = new WN34(this, accessory, sensor.channel);
        break;

      case 'WN35':
        sensor.accessory = new WN35(this, accessory, sensor.channel);
        break;

      case 'WH40':
        sensor.accessory = new WH40(this, accessory);
        break;

      case 'WH41':
        sensor.accessory = new WH41(this, accessory, sensor.channel);
        break;

      case 'WH45':
        sensor.accessory = new WH45(this, accessory);
        break;

      case 'WH46':
        sensor.accessory = new WH46(this, accessory);
        break;

      case 'WH51':
        sensor.accessory = new WH51(this, accessory, sensor.channel);
        break;

      case 'WH55':
        sensor.accessory = new WH55(this, accessory, sensor.channel);
        break;

      case 'WH57':
        sensor.accessory = new WH57(this, accessory);
        break;

      case 'WH65':
        sensor.accessory = new WH65(this, accessory);
        break;

      case 'WS68':
        sensor.accessory = new WS68(this, accessory);
        break;

      case 'WS80':
        sensor.accessory = new WS80(this, accessory);
        break;

      case 'WS85':
        sensor.accessory = new WS85(this, accessory);
        break;

      case 'WS90':
        sensor.accessory = new WS90(this, accessory);
        break;

      default:
        this.log.error(`Unsupported device type for ${sensor.type}. Please file a feature request to support `
          + `additional Ecowitt devices at ${utils.FEATURE_REQ_LINK}`);
        break;
    }
  }

  //----------------------------------------------------------------------------

  updateAccessories(dataReport) {
    const dataDate = new Date(dataReport.dateutc);
    dataDate.setMinutes(dataDate.getMinutes() - dataDate.getTimezoneOffset()); // timezone correction
    const dateDiff = Math.abs(new Date().getTime() - dataDate.getTime());

    let threshold = dataReport?.interval || 30;
    threshold = parseInt(threshold) * 4;

    if (dateDiff >= threshold * 1000) {
      if (utils.truthy(this.config.additional?.validateTimestamp)) {
        this.log.error(`Received data report for ${dataReport.dateutc} UTC which appears to be old, `
          + 'discarding data report. To process old data reports, disable timestamp validation in advanced settings');
        return;
      } else {
        this.log.info(`Received data report for ${dataReport.dateutc} UTC which appears to be old, `
          + 'this could indicate an issue if it occurs frequently');
      }
    } else {
      this.log.debug(`Received new data report for ${dataReport.dateutc} UTC`);
    }

    for (const sensor of this.baseStationInfo.sensors) {
      if (typeof sensor.channel !== 'undefined') {
        this.log.debug(`Updating sensor - type: ${sensor.type} channel: ${sensor.channel}`);
      } else {
        this.log.debug(`Updating sensor - type: ${sensor.type}`);
      }

      try {
        if (typeof sensor.accessory !== 'undefined') {
          sensor.accessory.update(dataReport);
        } else {
          this.log.warn(`Skipping update on ${sensor.type}, accessory is not defined. Please file a `
            + `bug report at ${utils.BUG_REPORT_LINK}`);
        }
      } catch(err) {
        let stack: string | undefined = undefined;
        if (err instanceof Error) {
          stack = err.stack;
        } else {
          stack = String(err);
        }

        this.log.warn(`An issue occured while updating sensor values for ${sensor.type}. Review the error message below `
          + `and file a bug report if needed at ${utils.BUG_REPORT_LINK} \n ${stack}`);
      }
    }
  }

  //----------------------------------------------------------------------------
}
