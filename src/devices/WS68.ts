import { Service, PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';
import { LightSensor } from './../sensors/LightSensor';
import { UltravioletSensor } from './../sensors/UltravioletSensor';
import { WindSensor } from './../sensors/WindSensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class WS68 extends EcowittAccessory {
  static readonly properties: string[] = ['solarRadiation', 'uvIndex', 'windDirection',
    'windSpeed', 'windGustSpeed', 'windMaxDailySpeed'];

  protected battery: Service;
  protected solarRadiation: LightSensor | undefined;
  protected uvIndex: UltravioletSensor | undefined;
  protected windDirection: WindSensor | undefined;
  protected windSpeed: WindSensor | undefined;
  protected windGust: WindSensor | undefined;
  protected maxDailyGust: WindSensor | undefined;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory, 'WS68', 'WS68 4-in-1 Solar Weather Sensor');

    this.requiredData = ['wh68batt', 'solarradiation', 'uv', 'winddir', 'windspeedmph',
      'windgustmph', 'maxdailygust'];

    this.battery = this.addBattery('', false);

    const hideConfig = this.platform.config?.hidden || {};
    const hidden = Object.keys(hideConfig).filter(k => !!hideConfig[k]);

    let nameOverride: string | undefined;

    if (!utils.includesAny(hidden, ['solarRadiation', `${this.shortServiceId}:solarRadiation`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:solarRadiation`);
      this.solarRadiation = new LightSensor(platform, accessory, `${this.accessoryId}:solarRadiation`, nameOverride || 'Solar Radiation');
    } else {
      this.solarRadiation = new LightSensor(platform, accessory, `${this.accessoryId}:solarRadiation`, 'Solar Radiation');
      this.solarRadiation.removeService();
      this.solarRadiation = undefined;
    }

    if (!utils.includesAny(hidden, ['uvIndex', `${this.shortServiceId}:uvIndex`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:uvIndex`);
      this.uvIndex = new UltravioletSensor(platform, accessory, `${this.accessoryId}:uvIndex`, nameOverride || 'UV Index');
    } else {
      this.uvIndex = new UltravioletSensor(platform, accessory, `${this.accessoryId}:uvIndex`, 'UV Index');
      this.uvIndex.removeService();
      this.uvIndex = undefined;
    }

    if (!utils.includesAny(hidden, ['winddirection', `${this.shortServiceId}:winddirection`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:winddirection`);
      this.windDirection = new WindSensor(platform, accessory, `${this.accessoryId}:winddirection`, nameOverride || 'Wind Direction');
    } else {
      this.windDirection = new WindSensor(platform, accessory, `${this.accessoryId}:winddirection`, 'Wind Direction');
      this.windDirection.removeService();
      this.windDirection = undefined;
    }

    if (!utils.includesAny(hidden, ['windspeed', `${this.shortServiceId}:windspeed`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:windspeed`);
      this.windSpeed = new WindSensor(platform, accessory, `${this.accessoryId}:windspeed`, nameOverride || 'Wind Speed');
    } else {
      this.windSpeed = new WindSensor(platform, accessory, `${this.accessoryId}:windspeed`, 'Wind Speed');
      this.windSpeed.removeService();
      this.windSpeed = undefined;
    }

    if (!utils.includesAny(hidden, ['windgustspeed', `${this.shortServiceId}:windgustspeed`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:windgustspeed`);
      this.windGust = new WindSensor(platform, accessory, `${this.accessoryId}:windgustspeed`, nameOverride || 'Wind Gust Speed');
    } else {
      this.windGust = new WindSensor(platform, accessory, `${this.accessoryId}:windgustspeed`, 'Wind Gust Speed');
      this.windGust.removeService();
      this.windGust = undefined;
    }

    if (!utils.includesAny(hidden, ['windmaxdailyspeed', `${this.shortServiceId}:windmaxdailyspeed`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:windmaxdailyspeed`);
      this.maxDailyGust = new WindSensor(platform, accessory,
        `${this.accessoryId}:windmaxdailyspeed`, nameOverride || 'Wind Max Daily Speed');
    } else {
      this.maxDailyGust = new WindSensor(platform, accessory, `${this.accessoryId}:windmaxdailyspeed`, 'Wind Max Daily Speed');
      this.maxDailyGust.removeService();
      this.maxDailyGust = undefined;
    }
  }

  //----------------------------------------------------------------------------

  public update(dataReport) {
    if (!utils.includesAll(Object.keys(dataReport), this.requiredData)) {
      throw new Error(`Update on ${this.accessoryId} requires data ${this.requiredData}`);
    } else {
      this.platform.log.debug(`Updating accessory ${this.accessoryId}`);
    }

    const batt = parseFloat(dataReport['wh68batt']);
    const batteryLevel = batt / 1.6;
    const lowBattery = batt <= 1.2;

    this.updateBatteryLevel(this.battery, utils.boundRange(batteryLevel * 100));
    this.updateStatusLowBattery(this.battery, lowBattery);

    this.solarRadiation?.update(
      parseFloat(dataReport['solarradiation']),
      dataReport.dateutc,
    );

    this.uvIndex?.update(
      parseFloat(dataReport['uv']),
      utils.lookup(this.platform.config?.thresholds, 'uvIndex'),
      dataReport.dateutc,
    );

    this.windDirection?.updateDirection(
      parseFloat(dataReport.winddir),
      dataReport.dateutc,
    );

    this.windSpeed?.updateSpeed(
      parseFloat(dataReport.windspeedmph),
      utils.lookup(this.platform.config?.thresholds, 'windSpeed'),
      dataReport.dateutc,

    );

    this.windGust?.updateSpeed(
      parseFloat(dataReport.windgustmph),
      utils.lookup(this.platform.config?.thresholds, 'windGustSpeed'),
      dataReport.dateutc,
    );

    this.maxDailyGust?.updateSpeed(
      parseFloat(dataReport.maxdailygust),
      utils.lookup(this.platform.config?.thresholds, 'windMaxDailySpeed'),
      dataReport.dateutc,
    );
  }
}
