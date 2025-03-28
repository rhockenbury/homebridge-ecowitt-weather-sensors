import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';
import { RainSensor } from './../sensors/RainSensor';
import { BatterySensor } from './../sensors/BatterySensor';
import * as utils from './../Utils';

export class WH40 extends EcowittAccessory {
  static readonly properties: string[] = ['rainEventTotal', 'rainHourlyTotal',
    'rainDailyTotal', 'rainWeekyTotal', 'rainMonthlyTotal', 'rainYearlyTotal'];

  protected battery: BatterySensor | undefined;
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
    super(platform, accessory, 'WH40', 'WH40 Rainfall Sensor');

    this.requiredData = [
      'wh40batt', 'eventrainin', 'hourlyrainin', 'dailyrainin',
      'weeklyrainin', 'monthlyrainin'];
    this.optionalData = ['yearlyrainin', 'rainratein'];
    this.unusedData = ['totalrainin'];

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

    const batt = parseFloat(dataReport['wh40batt']);
    const batteryLevel = batt / 1.6;
    const lowBattery = batt <= 1.1;

    this.battery?.updateLevel(
      utils.boundRange(batteryLevel * 100),
      dataReport.dateutc,
    );

    this.battery?.updateStatusLow(
      lowBattery,
      dataReport.dateutc,
    );

    if (dataReport.rainratein === undefined) {
      this.rainRate?.removeService();
      this.rainRate = undefined;
    } else {
      this.rainRate?.updateRate(
        parseFloat(dataReport.rainratein),
        utils.lookup(this.platform.config?.thresholds, 'rainRate'),
        dataReport.dateutc,
      );
    }

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

    if (dataReport.yearlyrainin === undefined) {
      this.yearlyRain?.removeService();
      this.yearlyRain = undefined;
    } else {
      this.yearlyRain?.updateTotal(
        parseFloat(dataReport.yearlyrainin),
        utils.lookup(this.platform.config?.thresholds, 'rainYearlyTotal'),
        dataReport.dateutc,
      );
    }
  }
}
