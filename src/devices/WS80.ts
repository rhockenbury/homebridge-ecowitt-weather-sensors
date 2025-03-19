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
  protected windGustSpeed: WindSensor | undefined;
  protected windMaxDailySpeed: WindSensor | undefined;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory, 'WS80', 'WS80 6-in-1 Solar Weather Sensor');

    this.requiredData = [
      'wh80batt', 'tempf', 'humidity', 'solarradiation', 'uv', 'winddir', 'windspeedmph',
      'windgustmph', 'maxdailygust'];

    this.setPrimary('battery', 'Battery', BatterySensor);

    this.setPrimary('temperature', 'Temperature', TemperatureSensor);

    this.setPrimary('humidity', 'Humidity', HumiditySensor);

    this.setPrimary('solarRadiation', 'Solar Radiation', LightSensor);

    this.setPrimary('uvIndex', 'UV Index', UltravioletSensor);
    this.setThresholds('uvIndex', 'UV Index', UltravioletSensor);

    this.setPrimary('windDirection', 'Wind Direction', WindSensor);
    this.setThresholds('windDirection', 'Wind Direction', WindSensor);

    this.setPrimary('windSpeed', 'Wind Speed', WindSensor);
    this.setThresholds('windSpeed', 'Wind Speed', WindSensor);

    this.setPrimary('windGustSpeed', 'Wind Gust Speed', WindSensor);
    this.setThresholds('windGustSpeed', 'Wind Gust Speed', WindSensor);

    this.setPrimary('windMaxDailySpeed', 'Wind Max Daily Speed', WindSensor);
    this.setThresholds('windMaxDailySpeed', 'Wind Max Daily Speed', WindSensor);
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

    this.dispatchUpdate(dataReport, 'update', 'temperature', 'tempf');
    this.dispatchUpdate(dataReport, 'update', 'humidity', 'humidity');
    this.dispatchUpdate(dataReport, 'update', 'solarRadiation', 'solarradiation');
    this.dispatchUpdate(dataReport, 'update', 'uvIndex', 'uv');
    this.dispatchUpdate(dataReport, 'updateDirection', 'windDirection', 'winddir');
    this.dispatchUpdate(dataReport, 'updateSpeed', 'windSpeed', 'windspeedmph');
    this.dispatchUpdate(dataReport, 'updateSpeed', 'windGustSpeed', 'windgustmph');
    this.dispatchUpdate(dataReport, 'updateSpeed', 'windMaxDailySpeed', 'maxdailygust');
  }
}
