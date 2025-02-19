import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';
import { LightSensor } from './../sensors/LightSensor';
import { UltravioletSensor } from './../sensors/UltravioletSensor';
import { TemperatureSensor } from './../sensors/TemperatureSensor';
import { HumiditySensor } from './../sensors/HumiditySensor';
import { WindSensor } from './../sensors/WindSensor';
import { BatterySensor } from './../sensors/BatterySensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class WS80 extends EcowittAccessory {
  static readonly properties: string[] = ['temperature', 'humidity', 'solarRadiation',
    'uvIndex', 'windDirection', 'windSpeed', 'windGustSpeed', 'windMaxDailySpeed'];

  protected battery: BatterySensor | undefined;
  protected temperature: TemperatureSensor | undefined;
  protected humidity: HumiditySensor | undefined;
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
    super(platform, accessory, 'WS80', 'WS80 6-in-1 Solar Weather Sensor');

    this.requiredData = [
      'wh80batt', 'tempf', 'humidity', 'solarradiation', 'uv', 'winddir', 'windspeedmph',
      'windgustmph', 'maxdailygust'];

    const hideConfig = this.platform.config?.hidden || {};
    const hideConfigCustom = this.platform.config?.customHidden || [];
    const hidden = Object.keys(hideConfig).filter(k => !!hideConfig[k]).concat(hideConfigCustom);

    let nameOverride: string | undefined;

    if (!utils.includesAny(hidden, ['battery', `${this.shortServiceId}:battery`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:battery`);
      this.battery = new BatterySensor(platform, accessory, `${this.accessoryId}:battery`, nameOverride || 'Battery');
    } else {
      this.battery = new BatterySensor(platform, accessory, `${this.accessoryId}:battery`, 'Battery');
      this.battery.removeService();
      this.battery = undefined;
    }

    if (!utils.includesAny(hidden, ['temperature', `${this.shortServiceId}:temperature`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:temperature`);
      this.temperature = new TemperatureSensor(platform, accessory, `${this.accessoryId}:temperature`, nameOverride || 'Temperature');
    } else {
      this.temperature = new TemperatureSensor(platform, accessory, `${this.accessoryId}:temperature`, 'Temperature');
      this.temperature.removeService();
      this.temperature = undefined;
    }

    if (!utils.includesAny(hidden, ['humidity', `${this.shortServiceId}:humidity`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:humidity`);
      this.humidity = new HumiditySensor(platform, accessory, `${this.accessoryId}:humidity`, nameOverride || 'Humidity');
    } else {
      this.humidity = new HumiditySensor(platform, accessory, `${this.accessoryId}:humidity`, 'Humidity');
      this.humidity.removeService();
      this.humidity = undefined;
    }

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

    const batt = parseFloat(dataReport['wh80batt']);
    const batteryLevel = batt / 3.3;
    const lowBattery = batt <= 2.3;

    this.battery?.updateLevel(
      utils.boundRange(batteryLevel * 100),
      dataReport.dateutc,
    );

    this.battery?.updateStatusLow(
      lowBattery,
      dataReport.dateutc,
    );

    this.temperature?.update(
      parseFloat(dataReport['tempf']),
      dataReport.dateutc,
    );

    this.humidity?.update(
      parseFloat(dataReport['humidity']),
      dataReport.dateutc,
    );

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
