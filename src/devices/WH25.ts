import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';
import { TemperatureSensor } from './../sensors/TemperatureSensor';
import { HumiditySensor } from './../sensors/HumiditySensor';
import { BatterySensor } from './../sensors/BatterySensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class WH25 extends EcowittAccessory {
  static readonly properties: string[] = ['indoorTemperature', 'indoorHumidity'];

  protected battery: BatterySensor | undefined;
  protected indoorTemperature: TemperatureSensor | undefined;
  protected indoorHumidity: HumiditySensor | undefined;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory, 'WH25', 'WH25 Indoor Thermo Hygro Baro Sensor');

    this.requiredData = ['wh25batt', 'tempinf', 'humidityin'];
    this.unusedData = ['baromrelin', 'baromabsin'];

    this.setPrimary('battery', 'Battery', BatterySensor);

    this.setPrimary('indoorTemperature', 'Temperature', TemperatureSensor);

    this.setPrimary('indoorHumidity', 'Humidity', HumiditySensor);
  }

  //----------------------------------------------------------------------------

  public update(dataReport) {
    if (!utils.includesAll(Object.keys(dataReport), this.requiredData)) {
      throw new Error(`Update on ${this.accessoryId} requires data ${this.requiredData}`);
    } else {
      this.platform.log.debug(`Updating accessory ${this.accessoryId}`);
    }

    this.battery?.updateStatusLow(
      dataReport.wh25batt === '1',
      dataReport.dateutc,
    );

    this.dispatchUpdate(dataReport, 'update', 'indoorTemperature', 'tempinf');
    this.dispatchUpdate(dataReport, 'update', 'indoorHumidity', 'humidityin');
  }
}
