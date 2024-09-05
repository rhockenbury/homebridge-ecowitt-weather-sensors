import { PlatformAccessory, Service } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';
import { LeakSensor } from './../sensors/LeakSensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class WH55 extends EcowittAccessory {
  protected battery: Service;
  protected leak: LeakSensor | undefined;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected channel: number,
  ) {
    super(platform, accessory, 'WH55', 'Water Leak Sensor (WH55)', channel);

    this.requiredData = [`leakbatt${this.channel}`, `leak_ch${this.channel}`];

    this.battery = this.addBattery('', false);

    const hideConfig = this.platform.config?.hidden || {};
    const hidden = Object.keys(hideConfig).filter(k => !!hideConfig[k]);

    if (!utils.includesAny(hidden, ['waterleak', `${this.accessoryId}:waterleak`])) {
      const nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.accessoryId}:waterleak`);
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

    this.updateBatteryLevel(this.battery, utils.boundRange(batteryLevel * 100));
    this.updateStatusLowBattery(this.battery, lowBattery);

    this.leak?.update(
      parseFloat(dataReport[`leak_ch${this.channel}`]),
      dataReport.dateutc,
    );
  }
}
