import { Service, PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';
import { TemperatureSensor } from './../sensors/TemperatureSensor';
import { HumiditySensor } from './../sensors/HumiditySensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class GW2000 extends EcowittAccessory {
  protected temperature: TemperatureSensor | undefined;
  protected humidity: HumiditySensor | undefined;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly model: string,
  ) {
    super(platform, accessory, `${model}`, `Ecowitt Gateway (${model})`);

    this.requiredData = ["tempinf", "humidityin"];
    this.optionalData = ["baromrelin", "baromabsin"];

    const hideConfig = this.platform.config?.hidden || {};
    const hidden = Object.keys(hideConfig).filter(k => !!hideConfig[k]);

    if (!utils.includesAny(hidden, ['temperature', `${this.accessoryId}:temperature`])) {
      const temperatureName = utils.lookup(this.platform.config?.nameOverrides, `${this.accessoryId}:temperature`);
      this.temperature = new TemperatureSensor(platform, accessory, `${this.accessoryId}:temperature`, temperatureName || 'Temperature');
    } else {
      this.temperature = new TemperatureSensor(platform, accessory, `${this.accessoryId}:temperature`, 'Temperature');
      this.temperature.removeService();
      this.temperature = undefined;
    }

    if (!utils.includesAny(hidden, ['humidity', `${this.accessoryId}:humidity`])) {
      const humidityName = utils.lookup(this.platform.config?.nameOverrides, `${this.accessoryId}:humidity`);
      this.humidity = new HumiditySensor(platform, accessory, `${this.accessoryId}:humidity`, humidityName || 'Humidity');
    } else {
      this.humidity = new HumiditySensor(platform, accessory, `${this.accessoryId}:humidity`, 'Humidity');
      this.humidity.removeService();
      this.humidity = undefined;
    }
  }

  public update(dataReport) {
    if (!utils.includesAll(Object.keys(dataReport), this.requiredData)) {
      throw new Error(`Update on ${this.accessoryId} requires data ${this.requiredData}`);
    } else {
      this.platform.log.debug(`Updating accessory ${this.accessoryId}`);
    }

    this.temperature?.update(
      parseFloat(dataReport.tempinf),
      dataReport.dateutc,
    );

    this.humidity?.update(
      parseFloat(dataReport.humidityin),
      dataReport.dateutc,
    );
  }
}
