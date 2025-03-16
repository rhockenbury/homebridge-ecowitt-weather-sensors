import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';
import { RainSensor } from './../sensors/RainSensor';
import { BatterySensor } from './../sensors/BatterySensor';
import * as utils from './../Utils';

export class WH40 extends EcowittAccessory {
  static readonly properties: string[] = ['rainRate', 'rainEventTotal', 'rainHourlyTotal',
    'rainDailyTotal', 'rainWeeklyTotal', 'rainMonthlyTotal', 'rainYearlyTotal', 'rainTotal'];

  protected battery: BatterySensor | undefined;
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
    super(platform, accessory, 'WH40', 'WH40 Rainfall Sensor');

    this.requiredData = [
      'wh40batt', 'eventrainin', 'hourlyrainin', 'dailyrainin',
      'weeklyrainin', 'monthlyrainin', 'yearlyrainin',
    ];
    this.optionalData = ['rainratein', 'totalrainin'];

    this.setPrimary('battery', 'Battery', BatterySensor)

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

    this.dispatchUpdate(dataReport, 'updateTotal', 'rainEventTotal', 'eventrainin');
    this.dispatchUpdate(dataReport, 'updateTotal', 'rainHourlyTotal', 'hourlyrainin');
    this.dispatchUpdate(dataReport, 'updateTotal', 'rainDailyTotal', 'dailyrainin');
    this.dispatchUpdate(dataReport, 'updateTotal', 'rainWeeklyTotal', 'weeklyrainin');
    this.dispatchUpdate(dataReport, 'updateTotal', 'rainMonthlyTotal', 'monthlyrainin');
    this.dispatchUpdate(dataReport, 'updateTotal', 'rainYearlyTotal', 'yearlyrainin');

    this.dispatchOptionalUpdate(dataReport, 'updateRate', 'rainRate', 'rainratein');
    this.dispatchOptionalUpdate(dataReport, 'updateTotal', 'rainTotal', 'totalrainin');
  }
}
