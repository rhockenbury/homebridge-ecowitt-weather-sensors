import { Service, PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './EcowittPlatform';
import { EcowittAccessory } from './EcowittAccessory';

import { RainSensor } from './RainSensor';

export class WH40 extends EcowittAccessory {
  protected name: string;

  protected battery: Service;

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
    super(platform, accessory);

    this.setModel(
      'WH40',
      'Self-Emptying Rain Collector Rainfall Sensor');

    this.name = "Rainfall Sensor"
    this.battery = this.addBattery(this.name);

    const rainHide = this.platform.config?.ws?.rain?.hide || [];

    if (!rainHide.includes('Rate')) {
      this.rainRate = new RainSensor(platform, accessory, 'Rain Rate');
    }

    if (!rainHide.includes('Event')) {
      this.eventRain = new RainSensor(platform, accessory, 'Event Rain');
    }

    if (!rainHide.includes('Hourly')) {
      this.hourlyRain = new RainSensor(platform, accessory, 'Hourly Rain');
    }

    if (!rainHide.includes('Daily')) {
      this.dailyRain = new RainSensor(platform, accessory, 'Daily Rain');
    }

    if (!rainHide.includes('Weekly')) {
      this.weeklyRain = new RainSensor(platform, accessory, 'Weekly Rain');
    }

    if (!rainHide.includes('Monthly')) {
      this.monthlyRain = new RainSensor(platform, accessory, 'Monthly Rain');
    }

    if (!rainHide.includes('Yearly')) {
      this.yearlyRain = new RainSensor(platform, accessory, 'Yearly Rain');
    }
  }

  update(dataReport) {
    const rainbatt = dataReport.wh40batt;

    this.platform.log.info(`WH40 Update`);
    this.platform.log.info('  wh40batt:', rainbatt);

    this.platform.log.info('  rainratein:', dataReport.rainratein);
    this.platform.log.info('  eventrainin:', dataReport.eventrainin);
    this.platform.log.info('  hourlyrainin:', dataReport.hourlyrainin);
    this.platform.log.info('  dailyrainin:', dataReport.dailyrainin);
    this.platform.log.info('  weeklyrainin:', dataReport.weeklyrainin);
    this.platform.log.info('  monthlyrainin:', dataReport.monthlyrainin);
    this.platform.log.info('  yearlyrainin:', dataReport.yearlyrainin);

    const voltage = parseFloat(rainbatt);
    const lowBattery = voltage <= 1.1;

    this.updateBatteryLevel(this.battery, voltage / 1.6 * 100);
    this.updateStatusLowBattery(this.battery, lowBattery);

    this.rainRate?.updateRate(parseFloat(dataReport.rainratein), this.platform.config.ws?.rain?.rateThreshold);
    this.eventRain?.updateTotal(parseFloat(dataReport.eventrainin), this.platform.config.ws?.rain?.eventThreshold);
    this.hourlyRain?.updateTotal(parseFloat(dataReport.hourlyrainin), this.platform.config.ws?.rain?.hourlyThreshold);
    this.dailyRain?.updateTotal(parseFloat(dataReport.dailyrainin), this.platform.config.ws?.rain?.dailyThreshold);
    this.weeklyRain?.updateTotal(parseFloat(dataReport.weeklyrainin), this.platform.config.ws?.rain?.weeklyThreshold);
    this.monthlyRain?.updateTotal(parseFloat(dataReport.monthlyrainin), this.platform.config.ws?.rain?.monthlyThreshold);
    this.yearlyRain?.updateTotal(parseFloat(dataReport.yearlyrainin), this.platform.config.ws?.rain?.yearlyThreshold);
  }
}
