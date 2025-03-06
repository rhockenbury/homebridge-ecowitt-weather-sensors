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

import { BASE } from './devices/BASE';
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
import { WN67 } from './devices/WN67';
import { WS68 } from './devices/WS68';
import { WS80 } from './devices/WS80';
import { WS85 } from './devices/WS85';
import { WS90 } from './devices/WS90';


import * as utils from './Utils';
import * as bodyParser from 'body-parser';
import * as crypto from 'crypto';
import arp from '@network-utils/arp-lookup';

import { EcowittAccessory } from './EcowittAccessory';

import express, { Request, Response, Next } from 'express';

// eslint-disable-next-line  @typescript-eslint/no-var-requires
const merge = require('deepmerge');
// eslint-disable-next-line  @typescript-eslint/no-var-requires
const querystring = require('querystring');

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
  deviceIP: string;
  serialNumber: string;
  shortSerial: string;
  protocol: string;
  hardwareRevision: string;
  softwareRevision: string;
  firmwareRevision: string;
  frequency: string;
  MAC: string;
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
  public validatorsReportData: string[] = ['PASSKEY', 'MAC'];
  public requiredReportData: string[] = ['stationtype', 'dateutc', 'model'];
  public ignoreableReportData: string[] = ['runtime', 'heap', 'interval', 'freq'];
  public protocolCheckFieldsWU: string[] = ['ID', 'PASSWORD'];

  public baseStationInfo: BaseStationInfoType = {
    model: utils.UNKNOWN,
    deviceName: utils.UNKNOWN,
    deviceIP: '',
    serialNumber: '',
    shortSerial: '',
    protocol: utils.UNKNOWN,
    hardwareRevision: '',
    softwareRevision: '',
    firmwareRevision: '',
    frequency: '',
    MAC: '',
    PASSKEY: '',
    sensors: [],
  };

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    let mac = this.config?.baseStation?.mac || this.config?.mac;

    if (typeof mac === 'undefined' || !arp.isMAC(mac)) {
      if (typeof this.config?.additional === 'undefined') {
        this.config.additional = {};
      }
      this.config.additional.validateMac = false;
      mac = '00:00:00:00:00:00';
      this.log.warn('Disabling MAC validation because MAC address was not provided or MAC address is invalid. '
        + 'Provide a valid MAC address to have MAC validation enabled');
    }

    this.baseStationInfo.serialNumber = mac.toUpperCase();
    this.baseStationInfo.shortSerial = mac.replaceAll(':', '').slice(8).toUpperCase();
    this.baseStationInfo.MAC = mac.replaceAll('-', ':').toUpperCase();
    this.baseStationInfo.PASSKEY = crypto.createHash('md5').update(mac.toUpperCase()).digest('hex').toUpperCase();

    if (utils.v1ConfigTest(this.config)) {
      const v2Config = utils.v1ConfigRemapper(this.config);
      this.log.warn('Plugin configuration currently has v1 properties and needs to be migrated to v2. '
        + 'A migrated v2-compatible version of your plugin configuration has been generated below, '
        + `see ${utils.MIGRATION_GUIDE_LINK} for the migration guide \n${JSON.stringify(v2Config, undefined, 2)}`);
      this.config = v2Config;
      this.log.debug(`Plugin config has been auto-migrated to v2 \n${JSON.stringify(this.config, undefined, 2)}`);
    }

    // structure of base station changed in v2.7.0 and prior versions need to be remapped
    const updatedConfig = utils.baseStationRemapper(this.config);
    if (JSON.stringify(updatedConfig) === JSON.stringify(this.config)) {
      this.log.debug('Plugin configuration migration for base station not required');
    } else {
      this.config = updatedConfig;
      this.log.warn('Plugin config needs to be migrated, an auto-migrated version '
        + `of your plugin configuration has been generated below \n${JSON.stringify(updatedConfig, undefined, 2)}`);
    }

    let encodedPath = encodeURI(this.config?.baseStation?.path || '/data/report/');
    const port = this.config?.baseStation?.port || 8080;

    // check and remove trailing slash to match parsedPath
    if (encodedPath.endsWith('/')) {
      encodedPath = encodedPath.slice(0, -1);
    }

    this.log.debug(`Creating data report service on ${port} '${encodedPath}'`);

    this.dataReportServer = express();
    this.dataReportServer.use(bodyParser.json());
    this.dataReportServer.use(bodyParser.urlencoded({ extended: true }));

    // depending on the vendor/protocol, the request can be POST or GET and data properties
    // can be sent as query params or as JSON body
    // additionally, users frequently forget to add the query prefix character (?) to the path option
    // when configuring the custom server upload, so that case is handled here
    this.dataReportServer.all('*', (req: Request, res: Response, next: Next) => {
      let parsedPath = req.path.split(/[?#&]/)[0];

      if (parsedPath.endsWith('/')) {
        parsedPath = parsedPath.slice(0, -1); // remove trailing slash
      }

      if (arp.isIP(req.socket.remoteAddress)) {
        if (req.socket.remoteAddress.startsWith('::ffff:')) { //  IPv6 prefix
          this.baseStationInfo.deviceIP = req.socket.remoteAddress.substring(7);
        } else {
          this.baseStationInfo.deviceIP = req.socket.remoteAddress;
        }
        this.log.debug(`Received request ${req.method} '${parsedPath}' from IP ${this.baseStationInfo.deviceIP}`);
      } else {
        this.log.debug(`Received request ${req.method} '${parsedPath}'`);
      }

      if (parsedPath !== encodedPath && utils.falsy(this.config?.additional?.acceptAnyPath)) {
        this.log.error(`Configure the base station to send data reports to path '${encodedPath}' `
          + `instead of path '${parsedPath}' or enable accept any path in advanced settings`);
        res.send();
        return;
      }

      let dataReport = {};

      if (req.originalUrl.includes('?')) { // query params should be well-formatted and parseable
        dataReport = merge(req.body, req.query);
      } else if (req.path.includes('&')) { // query params not formed correctly
        const params = req.path.substring(req.path.indexOf('&') + 1);
        dataReport = merge(req.body, querystring.parse(params));
      } else {
        dataReport = req.body;
      }

      // WU sends with unique data report properties
      if (utils.includesAny(Object.keys(dataReport), this.protocolCheckFieldsWU)) {
        this.log.error('Data report appears to use the Wunderground protocol. This plugin ' +
          'does not have support for the Wunderground protocol. Please ensure that the ' +
          ' Ecowitt protocol or Ambient protocol is used when sending data reports to this plugin');
        this.baseStationInfo.protocol = utils.UNDERGROUND;
        res.send();
        return;
      }

      // AMB sends get request with data as query params
      if (req.method === 'GET' && (Object.keys(req.query).length > 0 || req.path.length > 2)) {
        if (this.lastDataReport === null) { // only show once on startup
          this.log.warn('Data report appears to use the Ambient Weather protocol. This plugin ' +
            `has beta support for Ambient Weather. Please file bug reports at ${utils.BUG_REPORT_LINK}` +
            ` and feature requests at ${utils.FEATURE_REQ_LINK} to help improve support for Ambient devices`);
        }
        this.baseStationInfo.protocol = utils.AMBIENT;
      }

      // ECO sends as post with data in request body
      if (req.method === 'POST' && Object.keys(req.body).length > 0) {
        this.baseStationInfo.protocol = utils.ECOWITT;
      }

      try {
        this.onDataReport(dataReport);
        res.send();
      } catch (err) {
        next(err);
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.dataReportServer.use((err, req: Request, res: Response, next: Next) => {
      this.log.warn('An issue occurred while processing a data report. '
        + `Review the error message below and file a bug report at ${utils.BUG_REPORT_LINK} \n ${err.stack}`);
      res.status(500).send('Error processing data report');
    });

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.
    this.api.on('didFinishLaunching', () => {
      this.dataReportServer.listen(port, () => {
        this.log.info(`Setup complete, plugin is listening for data reports on ${port} '${encodedPath}'`);
        this.log.info(`See ${utils.GATEWAY_SETUP_LINK} for help with sending data reports to this plugin`);
      }).on('error', (err) => {
        if (err instanceof Error) {
          if (err['code'] === 'EADDRINUSE') {
            this.log.error(`Unable to start data report service on ${port} '${encodedPath}' because port ${port} is in use. `
              + `Try setting the port to ${port + 1} and restart Homebridge`);
          } else {
            this.log.error(`Unable to start data report service on ${port} '${encodedPath}'. `
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

  public isEcowitt() {
    return this.baseStationInfo.protocol === utils.ECOWITT;
  }

  //----------------------------------------------------------------------------

  public isAmbient() {
    return this.baseStationInfo.protocol === utils.AMBIENT;
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

  public async onDataReport(dataReport) {
    if (typeof dataReport !== 'object') {
      this.log.warn(`Received empty data report. Verify configuration with docs at ${utils.GATEWAY_SETUP_LINK}`);
      return;
    }

    if (Object.keys(dataReport).length === 0) {
      this.log.warn(`Received empty data report. Verify configuration with docs at ${utils.GATEWAY_SETUP_LINK}`);
      return;
    }

    if (utils.truthy(this.config?.additional?.logDataReports)) {
      this.log.info(`Received data report \n${JSON.stringify(dataReport, undefined, 2)}`);
    } else {
      this.log.debug('Received data report (if you are submitting a bug report copy and paste the full data '
        + `report object below) \n${JSON.stringify(dataReport, undefined, 2)}`);
    }

    if (this.isAmbient()) {
      dataReport = utils.dataReportTranslator(dataReport);
      this.log.debug('Ambient data report has been translated to Ecowitt data report \n'
        + `${JSON.stringify(dataReport, undefined, 2)}`);
    }

    if (!utils.includesAny(Object.keys(dataReport), this.validatorsReportData) && utils.truthy(this.config?.additional?.validateMac)) {
      this.log.warn(`Data report must include one of ${this.validatorsReportData} to validate `
        + 'data report. Check your data report or disable MAC validation in advanced settings');
      return;
    }

    if ((dataReport.PASSKEY !== undefined && dataReport.PASSKEY !== this.baseStationInfo.PASSKEY) ||
           (dataReport.MAC !== undefined && dataReport.MAC !== this.baseStationInfo.MAC)) {
      if (utils.truthy(this.config?.additional?.validateMac)) {
        if (this.baseStationInfo.deviceIP.length > 0) {
          // attempt to lookup MAC from the IP address from the request
          // to provide user more information for properly setting AMC
          const discoveredMac = await arp.toMAC(this.baseStationInfo.deviceIP);
          if (discoveredMac !== null) {
            this.log.warn(`Ignoring data report from MAC ${discoveredMac.toUpperCase()}, expected data report ` +
              `from MAC ${this.baseStationInfo.serialNumber}. Verify MAC address is set properly in the plugin, ` +
              'or disable MAC validation in advanced settings');
            return;
          } else {
            this.log.warn(`Ignoring data report from IP ${this.baseStationInfo.deviceIP} with unknown MAC, ` +
               `expected data report from MAC ${this.baseStationInfo.serialNumber}. Verify MAC address is ` +
               'set properly in the plugin, or disable MAC validation in advanced settings');
            return;
          }
        } else {
          this.log.warn('Ignoring data report from unknown MAC address, expected data report ' +
            `from MAC ${this.baseStationInfo.serialNumber}. Verify MAC address is set properly in ` +
            'the plugin, or disable MAC validation in advanced settings');
          return;
        }
      } else {
        this.log.debug('Processing data report from unknown MAC address. MAC validation is disabled');
      }
    }

    if (!utils.includesAll(Object.keys(dataReport), this.requiredReportData)) {
      this.log.warn(`Received incomplete data report. Missing one of ${this.requiredReportData}. `
        + `Verify plugin configuration with docs at ${utils.GATEWAY_SETUP_LINK}`);
      return;
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
    let modelInfo = [];

    // ecowitt gateway - gw (WIFI) series
    if (dataReport.model.trim().startsWith('GW')) {
      modelInfo = dataReport.model.trim().match(/(GW[123][0-9]{3})[ABC]?_?(.*)/);
    }

    // ecowitt console - hp (TFT) series
    if (dataReport.model.trim().startsWith('HP')) {
      modelInfo = dataReport.model.trim().match(/(HP[23][56][0-9]{2})[ABC]?_?(.*)/);
    }

    // ecowitt console - ws (LCD) series
    if (dataReport.model.trim().startsWith('WS')) {
      modelInfo = dataReport.model.trim().match(/(WS[23][389][0-9]{2})[ABC]?_?(.*)/);
    }

    // ecowitt console - wn (LCD) series
    if (dataReport.model.trim().startsWith('WN')) {
      modelInfo = dataReport.model.trim().match(/(WN[1][89][0-9]{2})[ABC]?_?(.*)/);
    }

    if (Array.isArray(modelInfo) && modelInfo.length === 3) { // 3 match groups always expected
      this.baseStationInfo.deviceName = modelInfo[1];
    }

    // parse out software version info if possible from station type
    if (!dataReport.stationtype.trim().startsWith('EasyWeather')) {
      const stationTypeInfo = dataReport.stationtype.split('_');
      this.baseStationInfo.softwareRevision = stationTypeInfo[stationTypeInfo.length - 1];
    }

    if (dataReport.model !== undefined) {
      this.baseStationInfo.model = dataReport.model;
    }

    if (dataReport.freq !== undefined) {
      this.baseStationInfo.frequency = dataReport.freq;
    }

    const hideConfig = this.config?.hidden || {};
    const hideConfigCustom = this.config?.customHidden || [];
    const hidden = Object.keys(hideConfig).filter(k => !!hideConfig[k]).concat(hideConfigCustom);

    const validateIndoor = dataReport.tempinf !== undefined && dataReport.humidityin !== undefined;
    const validateTHP = dataReport.wh25batt !== undefined; // THP monitor may be providing indoor metrics

    if (!utils.includesAll(hidden, ['BASE']) && !utils.includesAll(hidden, BASE.properties)) {
      if (this.baseStationInfo.deviceName !== utils.UNKNOWN) {
        if (!validateTHP && validateIndoor) {  // indoor metrics not covered by THP monitor
          this.addSensorType(true, this.baseStationInfo.deviceName);
        } else if (!validateIndoor){
          this.log.warn('Base station was detected from data report, but indoor data properties '
            + 'do not exist on data report so base station accessory will not be created');
        } else {
          this.log.warn('Base station was detected from data report, but indoor data properties appear '
            + 'to come from indoor companion sensor so base station accessory will not be created');
        }
      } else {
        if (!validateTHP && validateIndoor) {  // indoor metrics not covered by THP monitor
          this.log.warn('Base station was not recognized from data report, but a base gateway accessory '
            + 'will still be created. To add official support for your base station, please file a feature '
            + `request at ${utils.FEATURE_REQ_LINK}`);
          this.addSensorType(true, 'BASE');
        } else {
          this.log.debug('Base station was not recognized from data report, but it appears a '
            + 'base station accessory does not need to be created. To add support for your '
            + `base station, please file a feature request at ${utils.FEATURE_REQ_LINK}`);
        }
      }
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

    // WH65 and WN67 are the same sensor type, except WN67 does not have solarRadiation and UVIndex
    if (!utils.includesAny(hidden, ['WH65']) && !utils.includesAll(hidden, WH65.properties)) {
      this.addSensorType(dataReport.wh65batt !== undefined && dataReport.uv !== undefined, 'WH65');
    }

    if (!utils.includesAny(hidden, ['WN67']) && !utils.includesAll(hidden, WN67.properties)) {
      this.addSensorType(dataReport.wh65batt !== undefined && dataReport.uv === undefined, 'WN67');
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
        + `at ${utils.GATEWAY_SETUP_LINK}, and/or file a feature request to support your weather devices at ${utils.FEATURE_REQ_LINK}`);
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
        this.log.info(`Note that accessory ${sensor.type} does not currently use and/or display the following ` +
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
    unconsumed = unconsumed.filter(x => !this.validatorsReportData.includes(x));
    unconsumed = unconsumed.filter(x => !this.ignoreableReportData.includes(x));
    this.unconsumedReportData = unconsumed;

    if (unconsumed.length > 0 && Object.keys(this.config?.hidden || {}).length === 0) {
      this.log.info(`There was unused data from data report ${unconsumed}. This may indicate that a sensor was not ` +
        'successfully discovered. Try restarting Homebridge so that the plugin re-registers ' +
        'devices from the data report');
    } else {
      this.log.debug('All data from data report was consummable');
    }

    // validate data report interval
    if (typeof dataReport?.interval !== 'undefined') {
      if (parseInt(dataReport.interval) < 10) {
        this.log.warn('The lowest recommended data report interval is 10s, please reconfigure your base ' +
          'station to publish data reports no more than once every 10 seconds');
      }
    }
  }

  createAccessory(sensor, accessory) {
    switch (sensor.type) {
      case 'BASE':    // unknown
      case 'GW1000':  // gateways
      case 'GW1100':
      case 'GW1200':
      case 'GW2000':
      case 'GW3000':
      case 'HP2560':  // HP consoles
      case 'HP2561':
      case 'HP2564':
      case 'WS2320':  // WS consoles
      case 'WS2350':
      case 'WS2900':
      case 'WS2910':
      case 'WS3800':
      case 'WS3820':
      case 'WS3900':
      case 'WS3910':
      case 'WN1820':  // WN consoles
      case 'WN1821':
      case 'WN1900':
      case 'WN1910':
      case 'WN1920':
      case 'WN1980':
        sensor.accessory = new BASE(this, accessory, sensor.type);
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

      case 'WN67':
        sensor.accessory = new WN67(this, accessory);
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
          + `additional devices at ${utils.FEATURE_REQ_LINK}`);
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
          this.log.warn(`Skipping update on ${sensor.type}, accessory is not defined. Please file `
            + `bug reports at ${utils.BUG_REPORT_LINK}`);
        }
      } catch(err) {
        let stack: string | undefined = undefined;
        let message: string | undefined = undefined;

        if (err instanceof Error) {
          stack = err.stack;
          message = err.message;
        } else {
          stack = String(err);
          message = String(err);
        }

        if (message.includes('Update on') && message.includes('requires data')) {
          this.log.warn(`An issue occurred while updating sensor values for ${sensor.type}. ${message}. ` +
            `Please file bug reports at ${utils.BUG_REPORT_LINK}`);
        } else {
          this.log.warn(`An issue occurred while updating sensor values for ${sensor.type}. Review the error message below `
            + `and file a bug report if needed at ${utils.BUG_REPORT_LINK} \n ${stack}`);
        }
      }
    }
  }

  //----------------------------------------------------------------------------
}
