import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';

import { GW1000 } from './GW1000';
import { GW2000C } from './GW2000C';
import { WH25 } from './WH25';
import { WH31 } from './WH31';
import { WH40 } from './WH40';
import { WH41 } from './WH41';
import { WH51 } from './WH51';
import { WH55 } from './WH55';
import { WH57 } from './WH57';
import { WH65 } from './WH65';

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
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

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
      .digest('hex').toUpperCase(),
    sensors: [],
  };

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {

    this.log.info('Storage path:', this.api.user.storagePath());
    this.log.info('config:', JSON.stringify(this.config, undefined, 2));

    this.log.info('Creating data report service');
    this.log.info('  Port:', this.config.port);
    this.log.info('  Path:', this.config.path);

    this.dataReportServer = restify.createServer();
    this.dataReportServer.use(restify.plugins.bodyParser());

    this.dataReportServer.post(
      this.config.path,
      (req, res, next) => {
        this.log.info('Data source address:', req.socket.remoteAddress);
        this.log.info('Request:', req.toString());
        this.onDataReport(req.body);
        next();
      });

    this.log.debug('Finished initializing platform:', this.config.name);

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.

    this.api.on('didFinishLaunching', () => {

      this.unregisterAccessories();

      this.dataReportServer.listen(this.config.port, () => {
        this.log.info('Listening for data reports on: %s', this.dataReportServer.url);
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
    if (dataReport.PASSKEY !== this.baseStationInfo.PASSKEY) {
      this.log.error('Not configured for data reports from this base station:', JSON.stringify(dataReport, undefined, 2));
      return;
    }

    this.log.info('Data report:', JSON.stringify(dataReport, undefined, 2));

    if (!this.lastDataReport) {
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
      this.baseStationInfo.sensors.push(
        {
          type: type,
          channel: channel,
        });

      if (channel) {
        this.log.info(`Adding sensor: ${type} channel: ${channel}`);
      } else {
        this.log.info(`Adding sensor: ${type}`);
      }
    }
  }

  //----------------------------------------------------------------------------

  unregisterAccessories() {
    this.log.info('Unregistering cached accessories:', this.accessories.length);
    this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, this.accessories);
  }

  //----------------------------------------------------------------------------

  registerAccessories(dataReport) {
    const stationTypeInfo = dataReport?.stationtype.match(/(EasyWeather|GW1[01]00(?:[AB]?)|GW2000C)_?(.*)/);
    const modelInfo = dataReport?.model.match(/(HP2551CA|GW1[01]00|GW2000C)[AB]?_?(.*)/);

    this.log.info('stationTypeInfo:', JSON.stringify(stationTypeInfo));
    this.log.info('modelInfo:', JSON.stringify(modelInfo));

    this.baseStationInfo.model = dataReport.model;
    this.baseStationInfo.frequency = dataReport.freq;

    if (Array.isArray(stationTypeInfo)) {
      const octets = this.config.mac.split(':');
      this.baseStationInfo.deviceName = `${stationTypeInfo[1]}-WIFI${octets[4]}${octets[5]}`;
    }

    if (Array.isArray(modelInfo)) {
      switch (modelInfo[1]) {
        case 'GW1000':
          this.baseStationInfo.hardwareRevision = dataReport.stationtype;
          this.baseStationInfo.firmwareRevision = stationTypeInfo[2];
          if (!this.config?.thbin?.hide) {
            this.addSensorType(true, 'GW1000');
          }
          break;

        case 'GW1100':
          this.baseStationInfo.hardwareRevision = dataReport.stationtype;
          this.baseStationInfo.firmwareRevision = stationTypeInfo[2];
          if (!this.config?.thbin?.hide) {
            this.addSensorType(true, 'GW1100');
          }
          break;

        case 'HP2551CA':
          this.baseStationInfo.softwareRevision = dataReport.stationtype;
          this.baseStationInfo.firmwareRevision = modelInfo[2];
          break;
      }
    }

    if (dataReport?.model === 'GW2000C') {
      this.baseStationInfo.hardwareRevision = dataReport.stationtype;
      this.baseStationInfo.firmwareRevision = stationTypeInfo[2];
      if (!this.config?.thbin?.hide) {
        this.log.info('Adding GW2000C');
        this.addSensorType(true, 'GW2000C');
      }
    }

    this.log.info('Discovering sensors');

    if (!this.config?.ws?.hide) {
      this.addSensorType(dataReport.wh65batt !== undefined, 'WH65');
    }

    this.addSensorType(dataReport.wh25batt !== undefined, 'WH25');

    if (!this.config?.th?.hide) {
      for (let channel = 1; channel <= 8; channel++) {
        this.addSensorType(dataReport[`batt${channel}`] !== undefined, 'WH31', channel);
      }
    }

    this.addSensorType(dataReport.wh40batt !== undefined, 'WH40');

    if (!this.config?.pm25?.hide) {
      for (let channel = 1; channel <= 4; channel++) {
        this.addSensorType(dataReport[`pm25batt${channel}`] !== undefined, 'WH41', channel);
      }
    }

    if (!this.config?.soil?.hide) {
      for (let channel = 1; channel <= 8; channel++) {
        this.addSensorType(dataReport[`soilbatt${channel}`] !== undefined, 'WH51', channel);
      }
    }

    if (!this.config?.leak?.hide) {
      for (let channel = 1; channel <= 4; channel++) {
        this.addSensorType(dataReport[`leakbatt${channel}`] !== undefined, 'WH55', channel);
      }
    }

    if (!this.config?.lightning?.hide) {
      this.addSensorType(dataReport.wh57batt !== undefined, 'WH57');
    }

    this.log.info('StationInfo:', JSON.stringify(this.baseStationInfo, undefined, 2));

    for (const sensor of this.baseStationInfo.sensors) {
      const sensorId = this.config.mac +
        '-' +
        sensor.type +
        (sensor.channel > 0 ? '-' + sensor.channel.toString() : '');
      const uuid = this.api.hap.uuid.generate(sensorId);

      this.log.info('sensorId:', sensorId, 'uuid:', uuid);

      const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

      if (existingAccessory) {
        // the accessory already exists
        this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

        // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
        // existingAccessory.context.device = device;
        // this.api.updatePlatformAccessories([existingAccessory]);

        // create the accessory handler for the restored accessory
        // this is imported from `platformAccessory.ts`
        //new EcowittAccessory(this, existingAccessory);

        // it is possible to remove platform accessories at any time using `api.unregisterPlatformAccessories`, eg.:
        // remove platform accessories when no longer present
        this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory]);
        this.log.info('Removing existing accessory from cache:', existingAccessory.displayName);
        //} else {
      }
      {
        // the accessory does not yet exist, so we need to create it
        this.log.info('Adding new accessory type:', sensor.type, (sensor.channel > 0 ? 'channel: ' + sensor.channel.toString() : ''));

        // create a new sensor accessory
        const accessory = new this.api.platformAccessory(sensor.type, uuid);

        // store a copy of the device object in the `accessory.context`
        // the `context` property can be used to store any data about the accessory you may need
        //accessory.context.sensorInfo = sensorInfo;

        switch (sensor.type) {
          case 'GW2000C':
            sensor.accessory = new GW2000C(this, accessory);
            break;

          case 'GW1000':
            sensor.accessory = new GW1000(this, accessory);
            break;

          case 'GW1100':
            sensor.accessory = new GW1100(this, accessory);
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

          default:
            this.log.error('Unhandled sensor type:', sensor.type);
            break;
        }

        // link the sensor accessory to the platform
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }
    }
  }

  //----------------------------------------------------------------------------

  updateAccessories(dataReport) {
    const dateUTC = new Date(dataReport.dateutc);
    this.log.info('Report time:', dateUTC);

    for (const sensor of this.baseStationInfo.sensors) {
      this.log.info('Updating:', sensor.type, (sensor.channel > 0 ? 'channel: ' + sensor.channel.toString() : ''));
      sensor.accessory.update(dataReport);
    }
  }
}
