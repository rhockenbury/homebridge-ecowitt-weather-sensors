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
import { GW1100 } from './devices/GW1100';
import { GW2000 } from './devices/GW2000';
import { WH25 } from './devices/WH25';
import { WH31 } from './devices/WH31';
import { WH40 } from './devices/WH40';
import { WH41 } from './devices/WH41';
import { WH51 } from './devices/WH51';
import { WH55 } from './devices/WH55';
import { WH57 } from './devices/WH57';
import { WH65 } from './devices/WH65';
import { WN34 } from './devices/WN34';
import { WS85 } from './devices/WS85';

import * as restify from 'restify';
import * as crypto from 'crypto';

interface BaseStationInfo {
  model: string;
  deviceName: string;
  serialNumber: string;
  hardwareRevision: string;
  softwareRevision: string;
  firmwareRevision: string;
  frequency: string;
  PASSKEY: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sensors: any[];
}

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */

export class EcowittPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap
    .Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];

  public dataReportServer: restify.Server;
  public lastDataReport = null;

  public baseStationInfo: BaseStationInfo = {
    model: '',
    deviceName: '',
    serialNumber: this.config.mac,
    hardwareRevision: '',
    softwareRevision: '',
    firmwareRevision: '',
    frequency: '',
    PASSKEY: crypto
      .createHash('md5')
      .update(this.config.mac)
      .digest('hex')
      .toUpperCase(),
    sensors: [],
  };

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Storage path:', this.api.user.storagePath());
    this.log.debug('Config:', JSON.stringify(this.config, undefined, 2));

    this.log.debug('Creating data report service');
    this.log.debug('  Port:', this.config.port);
    this.log.debug('  Path:', this.config.path);
    this.log.debug('  Unregister:', this.config.unregister);

    this.dataReportServer = restify.createServer();
    this.dataReportServer.use(restify.plugins.bodyParser());

    this.dataReportServer.post(this.config.path, (req, res, next) => {
      this.log.debug('Data source address:', req.socket.remoteAddress);
      this.log.debug('Request:', req.toString());
      this.onDataReport(req.body);
      res.send();
      return next();
    });

    this.log.debug('Finished initializing platform:', this.config.name);

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.
    this.api.on('didFinishLaunching', () => {
      if (this.config.unregister) {
        this.unregisterAccessories();
      }

      this.dataReportServer.listen(this.config.port, () => {
        this.log.info(
          `Listening for data reports on: ${this.dataReportServer.url}`
        );
      });
    });
  }

  //----------------------------------------------------------------------------

  public serviceUuid(name: string) {
    const serviceId = this.config.mac + '_' + name;
    return this.api.hap.uuid.generate(serviceId);
  }

  //----------------------------------------------------------------------------

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);

    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.accessories.push(accessory);
  }

  //----------------------------------------------------------------------------

  onDataReport(dataReport) {
    if (typeof dataReport !== 'object') {
      this.log.warn('Received empty data report');
    }

    if ( !dataReport.hasOwnProperty('PASSKEY') || !dataReport.hasOwnProperty('stationtype') ) {
      this.log.warn('Received incomplete data report');
    }

    // TODO - introduce property to toggle verification
    if (dataReport.PASSKEY !== this.baseStationInfo.PASSKEY) {
      this.log.error(
        'Not configured for data reports from this base station:',
        JSON.stringify(dataReport, undefined, 2),
      );
      return;
    }

    this.log.debug('Recieved data report:', JSON.stringify(dataReport, undefined, 2));

    if (!this.lastDataReport) { // on first data report
      this.log.info('Registering accessories');
      this.lastDataReport = dataReport;
      this.registerAccessories(dataReport);
    } else {
      this.lastDataReport = dataReport;
    }

    this.updateAccessories(dataReport);
  }

  //----------------------------------------------------------------------------

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addSensorType(add: boolean, type: string, channel: any = undefined) {
    if (add) {
      this.baseStationInfo.sensors.push({
        type: type,
        channel: channel,
      });

      if (typeof channel !== 'undefined') {
        this.log.info(`Adding sensor: ${type} channel: ${channel}`);
      } else {
        this.log.info(`Adding sensor: ${type}`);
      }
    }
  }

  //----------------------------------------------------------------------------

  unregisterAccessories() {
    this.log.info('Unregistering cached accessories:', this.accessories.length);
    this.api.unregisterPlatformAccessories(
      PLUGIN_NAME,
      PLATFORM_NAME,
      this.accessories,
    );
    this.accessories.length = 0;
  }

  //----------------------------------------------------------------------------

  registerAccessories(dataReport) {
    const stationTypeInfo = dataReport?.stationtype.match(
      /(EasyWeather|GW[12][01]00(?:[ABC]?))_?(.*)/,
    );
    const modelInfo = dataReport?.model.match(
      /(HP2551CA|GW[12][01]00)[ABC]?_?(.*)/,
    );

    this.log.debug('stationTypeInfo:', JSON.stringify(stationTypeInfo));
    this.log.debug('modelInfo:', JSON.stringify(modelInfo));

    this.baseStationInfo.model = dataReport.model;
    this.baseStationInfo.frequency = dataReport.freq;

    if (Array.isArray(stationTypeInfo)) {
      const octets = this.config.mac.split(':');
      this.baseStationInfo.deviceName = `${stationTypeInfo[1]}-WIFI${octets[4]}${octets[5]}`;
    }

    if (Array.isArray(modelInfo)) {
      switch (modelInfo[1]) {
        case 'GW1000':
        case 'GW1100':
        case 'GW2000':
          this.baseStationInfo.hardwareRevision = dataReport.stationtype;
          this.baseStationInfo.firmwareRevision = stationTypeInfo[2];
          if (!this.config?.thbin?.hide) {
            this.addSensorType(true, modelInfo[1]);
          }
          break;

        case 'HP2551CA':
          this.baseStationInfo.softwareRevision = dataReport.stationtype;
          this.baseStationInfo.firmwareRevision = modelInfo[2];
          break;
      }
    }

    this.log.debug('Discovering sensors');

    if (!this.config?.ws?.hide) {
      this.addSensorType(dataReport.wh65batt !== undefined, 'WH65');
    }

    if (!this.config?.ws?.hide) {
      // NOTE: Typo in WS-85 as it responds with wh85batt instead of expected ws85batt.
      this.addSensorType(
        dataReport.wh85batt !== undefined || dataReport.ws85batt !== undefined,
        'WS85',
      );
    }

    this.addSensorType(dataReport.wh25batt !== undefined, 'WH25');

    if (!this.config?.th?.hide) {
      for (let channel = 1; channel <= 8; channel++) {
        this.addSensorType(
          dataReport[`batt${channel}`] !== undefined,
          'WH31',
          channel,
        );
      }
    }

    this.addSensorType(dataReport.wh40batt !== undefined, 'WH40');

    if (!this.config?.pm25?.hide) {
      for (let channel = 1; channel <= 4; channel++) {
        this.addSensorType(
          dataReport[`pm25batt${channel}`] !== undefined,
          'WH41',
          channel,
        );
      }
    }

    if (!this.config?.soil?.hide) {
      for (let channel = 1; channel <= 8; channel++) {
        this.addSensorType(
          dataReport[`soilbatt${channel}`] !== undefined,
          'WH51',
          channel,
        );
      }
    }

    if (!this.config?.leak?.hide) {
      for (let channel = 1; channel <= 4; channel++) {
        this.addSensorType(
          dataReport[`leakbatt${channel}`] !== undefined,
          'WH55',
          channel,
        );
      }
    }

    if (!this.config?.lightning?.hide) {
      this.addSensorType(dataReport.wh57batt !== undefined, 'WH57');
    }

    if (!this.config?.tf?.hide) {
      for (let channel = 1; channel <= 8; channel++) {
        this.addSensorType(
          dataReport[`tf_batt${channel}`] !== undefined,
          'WN34',
          channel,
        );
      }
    }

    this.log.info(
      'StationInfo:',
      JSON.stringify(this.baseStationInfo, undefined, 2),
    );

    for (const sensor of this.baseStationInfo.sensors) {
      const sensorId =
        this.config.mac +
        '-' +
        sensor.type +
        (sensor.channel > 0 ? '-' + sensor.channel.toString() : '');
      const uuid = this.api.hap.uuid.generate(sensorId);

      this.log.debug('sensorId:', sensorId, 'uuid:', uuid);

      const existingAccessory = this.accessories.find(
        (accessory) => accessory.UUID === uuid,
      );

      if (existingAccessory) {
        // the accessory already exists
        this.log.debug(
          'Restoring existing accessory from cache:',
          existingAccessory.displayName,
        );
        this.createAccessory(sensor, existingAccessory);
      } else {
        // create a new sensor accessory
        const accessory = new this.api.platformAccessory(sensor.type, uuid);
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
  }

  createAccessory(sensor, accessory) {
    switch (sensor.type) {
      case 'GW1000':
        sensor.accessory = new GW1000(this, accessory);
        break;

      case 'GW1100':
        sensor.accessory = new GW1100(this, accessory);
        break;

      case 'GW2000':
        sensor.accessory = new GW2000(this, accessory);
        break;

      case 'WH25':
        sensor.accessory = new WH25(this, accessory);
        break;

      case 'WH31':
        sensor.accessory = new WH31(this, accessory, sensor.channel);
        break;

      case 'WH40':
        sensor.accessory = new WH40(this, accessory);
        break;

      case 'WH41':
        sensor.accessory = new WH41(this, accessory, sensor.channel);
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

      case 'WN34':
        sensor.accessory = new WN34(this, accessory, sensor.channel);
        break;

      case 'WS85':
        sensor.accessory = new WS85(this, accessory);
        break;

      default:
        this.log.error(`Unhandled sensor type: ${sensor.type}. Please report this issue to `);
        break;
    }
  }

  //----------------------------------------------------------------------------

  updateAccessories(dataReport) {
    const dateUTC = new Date(dataReport.dateutc);
    this.log.debug(`Received new data report for ${dateUTC}`);

    for (const sensor of this.baseStationInfo.sensors) {
      this.log.debug(
        'Updating:',
        sensor.type,
        sensor.channel > 0 ? 'channel: ' + sensor.channel.toString() : '',
      );
      sensor.accessory.update(dataReport);
    }
  }
}
