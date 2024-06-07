import { Service, PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './EcowittPlatform';
import { EcowittAccessory } from './EcowittAccessory';

import { ContactSensor } from './ContactSensor';
import { OccupancySensor } from './OccupancySensor';

export class WH57 extends EcowittAccessory {
  protected battery: Service;
  protected events: ContactSensor;
  protected timeDistance: OccupancySensor;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory, 'WH57', 'Lightning Detector Sensor');

    this.events = new ContactSensor(platform, accessory, 'Events');
    this.timeDistance = new OccupancySensor(
      platform,
      accessory,
      'Time/Distance',
    );
    this.battery = this.addBattery('⚡');
  }

  update(dataReport) {
    this.platform.log.info(`${this.model} Update`);
    this.platform.log.info('  wh57batt:', dataReport.wh57batt);
    this.platform.log.info('  lightning:', dataReport.lightning);
    this.platform.log.info('  lightning_num:', dataReport.lightning_num);
    this.platform.log.info('  lightning_time:', dataReport.lightning_time);

    // Battery

    const batteryLevel = parseFloat(dataReport.wh57batt) / 5;
    const lowBattery = batteryLevel <= 0.2;

    this.updateBatteryLevel(this.battery, batteryLevel * 100);
    this.updateStatusLowBattery(this.battery, lowBattery);

    // Detection

    const lightningNum = parseInt(dataReport.lightning_num);

    // Strike count

    this.events.updateState(lightningNum <= 0);
    this.events.updateStatusLowBattery(lowBattery);
    this.events.updateName(`⚡ ${lightningNum}`);

    // Time & Distance

    const lightningTime = parseInt(dataReport.lightning_time);

    let timeText = '';

    if (lightningTime > 0) {
      const ms = lightningTime;
      let s = Math.floor(ms / 1000);
      let m = Math.floor(s / 60);
      s = s % 60;
      let h = Math.floor(m / 60);
      m = m % 60;
      const d = Math.floor(h / 24);
      h = h % 24;

      // eslint-disable-next-line no-inner-declarations
      function appendTime(text: string) {
        if (timeText) {
          timeText += ',';
        }

        timeText += text;
      }

      if (d > 1) {
        appendTime(`${d} days`);
      } else if (d || h || m) {
        if (d) {
          appendTime(d > 1 ? `${d} days` : '1 day');
        }
        if (h) {
          appendTime(h > 1 ? `${h} hours` : '1 hour');
        }
        if (m) {
          appendTime(m > 1 ? `${m} minutes` : '1 minute');
        }
      } else if (s) {
        appendTime(s > 1 ? `${s} seconds` : '1 second');
      }

      timeText += ' ago';
    }

    let distanceUnits = '';
    let distance = 0;

    switch (this.platform.config.lightning.units) {
      case 'mi':
        distance = Math.round((dataReport.lightning / 1.609) * 10) / 10;
        distanceUnits = 'mi';
        break;

      case 'km':
      default:
        distance = dataReport.lightning;
        distanceUnits = 'km';
        break;
    }

    this.timeDistance.updateName(`⚡${distance} ${distanceUnits} ${timeText}`);
    this.timeDistance.updateOccupancyDetected(lightningNum > 0);
    this.timeDistance.updateStatusLowBattery(lowBattery);
  }
}
