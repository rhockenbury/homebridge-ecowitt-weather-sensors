import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';
import { TemperatureSensor } from './../sensors/TemperatureSensor';
import { HumiditySensor } from './../sensors/HumiditySensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class BASE extends EcowittAccessory {
  static readonly properties = ['indoorTemperature', 'indoorHumidity'];

  protected indoorTemperature: TemperatureSensor | undefined;
  protected indoorHumidity: HumiditySensor | undefined;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly modelName: string,
  ) {
    super(platform, accessory, 'BASE', `${modelName} Gateway`);

    this.requiredData = ['tempinf', 'humidityin'];
    this.unusedData = ['baromrelin', 'baromabsin'];

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

    this.dispatchUpdate(dataReport, 'update', 'indoorTemperature', 'tempinf');
    this.dispatchUpdate(dataReport, 'update', 'indoorHumidity', 'humidityin');
  }
}
