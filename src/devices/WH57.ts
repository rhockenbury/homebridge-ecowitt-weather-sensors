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

    this.setPrimary('battery', 'Battery', BatterySensor)

    this.setPrimary('lightningEvents', 'Strike Events', LightningSensor);
    this.setThresholds('lightningEvents', 'Strike Events', LightningSensor);

    this.setPrimary('lightningDistance', 'Last Strike Distance', LightningSensor);
    this.setThresholds('lightningDistance', 'Last Strike Distance', LightningSensor);

    this.setPrimary('lightningTime', 'Last Strike Time', LightningSensor);
    this.setThresholds('lightningTime', 'Last Strike Time', LightningSensor);
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

    this.dispatchUpdate(dataReport, 'updateLightningEvent', 'lightningEvents', 'lightning_num');
    this.dispatchUpdate(dataReport, 'updateLightningDistance', 'lightningDistance', 'lightning');
    this.dispatchUpdate(dataReport, 'updateLightningTime', 'lightningTime', 'lightning_time');
  }
}
