import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';
import { TemperatureSensor } from './../sensors/TemperatureSensor';
import { HumiditySensor } from './../sensors/HumiditySensor';
import { BatterySensor } from './../sensors/BatterySensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class WH26 extends EcowittAccessory {
  static readonly properties: string[] = ['temperature', 'humidity'];

  protected battery: BatterySensor | undefined;
  protected temperature: TemperatureSensor | undefined;
  protected humidity: HumiditySensor | undefined;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory, 'WH26', 'WH26 Outdoor Thermo Hygro Sensor');

    this.requiredData = ['wh26batt', 'tempf', 'humidity'];

    this.setPrimary('battery', 'Battery', BatterySensor);

    this.setPrimary('temperature', 'Temperature', TemperatureSensor);

    this.setPrimary('humidity', 'Humidity', HumiditySensor);
  }

  //----------------------------------------------------------------------------

  public update(dataReport) {
    if (!utils.includesAll(Object.keys(dataReport), this.requiredData)) {
      throw new Error(`Update on ${this.accessoryId} requires data ${this.requiredData}`);
    } else {
      this.platform.log.debug(`Updating accessory ${this.accessoryId}`);
    }

    this.battery?.updateStatusLow(
      dataReport.wh26batt === '1',
      dataReport.dateutc,
    );

    this.dispatchUpdate(dataReport, 'update', 'temperature', 'tempf');
    this.dispatchUpdate(dataReport, 'update', 'humidity', 'humidity');
  }
}
