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
  protected waterLeak: LeakSensor | undefined;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected channel: number,
  ) {
    super(platform, accessory, 'WH55', 'WH55 Water Leak Sensor', channel);

    this.requiredData = [`leakbatt${this.channel}`, `leak_ch${this.channel}`];

    this.setPrimary('battery', 'Battery', BatterySensor);

    this.setPrimary('waterLeak', 'Water Leak', LeakSensor);
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

    this.dispatchUpdate(dataReport, 'update', 'waterLeak', `leak_ch${this.channel}`);
  }
}
