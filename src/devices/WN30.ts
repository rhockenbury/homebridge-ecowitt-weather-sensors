import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';
import { TemperatureSensor } from './../sensors/TemperatureSensor';
import { BatterySensor } from './../sensors/BatterySensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class WN30 extends EcowittAccessory {
  static readonly properties: string[] = ['temperature'];

  protected battery: BatterySensor | undefined;
  protected temperature: TemperatureSensor | undefined;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected channel: number,
  ) {
    super(platform, accessory, 'WN30', 'WN30 Thermo Sensor', channel);

    this.requiredData = [`batt${this.channel}`, `temp${this.channel}f`];

    this.setPrimary('battery', 'Battery', BatterySensor);

    this.setPrimary('temperature', 'Temperature', TemperatureSensor);
  }

  //----------------------------------------------------------------------------

  public update(dataReport) {
    if (!utils.includesAll(Object.keys(dataReport), this.requiredData)) {
      throw new Error(`Update on ${this.accessoryId} requires data ${this.requiredData}`);
    } else {
      this.platform.log.debug(`Updating accessory ${this.accessoryId}`);
    }

    this.battery?.updateStatusLow(
      dataReport[`batt${this.channel}`] === '1',
      dataReport.dateutc,
    );

    this.dispatchUpdate(dataReport, 'update', 'temperature', `temp${this.channel}f`);
  }
}
