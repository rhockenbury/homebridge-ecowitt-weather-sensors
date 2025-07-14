import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';
import { LightSensor } from './../sensors/LightSensor';
import { UltravioletSensor } from './../sensors/UltravioletSensor';
import { TemperatureSensor } from './../sensors/TemperatureSensor';
import { HumiditySensor } from './../sensors/HumiditySensor';
import { WindSensor } from './../sensors/WindSensor';
import { RainSensor } from './../sensors/RainSensor';
import { BatterySensor } from './../sensors/BatterySensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class WH65 extends EcowittAccessory {
  static readonly properties: string[] = ['temperature', 'humidity', 'solarRadiation',
    'uvIndex', 'windDirection', 'windSpeed', 'windGustSpeed', 'windMaxDailySpeed',
    'rainRate', 'rainEventTotal', 'rainHourlyTotal', 'rainDailyTotal', 'rainWeeklyTotal',
    'rainMonthlyTotal', 'rainYearlyTotal', 'rainTotal'];

  protected battery: BatterySensor | undefined;
  protected temperature: TemperatureSensor | undefined;
  protected humidity: HumiditySensor | undefined;
  protected solarRadiation: LightSensor | undefined;
  protected uvIndex: UltravioletSensor | undefined;
  protected windDirection: WindSensor | undefined;
  protected windSpeed: WindSensor | undefined;
  protected windGustSpeed: WindSensor | undefined;
  protected windMaxDailySpeed: WindSensor | undefined;
  protected rainRate: RainSensor | undefined;
  protected rainEventTotal: RainSensor | undefined;
  protected rainHourlyTotal: RainSensor | undefined;
  protected rainDailyTotal: RainSensor | undefined;
  protected rainWeeklyTotal: RainSensor | undefined;
  protected rainMonthlyTotal: RainSensor | undefined;
  protected rainYearlyTotal: RainSensor | undefined;
  protected rainTotal: RainSensor | undefined;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory, 'WH65', 'WH65 7-in-1 Solar Weather Sensor');

    this.requiredData = [
      'wh65batt', 'tempf', 'humidity', 'solarradiation', 'uv', 'winddir', 'windspeedmph',
      'windgustmph', 'maxdailygust', 'eventrainin', 'hourlyrainin', 'dailyrainin',
      'weeklyrainin', 'monthlyrainin'];
    this.optionalData = ['yearlyrainin', 'rainratein', 'totalrainin'];

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

    this.setPrimary('rainRate', 'Rain Rate', RainSensor);
    this.setThresholds('rainRate', 'Rain Rate', RainSensor);

    this.setPrimary('rainEventTotal', 'Rain Event Total', RainSensor);
    this.setThresholds('rainEventTotal', 'Rain Event Total', RainSensor);

    this.setPrimary('rainHourlyTotal', 'Rain Hourly Total', RainSensor);
    this.setThresholds('rainHourlyTotal', 'Rain Hourly Total', RainSensor);

    this.setPrimary('rainDailyTotal', 'Rain Daily Total', RainSensor);
    this.setThresholds('rainDailyTotal', 'Rain Daily Total', RainSensor);

    this.setPrimary('rainWeeklyTotal', 'Rain Weekly Total', RainSensor);
    this.setThresholds('rainWeeklyTotal', 'Rain Weekly Total', RainSensor);

    this.setPrimary('rainMonthlyTotal', 'Rain Monthly Total', RainSensor);
    this.setThresholds('rainMonthlyTotal', 'Rain Monthly Total', RainSensor);

    this.setPrimary('rainYearlyTotal', 'Rain Yearly Total', RainSensor);
    this.setThresholds('rainYearlyTotal', 'Rain Yearly Total', RainSensor);

    this.setPrimary('rainTotal', 'Rain Total', RainSensor);
    this.setThresholds('rainTotal', 'Rain Total', RainSensor);
  }

  //----------------------------------------------------------------------------

  public update(dataReport) {
    if (!utils.includesAll(Object.keys(dataReport), this.requiredData)) {
      throw new Error(`Update on ${this.accessoryId} requires data ${this.requiredData}`);
    } else {
      this.platform.log.debug(`Updating accessory ${this.accessoryId}`);
    }

    this.platform.log.error(`accessory HELLO ${JSON.stringify(this.thresholds, undefined, 2)}`);

    this.battery?.updateStatusLow(
      dataReport.wh65batt === '1',
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
    this.dispatchUpdate(dataReport, 'updateTotal', 'rainEventTotal', 'eventrainin');
    this.dispatchUpdate(dataReport, 'updateTotal', 'rainHourlyTotal', 'hourlyrainin');
    this.dispatchUpdate(dataReport, 'updateTotal', 'rainDailyTotal', 'dailyrainin');
    this.dispatchUpdate(dataReport, 'updateTotal', 'rainWeeklyTotal', 'weeklyrainin');
    this.dispatchUpdate(dataReport, 'updateTotal', 'rainMonthlyTotal', 'monthlyrainin');

    this.dispatchOptionalUpdate(dataReport, 'updateTotal', 'rainYearlyTotal', 'yearlyrainin');
    this.dispatchOptionalUpdate(dataReport, 'updateRate', 'rainRate', 'rainratein');
    this.dispatchOptionalUpdate(dataReport, 'updateTotal', 'rainTotal', 'totalrainin');
  }
}
