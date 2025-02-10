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
    'uvIndex', 'windDirection', 'windSpeed', 'windGustSpeed', 'windMaxDailySpeed', 'rainRate',
    'rainEventTotal', 'rainHourlyTotal', 'rainDailyTotal', 'rainWeekyTotal', 'rainMonthlyTotal',
    'rainYearlyTotal'];

  protected battery: BatterySensor | undefined;
  protected temperature: TemperatureSensor | undefined;
  protected humidity: HumiditySensor | undefined;
  protected solarRadiation: LightSensor | undefined;
  protected uvIndex: UltravioletSensor | undefined;
  protected windDirection: WindSensor | undefined;
  protected windSpeed: WindSensor | undefined;
  protected windGust: WindSensor | undefined;
  protected maxDailyGust: WindSensor | undefined;
  protected rainRate: RainSensor | undefined;
  protected eventRain: RainSensor | undefined;
  protected hourlyRain: RainSensor | undefined;
  protected dailyRain: RainSensor | undefined;
  protected weeklyRain: RainSensor | undefined;
  protected monthlyRain: RainSensor | undefined;
  protected yearlyRain: RainSensor | undefined;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory, 'WH65', 'WH65 7-in-1 Solar Weather Sensor');

    this.requiredData = [
      'wh65batt', 'tempf', 'humidity', 'solarradiation', 'uv', 'winddir', 'windspeedmph',
      'windgustmph', 'maxdailygust', 'rainratein', 'eventrainin', 'hourlyrainin',
      'dailyrainin', 'weeklyrainin', 'monthlyrainin', 'yearlyrainin'];
    this.optionalData = [];
    this.unusedData = ['totalrainin'];

    const hideConfig = this.platform.config?.hidden || {};
    const hidden = Object.keys(hideConfig).filter(k => !!hideConfig[k]);

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

    if (!utils.includesAny(hidden, ['rainrate', `${this.shortServiceId}:rainrate`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:rainrate`);
      this.rainRate = new RainSensor(platform, accessory, `${this.accessoryId}:rainrate`, nameOverride || 'Rain Rate');
    } else {
      this.rainRate = new RainSensor(platform, accessory, `${this.accessoryId}:rainrate`, 'Rain Rate');
      this.rainRate.removeService();
      this.rainRate = undefined;
    }

    if (!utils.includesAny(hidden, ['raineventtotal', `${this.shortServiceId}:raineventtotal`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:raineventtotal`);
      this.eventRain = new RainSensor(platform, accessory, `${this.accessoryId}:raineventtotal`, nameOverride || 'Rain Event Total');
    } else {
      this.eventRain = new RainSensor(platform, accessory, `${this.accessoryId}:raineventtotal`, 'Rain Event Total');
      this.eventRain.removeService();
      this.eventRain = undefined;
    }

    if (!utils.includesAny(hidden, ['rainhourlytotal', `${this.shortServiceId}:rainhourlytotal`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:rainhourlytotal`);
      this.hourlyRain = new RainSensor(platform, accessory, `${this.accessoryId}:rainhourlytotal`, nameOverride || 'Rain Hourly Total');
    } else {
      this.hourlyRain = new RainSensor(platform, accessory, `${this.accessoryId}:rainhourlytotal`, 'Rain Hourly Total');
      this.hourlyRain.removeService();
      this.hourlyRain = undefined;
    }

    if (!utils.includesAny(hidden, ['raindailytotal', `${this.shortServiceId}:raindailytotal`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:raindailytotal`);
      this.dailyRain = new RainSensor(platform, accessory, `${this.accessoryId}:raindailytotal`, nameOverride || 'Rain Daily Total');
    } else {
      this.dailyRain = new RainSensor(platform, accessory, `${this.accessoryId}:raindailytotal`, 'Rain Daily Total');
      this.dailyRain.removeService();
      this.dailyRain = undefined;
    }

    if (!utils.includesAny(hidden, ['rainweeklytotal', `${this.shortServiceId}:rainweeklytotal`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:rainweeklytotal`);
      this.weeklyRain = new RainSensor(platform, accessory, `${this.accessoryId}:rainweeklytotal`, nameOverride || 'Rain Weekly Total');
    } else {
      this.weeklyRain = new RainSensor(platform, accessory, `${this.accessoryId}:rainweeklytotal`, 'Rain Weekly Total');
      this.weeklyRain.removeService();
      this.weeklyRain = undefined;
    }

    if (!utils.includesAny(hidden, ['rainmonthlytotal', `${this.shortServiceId}:rainmonthlytotal`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:rainmonthlytotal`);
      this.monthlyRain = new RainSensor(platform, accessory, `${this.accessoryId}:rainmonthlytotal`, nameOverride || 'Rain Monthly Total');
    } else {
      this.monthlyRain = new RainSensor(platform, accessory, `${this.accessoryId}:rainmonthlytotal`, 'Rain Monthly Total');
      this.monthlyRain.removeService();
      this.monthlyRain = undefined;
    }

    if (!utils.includesAny(hidden, ['rainyearlytotal', `${this.shortServiceId}:rainyearlytotal`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:rainyearlytotal`);
      this.yearlyRain = new RainSensor(platform, accessory, `${this.accessoryId}:rainyearlytotal`, nameOverride || 'Rain Yearly Total');
    } else {
      this.yearlyRain = new RainSensor(platform, accessory, `${this.accessoryId}:rainyearlytotal`, 'Rain Yearly Total');
      this.yearlyRain.removeService();
      this.yearlyRain = undefined;
    }
  }

  //----------------------------------------------------------------------------

  public update(dataReport) {
    if (!utils.includesAll(Object.keys(dataReport), this.requiredData)) {
      throw new Error(`Update on ${this.accessoryId} requires data ${this.requiredData}`);
    } else {
      this.platform.log.debug(`Updating accessory ${this.accessoryId}`);
    }

    this.battery?.updateStatusLow(
      dataReport.wh65batt === '1',
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

    this.rainRate?.updateRate(
      parseFloat(dataReport.rainratein),
      utils.lookup(this.platform.config?.thresholds, 'rainRate'),
      dataReport.dateutc,
    );

    this.eventRain?.updateTotal(
      parseFloat(dataReport.eventrainin),
      utils.lookup(this.platform.config?.thresholds, 'rainEventTotal'),
      dataReport.dateutc,
    );

    this.hourlyRain?.updateTotal(
      parseFloat(dataReport.hourlyrainin),
      utils.lookup(this.platform.config?.thresholds, 'rainHourlyTotal'),
      dataReport.dateutc,
    );

    this.dailyRain?.updateTotal(
      parseFloat(dataReport.dailyrainin),
      utils.lookup(this.platform.config?.thresholds, 'rainDailyTotal'),
      dataReport.dateutc,
    );

    this.weeklyRain?.updateTotal(
      parseFloat(dataReport.weeklyrainin),
      utils.lookup(this.platform.config?.thresholds, 'rainWeeklyTotal'),
      dataReport.dateutc,
    );

    this.monthlyRain?.updateTotal(
      parseFloat(dataReport.monthlyrainin),
      utils.lookup(this.platform.config?.thresholds, 'rainMonthlyTotal'),
      dataReport.dateutc,
    );

    this.yearlyRain?.updateTotal(
      parseFloat(dataReport.yearlyrainin),
      utils.lookup(this.platform.config?.thresholds, 'rainYearlyTotal'),
      dataReport.dateutc,
    );
  }
}
