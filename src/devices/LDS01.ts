import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';
import { DistanceSensor } from './../sensors/DistanceSensor';
import { BatterySensor } from './../sensors/BatterySensor';
import * as utils from './../Utils';

export class LDS01 extends EcowittAccessory {
  static readonly properties: string[] = ['airGap', 'currentDepth', 'totalDepth'];

  protected battery: BatterySensor | undefined;
  protected airGap: DistanceSensor | undefined;
  protected currentDepth: DistanceSensor | undefined;
  protected totalDepth: DistanceSensor | undefined;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected channel: number,
  ) {
    super(platform, accessory, 'LDS01', 'LDS01 Laser Distance Sensor', channel);

    this.requiredData = [`ldsbatt${this.channel}`, `air_ch${this.channel}`];
    this.optionalData = [`depth_ch${this.channel}`, `thi_ch${this.channel}`];

    this.setPrimary('battery', 'Battery', BatterySensor);

    this.setPrimary('airGap', 'Air Gap', DistanceSensor);
    this.setThresholds('airGap', 'Air Gap', DistanceSensor);

    this.setPrimary('currentDepth', 'Current Depth', DistanceSensor);
    this.setThresholds('currentDepth', 'Current Depth', DistanceSensor);

    this.setPrimary('totalDepth', 'Total Depth', DistanceSensor);
    this.setThresholds('totalDepth', 'Total Depth', DistanceSensor);
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

    this.dispatchUpdate(dataReport, 'updateDepth', 'airGap', `air_ch${this.channel}`);

    this.dispatchOptionalUpdate(dataReport, 'updateDepth', 'currentDepth', `depth_ch${this.channel}`);
    this.dispatchOptionalUpdate(dataReport, 'updateDepth', 'totalDepth', `thi_ch${this.channel}`);
  }
}
