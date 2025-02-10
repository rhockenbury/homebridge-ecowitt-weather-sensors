import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';
import { LeakSensor } from './../sensors/LeakSensor';
import { BatterySensor } from './../sensors/BatterySensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class WH55 extends EcowittAccessory {
  static readonly properties: string[] = ['waterLeak'];

  protected battery: BatterySensor | undefined;
  protected leak: LeakSensor | undefined;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected channel: number,
  ) {
    super(platform, accessory, 'WH55', 'WH55 Water Leak Sensor', channel);

    this.requiredData = [`leakbatt${this.channel}`, `leak_ch${this.channel}`];

    const hideConfig = this.platform.config?.hidden || {};
    const hidden = Object.keys(hideConfig).filter(k => !!hideConfig[k]);

    if (!utils.includesAny(hidden, ['battery', `${this.shortServiceId}:battery`])) {
      const nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:battery`);
      this.battery = new BatterySensor(platform, accessory, `${this.accessoryId}:battery`, nameOverride || 'Battery');
    } else {
      this.battery = new BatterySensor(platform, accessory, `${this.accessoryId}:battery`, 'Battery');
      this.battery.removeService();
      this.battery = undefined;
    }

    if (!utils.includesAny(hidden, ['waterleak', `${this.shortServiceId}:waterleak`])) {
      const nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:waterleak`);
      this.leak = new LeakSensor(platform, accessory, `${this.accessoryId}:waterleak`, nameOverride || 'Water Leak');
    } else {
      this.leak = new LeakSensor(platform, accessory, `${this.accessoryId}:waterleak`, 'Water Leak');
      this.leak.removeService();
      this.leak = undefined;
    }
  }

  //----------------------------------------------------------------------------

  public update(dataReport) {
    if (!utils.includesAll(Object.keys(dataReport), this.requiredData)) {
      throw new Error(`Update on ${this.accessoryId} requires data ${this.requiredData}`);
    } else {
      this.platform.log.debug(`Updating accessory ${this.accessoryId}`);
    }

    const batteryLevel = parseFloat(dataReport[`leakbatt${this.channel}`]) / 5.0;
    const lowBattery = batteryLevel <= 0.2;

    this.battery?.updateLevel(
      utils.boundRange(batteryLevel * 100),
      dataReport.dateutc,
    );

    this.battery?.updateStatusLow(
      lowBattery,
      dataReport.dateutc,
    );

    this.leak?.update(
      parseFloat(dataReport[`leak_ch${this.channel}`]),
      dataReport.dateutc,
    );
  }
}
