import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';
import { LightningSensor } from './../sensors/LightningSensor';
import { BatterySensor } from './../sensors/BatterySensor';
import * as utils from './../Utils';

export class WH57 extends EcowittAccessory {
  static readonly properties: string[] = ['lightningEvents', 'lightningDistance', 'lightningTime'];

  protected battery: BatterySensor | undefined;
  protected lightningEvents: LightningSensor | undefined;
  protected lightningDistance: LightningSensor | undefined;
  protected lightningTime: LightningSensor | undefined;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory, 'WH57', 'WH57 Lightning Sensor');

    this.requiredData = ['wh57batt', 'lightning', 'lightning_num', 'lightning_time'];

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

    if (!utils.includesAny(hidden, ['lightningEvents', `${this.shortServiceId}:lightningEvents`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:lightningEvents`);
      this.lightningEvents = new LightningSensor(platform, accessory, `${this.accessoryId}:lightningEvents`,
        nameOverride || 'Strike Events');
    } else {
      this.lightningEvents = new LightningSensor(platform, accessory, `${this.accessoryId}:lightningEvents`, 'Strike Events');
      this.lightningEvents.removeService();
      this.lightningEvents = undefined;
    }

    if (!utils.includesAny(hidden, ['lightningDistance', `${this.shortServiceId}:lightningDistance`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:lightningDistance`);
      this.lightningDistance = new LightningSensor(platform, accessory, `${this.accessoryId}:lightningDistance`,
        nameOverride || 'Last Strike Distance');
    } else {
      this.lightningDistance = new LightningSensor(platform, accessory, `${this.accessoryId}:lightningDistance`, 'Last Strike Distance');
      this.lightningDistance.removeService();
      this.lightningDistance = undefined;
    }

    if (!utils.includesAny(hidden, ['lightningTime', `${this.shortServiceId}:lightningTime`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:lightningTime`);
      this.lightningTime = new LightningSensor(platform, accessory, `${this.accessoryId}:lightningTime`,
        nameOverride || 'Last Strike Time');
    } else {
      this.lightningTime = new LightningSensor(platform, accessory, `${this.accessoryId}:lightningTime`, 'Last Strike Time');
      this.lightningTime.removeService();
      this.lightningTime = undefined;
    }
  }

  //----------------------------------------------------------------------------

  public update(dataReport) {
    if (!utils.includesAll(Object.keys(dataReport), this.requiredData)) {
      throw new Error(`Update on ${this.accessoryId} requires data ${this.requiredData}`);
    } else {
      this.platform.log.debug(`Updating accessory ${this.accessoryId}`);
    }

    const batt = parseFloat(dataReport['wh57batt']);
    const batteryLevel = batt / 5.0;
    const lowBattery = batt <= 1.1;

    this.battery?.updateLevel(
      utils.boundRange(batteryLevel * 100),
      dataReport.dateutc,
    );

    this.battery?.updateStatusLow(
      lowBattery,
      dataReport.dateutc,
    );

    this.lightningEvents?.updateLightningEvent(
      parseFloat(dataReport['lightning_num']),
      utils.lookup(this.platform.config?.thresholds, 'lightningEvents'),
      dataReport.dateutc,
    );

    this.lightningDistance?.updateLightningDistance(
      parseFloat(dataReport['lightning']),
      utils.lookup(this.platform.config?.thresholds, 'lightningDistance'),
      dataReport.dateutc,
    );

    this.lightningTime?.updateLightningTime(
      parseFloat(dataReport['lightning_time']),
      utils.lookup(this.platform.config?.thresholds, 'lightningTime'),
      dataReport.dateutc,
    );
  }
}
