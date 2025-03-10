import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';
import { DistanceSensor } from './../sensors/DistanceSensor';
import { BatterySensor } from './../sensors/BatterySensor';
import * as utils from './../Utils';

export class LDS01 extends EcowittAccessory {
  static readonly properties: string[] = ['airGap', 'currentDepth', 'totalDepth'];

  protected battery: BatterySensor | undefined;
  protected currentDepth: DistanceSensor | undefined;
  protected totalDepth: DistanceSensor | undefined;
  protected airGap: DistanceSensor | undefined;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected channel: number,
  ) {
    super(platform, accessory, 'LDS01', 'LDS01 Laser Distance Sensor', channel);

    this.requiredData = [`ldsbatt${this.channel}`, `air_ch${this.channel}`];
    this.optionalData = [`depth_ch${this.channel}`, `thi_ch${this.channel}`];

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

    if (!utils.includesAny(hidden, ['airGap', `${this.shortServiceId}:airGap`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:airGap`);
      this.airGap = new DistanceSensor(platform, accessory, `${this.accessoryId}:airGap`,
        nameOverride || 'Air Gap');
    } else {
      this.airGap = new DistanceSensor(platform, accessory, `${this.accessoryId}:airGap`, 'Air Gap');
      this.airGap.removeService();
      this.airGap = undefined;
    }

    if (!utils.includesAny(hidden, ['currentDepth', `${this.shortServiceId}:currentDepth`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:currentDepth`);
      this.currentDepth = new DistanceSensor(platform, accessory, `${this.accessoryId}:currentDepth`,
        nameOverride || 'Current Depth');
    } else {
      this.currentDepth = new DistanceSensor(platform, accessory, `${this.accessoryId}:currentDepth`, 'Current Depth');
      this.currentDepth.removeService();
      this.currentDepth = undefined;
    }

    if (!utils.includesAny(hidden, ['totalDepth', `${this.shortServiceId}:totalDepth`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:totalDepth`);
      this.totalDepth = new DistanceSensor(platform, accessory, `${this.accessoryId}:totalDepth`,
        nameOverride || 'Total Depth');
    } else {
      this.totalDepth = new DistanceSensor(platform, accessory, `${this.accessoryId}:totalDepth`, 'Total Depth');
      this.totalDepth.removeService();
      this.totalDepth = undefined;
    }
  }

  //----------------------------------------------------------------------------

  public update(dataReport) {
    if (!utils.includesAll(Object.keys(dataReport), this.requiredData)) {
      throw new Error(`Update on ${this.accessoryId} requires data ${this.requiredData}`);
    } else {
      this.platform.log.debug(`Updating accessory ${this.accessoryId}`);
    }

    const batt = parseFloat(dataReport[`ldsbatt${this.channel}`]);
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

    this.airGap?.updateDepth(
      parseFloat(dataReport[`air_ch${this.channel}`]),
      utils.lookup(this.platform.config?.thresholds, 'airGap'),
      dataReport.dateutc,
    );

    // optional
    if (dataReport[`depth_ch${this.channel}`] === undefined) {
      this.currentDepth?.removeService();
      this.currentDepth = undefined;
    } else {
      this.currentDepth?.updateDepth(
        parseFloat(dataReport[`depth_ch${this.channel}`]),
        utils.lookup(this.platform.config?.thresholds, 'currentDepth'),
        dataReport.dateutc,
      );
    }

    // optional
    // case when set to 0 means not set by the user
    const totalDepth = dataReport[`thi_ch${this.channel}`];
    if (totalDepth === undefined || parseFloat(totalDepth) === 0) {
      this.totalDepth?.removeService();
      this.totalDepth = undefined;
    } else {
      this.totalDepth?.updateDepth(
        parseFloat(totalDepth),
        utils.lookup(this.platform.config?.thresholds, 'totalDepth'),
        dataReport.dateutc,
      );
    }
  }
}
