import { Service, PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';
import { TemperatureSensor } from './../sensors/TemperatureSensor';
import { HumiditySensor } from './../sensors/HumiditySensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class WH25 extends EcowittAccessory {
  protected battery: Service;
  protected temperature: TemperatureSensor | undefined;
  protected humidity: HumiditySensor | undefined;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory, 'WH25', 'Indoor Thermo Hygro Baro Sensor (WH25)');

    this.requiredData = ['wh25batt', 'tempinf', 'humidityin'];
    this.optionalData = ['baromrelin', 'baromabsin'];

    this.battery = this.addBattery('', false);

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

  //----------------------------------------------------------------------------

  public update(dataReport) {
    if (!utils.includesAll(Object.keys(dataReport), this.requiredData)) {
      throw new Error(`Update on ${this.accessoryId} requires data ${this.requiredData}`);
    } else {
      this.platform.log.debug(`Updating accessory ${this.accessoryId}`);
    }

    const lowBattery = dataReport.wh25batt === '1';
    this.updateStatusLowBattery(this.battery, lowBattery);

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
