import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';
import { WindSensor } from './../sensors/WindSensor';
import { RainSensor } from './../sensors/RainSensor';
import { BatterySensor } from './../sensors/BatterySensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class WS85 extends EcowittAccessory {
  static readonly properties: string[] = ['windDirection', 'windSpeed', 'windGustSpeed',
    'windMaxDailySpeed', 'rainRate', 'rainEventTotal', 'rainHourlyTotal', 'rainDailyTotal',
    'rainWeekyTotal', 'rainMonthlyTotal', 'rainYearlyTotal'];

  protected battery: BatterySensor | undefined;
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
    super(platform, accessory, 'WS85', 'WS85 3-in-1 Solar Weather Sensor');

    this.requiredData = [
      'wh85batt', 'winddir', 'windspeedmph', 'windgustmph', 'maxdailygust',
      'rrain_piezo', 'erain_piezo', 'hrain_piezo', 'drain_piezo', 'wrain_piezo',
      'mrain_piezo', 'yrain_piezo',
    ];
    this.unusedData = ['ws85cap_volt', 'ws85_ver'];

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

    const batt = parseFloat(dataReport['wh85batt']);
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
      parseFloat(dataReport.rrain_piezo),
      utils.lookup(this.platform.config?.thresholds, 'rainRate'),
      dataReport.dateutc,
    );

    this.eventRain?.updateTotal(
      parseFloat(dataReport.erain_piezo),
      utils.lookup(this.platform.config?.thresholds, 'rainEventTotal'),
      dataReport.dateutc,
    );

    this.hourlyRain?.updateTotal(
      parseFloat(dataReport.hrain_piezo),
      utils.lookup(this.platform.config?.thresholds, 'rainHourlyTotal'),
      dataReport.dateutc,
    );

    this.dailyRain?.updateTotal(
      parseFloat(dataReport.drain_piezo),
      utils.lookup(this.platform.config?.thresholds, 'rainDailyTotal'),
      dataReport.dateutc,
    );

    this.weeklyRain?.updateTotal(
      parseFloat(dataReport.wrain_piezo),
      utils.lookup(this.platform.config?.thresholds, 'rainWeeklyTotal'),
      dataReport.dateutc,
    );

    this.monthlyRain?.updateTotal(
      parseFloat(dataReport.mrain_piezo),
      utils.lookup(this.platform.config?.thresholds, 'rainMonthlyTotal'),
      dataReport.dateutc,
    );

    this.yearlyRain?.updateTotal(
      parseFloat(dataReport.yrain_piezo),
      utils.lookup(this.platform.config?.thresholds, 'rainYearlyTotal'),
      dataReport.dateutc,
    );
  }
}
