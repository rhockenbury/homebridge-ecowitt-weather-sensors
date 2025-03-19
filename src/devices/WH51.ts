import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';
import { HumiditySensor } from './../sensors/HumiditySensor';
import { BatterySensor } from './../sensors/BatterySensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class WH51 extends EcowittAccessory {
  static readonly properties: string[] = ['soilMoisture'];

  protected battery: BatterySensor | undefined;
  protected soilMoisture: HumiditySensor | undefined;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected channel: number,
  ) {
    super(platform, accessory, 'WH51', 'WH51 Soil Moisture Sensor', channel);

    this.requiredData = [`soilbatt${this.channel}`, `soilmoisture${this.channel}`];
    this.unusedData = [`soilad${this.channel}`];

    this.setPrimary('battery', 'Battery', BatterySensor);

    this.setPrimary('soilMoisture', 'Soil Moisture', HumiditySensor);
  }

  //----------------------------------------------------------------------------

  public update(dataReport) {
    if (!utils.includesAll(Object.keys(dataReport), this.requiredData)) {
      throw new Error(`Update on ${this.accessoryId} requires data ${this.requiredData}`);
    } else {
      this.platform.log.debug(`Updating accessory ${this.accessoryId}`);
    }

    const batt = parseFloat(dataReport[`soilbatt${this.channel}`]);
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

    this.dispatchUpdate(dataReport, 'update', 'soilMoisture', `soilmoisture${this.channel}`);
  }
}
