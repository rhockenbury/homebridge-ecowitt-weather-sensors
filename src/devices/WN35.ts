import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';
import { HumiditySensor } from './../sensors/HumiditySensor';
import { BatterySensor } from './../sensors/BatterySensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class WN35 extends EcowittAccessory {
  static readonly properties: string[] = ['leafWetness'];

  protected battery: BatterySensor | undefined;
  protected leafWetness: HumiditySensor | undefined;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected channel: number,
  ) {
    super(platform, accessory, 'WN35', 'WN35 Leaf Wetness Sensor', channel);

    this.requiredData = [`leaf_batt${this.channel}`, `leafwetness_ch${this.channel}`];

    const hideConfig = this.platform.config?.hidden || {};
    const hidden = Object.keys(hideConfig).filter(k => !!hideConfig[k]);

    if (!utils.includesAny(hidden, ['battery', `${this.shortServiceId}:battery`])) {
      const batteryName = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:battery`);
      this.battery = new BatterySensor(platform, accessory, `${this.accessoryId}:battery`, batteryName || 'Battery');
    } else {
      this.battery = new BatterySensor(platform, accessory, `${this.accessoryId}:battery`, 'Battery');
      this.battery.removeService();
      this.battery = undefined;
    }

    if (!utils.includesAny(hidden, ['leafWetness', `${this.shortServiceId}:leafWetness`])) {
      const leafWetnessName = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:leafWetness`);
      this.leafWetness = new HumiditySensor(platform, accessory, `${this.accessoryId}:leafWetness`, leafWetnessName || 'Leaf Wetness');
    } else {
      this.leafWetness = new HumiditySensor(platform, accessory, `${this.accessoryId}:leafWetness`, 'Leaf Wetness');
      this.leafWetness.removeService();
      this.leafWetness = undefined;
    }
  }

  //----------------------------------------------------------------------------

  public update(dataReport) {
    if (!utils.includesAll(Object.keys(dataReport), this.requiredData)) {
      throw new Error(`Update on ${this.accessoryId} requires data ${this.requiredData}`);
    } else {
      this.platform.log.debug(`Updating accessory ${this.accessoryId}`);
    }

    const batt = parseFloat(dataReport[`leaf_batt${this.channel}`]);
    const batteryLevel = batt / 1.6;
    const lowBattery = batt <= 1.2;

    this.battery?.updateLevel(
      utils.boundRange(batteryLevel * 100),
      dataReport.dateutc,
    );

    this.battery?.updateStatusLow(
      lowBattery,
      dataReport.dateutc,
    );

    this.leafWetness?.update(
      parseFloat(dataReport[`leafwetness_ch${this.channel}`]),
      dataReport.dateutc,
    );
  }
}
