import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';
import { TemperatureSensor } from './../sensors/TemperatureSensor';
import { HumiditySensor } from './../sensors/HumiditySensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class HP2560 extends EcowittAccessory {
  static readonly properties: string[] = ['indoorTemperature', 'indoorHumidity'];

  protected temperature: TemperatureSensor | undefined;
  protected humidity: HumiditySensor | undefined;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly modelName: string,
  ) {
    super(platform, accessory, `${modelName}`, `Ecowitt Gateway (${modelName})`);

    this.requiredData = ['tempinf', 'humidityin'];
    this.optionalData = ['baromrelin', 'baromabsin'];

    const hideConfig = this.platform.config?.hidden || {};
    const hidden = Object.keys(hideConfig).filter(k => !!hideConfig[k]);

    if (!utils.includesAny(hidden, ['indoorTemperature', `${this.shortServiceId}:indoorTemperature`])) {
      const temperatureName = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:indoorTemperature`);
      this.temperature = new TemperatureSensor(platform, accessory,
        `${this.accessoryId}:indoorTemperature`, temperatureName || 'Temperature');
    } else {
      this.temperature = new TemperatureSensor(platform, accessory, `${this.accessoryId}:indoorTemperature`, 'Temperature');
      this.temperature.removeService();
      this.temperature = undefined;
    }

    if (!utils.includesAny(hidden, ['indoorHumidity', `${this.shortServiceId}:indoorHumidity`])) {
      const humidityName = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:indoorHumidity`);
      this.humidity = new HumiditySensor(platform, accessory, `${this.accessoryId}:indoorHumidity`, humidityName || 'Humidity');
    } else {
      this.humidity = new HumiditySensor(platform, accessory, `${this.accessoryId}:indoorHumidity`, 'Humidity');
      this.humidity.removeService();
      this.humidity = undefined;
    }
  }

  //----------------------------------------------------------------------------

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
